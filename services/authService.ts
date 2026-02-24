import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  getIdToken
} from "firebase/auth";
import { auth } from "../src/firebase";
import { User, AuthResponse, SubscriptionTier } from '../types';

export const authService = {
  signup: async (name: string, email: string, pass: string): Promise<AuthResponse> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const idToken = await getIdToken(userCredential.user, true);
    
    // Sync with backend to create user profile in DB
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({ name, email })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup sync failed');
    }
    
    return await response.json();
  },

  login: async (email: string, pass: string): Promise<AuthResponse> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const idToken = await getIdToken(userCredential.user, true);
    
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({ email })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login sync failed');
    }
    
    return await response.json();
  },

  verifySession: async (): Promise<User | null> => {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const idToken = await getIdToken(user, true);
            const response = await fetch('/api/auth/session', {
              headers: { 'Authorization': `Bearer ${idToken}` }
            });
            if (!response.ok) resolve(null);
            resolve(await response.json());
          } catch (e) {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    });
  },

  logout: async () => {
    await signOut(auth);
    await fetch('/api/auth/logout', { method: 'POST' });
  },

  getAllUsers: async (): Promise<User[]> => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    const idToken = await getIdToken(user, true);
    
    const response = await fetch('/api/auth/users', {
      headers: { 'Authorization': `Bearer ${idToken}` }
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return await response.json();
  },

  updateUserTier: async (email: string, tier: SubscriptionTier): Promise<void> => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    const idToken = await getIdToken(user, true);

    const response = await fetch('/api/auth/users/tier', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({ email, tier })
    });
    if (!response.ok) throw new Error('Failed to update user tier');
  }
};
