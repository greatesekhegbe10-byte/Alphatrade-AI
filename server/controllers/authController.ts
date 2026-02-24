import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { AuthRequest } from '../middleware/auth';

export const signup = async (req: AuthRequest, res: Response) => {
  const { name, email } = req.body;
  const firebaseUser = req.user;

  if (!firebaseUser) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    if (!db) {
      // Fallback if DB is not available
      return res.status(200).json({
        id: firebaseUser.id,
        email: firebaseUser.email,
        role: 'USER',
        tier: 'BASIC',
        subscription: { isActive: true, tier: 'BASIC' }
      });
    }
    
    let userDoc;
    let userRef;
    try {
      userRef = db.collection('users').doc(firebaseUser.id);
      userDoc = await userRef.get();
    } catch (dbError: any) {
      console.error('[AUTH_CONTROLLER] Firestore Error:', dbError.message);
      return res.status(200).json({
        id: firebaseUser.id,
        email: firebaseUser.email,
        role: 'USER',
        tier: 'BASIC',
        subscription: { isActive: true, tier: 'BASIC' }
      });
    }

    if (userDoc.exists) {
      return res.status(200).json(userDoc.data());
    }

    const newUser = {
      id: firebaseUser.id,
      name: name || firebaseUser.email.split('@')[0],
      email: firebaseUser.email.toLowerCase(),
      role: 'USER',
      tier: 'BASIC',
      joinedAt: Date.now(),
      subscription: {
        tier: 'BASIC',
        startDate: Date.now(),
        expiryDate: 253402300799000, // Year 9999
        isActive: true,
        autoRenew: true
      }
    };

    await userRef.set(newUser);
    res.status(201).json(newUser);
  } catch (error) {
    console.error('[AUTH_CONTROLLER] Signup Sync Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  const firebaseUser = req.user;

  if (!firebaseUser) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    if (!db) {
      return res.json({
        id: firebaseUser.id,
        email: firebaseUser.email,
        role: 'USER',
        tier: 'BASIC',
        subscription: { isActive: true, tier: 'BASIC' }
      });
    }

    let userDoc;
    let userRef;
    try {
      userRef = db.collection('users').doc(firebaseUser.id);
      userDoc = await userRef.get();
    } catch (dbError: any) {
      console.error('[AUTH_CONTROLLER] Login Firestore Error:', dbError.message);
      return res.json({
        id: firebaseUser.id,
        email: firebaseUser.email,
        role: 'USER',
        tier: 'BASIC',
        subscription: { isActive: true, tier: 'BASIC' }
      });
    }

    if (!userDoc.exists) {
      // If user exists in Firebase Auth but not in our DB, create them
      const newUser = {
        id: firebaseUser.id,
        name: firebaseUser.email.split('@')[0],
        email: firebaseUser.email.toLowerCase(),
        role: 'USER',
        tier: 'BASIC',
        joinedAt: Date.now(),
        subscription: {
          tier: 'BASIC',
          startDate: Date.now(),
          expiryDate: 253402300799000,
          isActive: true,
          autoRenew: true
        }
      };
      await userRef.set(newUser);
      return res.json(newUser);
    }

    res.json(userDoc.data());
  } catch (error) {
    console.error('[AUTH_CONTROLLER] Login Sync Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const verifySession = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  
  try {
    if (!db) {
      return res.json({
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        tier: req.user.tier,
        subscription: { isActive: true, tier: req.user.tier }
      });
    }
    
    let userDoc;
    try {
      userDoc = await db.collection('users').doc(req.user.id).get();
    } catch (dbError: any) {
      console.error('[AUTH_CONTROLLER] VerifySession Firestore Error:', dbError.message);
      return res.json({
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        tier: req.user.tier,
        subscription: { isActive: true, tier: req.user.tier }
      });
    }
    
    const user = userDoc.data();
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const logout = (req: Request, res: Response) => {
  res.json({ message: 'Logged out successfully' });
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
  if (!db) return res.status(503).json({ error: 'Database service unavailable.' });

  try {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map(doc => doc.data());
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUserTier = async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
  if (!db) return res.status(503).json({ error: 'Database service unavailable.' });

  const { email, tier } = req.body;

  try {
    // Find user by email since we might not have ID
    const snapshot = await db.collection('users').where('email', '==', email.toLowerCase()).limit(1).get();
    if (snapshot.empty) return res.status(404).json({ error: 'User not found' });
    
    const userRef = snapshot.docs[0].ref;
    await userRef.update({ 
      tier,
      'subscription.tier': tier,
      'subscription.isActive': true
    });
    res.json({ message: 'User tier updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
