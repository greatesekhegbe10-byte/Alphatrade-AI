import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { db } from '../config/firebase';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    tier: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Prioritize Authorization header over cookies
  const authHeader = req.headers.authorization;
  let token = '';
  
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split('Bearer ')[1];
  } else if (authHeader) {
    token = authHeader.split(' ')[1];
  } else {
    token = req.cookies?.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    // verifyIdToken handles expiration and signature verification
    console.log('[AUTH_MIDDLEWARE] Verifying token...');
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log('[AUTH_MIDDLEWARE] Token verified for UID:', decodedToken.uid);
    
    // Fetch user details from Firestore to get role and tier
    if (!db) {
      console.warn('[AUTH_MIDDLEWARE] Firestore DB not initialized. Using default user data.');
      req.user = {
        id: decodedToken.uid,
        email: decodedToken.email || '',
        role: 'USER',
        tier: 'BASIC'
      };
      return next();
    }

    console.log('[AUTH_MIDDLEWARE] Fetching user doc from Firestore...');
    let userData: any = null;
    try {
      const userDoc = await db.collection('users').doc(decodedToken.uid).get();
      userData = userDoc?.data();
      console.log('[AUTH_MIDDLEWARE] User data fetched:', userData ? 'Found' : 'Not Found');
    } catch (dbError: any) {
      console.error('[AUTH_MIDDLEWARE] Firestore Error:', dbError.message);
      if (dbError.code === 5 || dbError.message?.includes('NOT_FOUND')) {
        console.warn('[AUTH_MIDDLEWARE] Firestore project or collection not found. Proceeding with default user data.');
      } else {
        // Re-throw if it's not a NOT_FOUND error, or handle as needed
        console.warn('[AUTH_MIDDLEWARE] Non-critical Firestore error. Proceeding with default user data.');
      }
    }

    req.user = {
      id: decodedToken.uid,
      email: decodedToken.email || '',
      role: userData?.role || 'USER',
      tier: userData?.tier || 'BASIC'
    };
    
    next();
  } catch (error) {
    console.error('[AUTH_MIDDLEWARE] Token Verification Error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });

  if (!db) {
    console.warn('[AUTH_MIDDLEWARE] Firestore DB not initialized. Allowing request as BASIC.');
    // If it's a BASIC user and the feature requires subscription, we might still want to block.
    // But for now, let's just proceed to avoid blocking everyone if DB is down.
    return next();
  }

  try {
    let userData: any = null;
    try {
      const userDoc = await db.collection('users').doc(req.user.id).get();
      userData = userDoc?.data();
    } catch (dbError: any) {
      console.error('[AUTH_MIDDLEWARE] Subscription Check Firestore Error:', dbError.message);
      if (dbError.code === 5 || dbError.message?.includes('NOT_FOUND')) {
        return next(); // Proceed if DB is missing
      }
      throw dbError;
    }

    if (!userData || !userData.subscription?.isActive) {
      // If user is BASIC, we might still allow some things, but requireSubscription is usually for PRO
      // Let's check if they are BASIC in req.user (from authenticate middleware)
      if (req.user.tier === 'BASIC') {
        return res.status(403).json({ 
          error: 'Subscription required', 
          code: 'SUBSCRIPTION_EXPIRED' 
        });
      }
    }

    // Check expiry
    if (userData?.subscription?.expiryDate < Date.now()) {
      try {
        await db.collection('users').doc(req.user.id).update({ 'subscription.isActive': false });
      } catch (e) {}
      return res.status(403).json({ 
        error: 'Subscription expired', 
        code: 'SUBSCRIPTION_EXPIRED' 
      });
    }

    next();
  } catch (error) {
    console.error('[AUTH_MIDDLEWARE] Subscription Check Error:', error);
    // Be permissive if it's a Firestore connection issue
    next();
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  next();
};
