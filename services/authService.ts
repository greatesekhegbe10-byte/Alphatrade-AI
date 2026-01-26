
import { User, AuthResponse } from '../types';

/**
 * ALPHA-COMMAND AUTHENTICATION ENGINE
 * In a production environment, this module interacts with a 
 * Node/Express/Supabase backend. Here, we simulate the logic 
 * using a persistent LocalStorage registry and cryptographic hashing simulations.
 */

const STORAGE_KEYS = {
  USERS: 'nexus_user_registry',
  SESSION: 'nexus_session_token'
};

const ADMIN_PASSCODE_HASH = "09162502987";

// Helper to simulate password hashing
const hashPassword = (password: string): string => {
  // Production would use bcrypt.hash(password, 10)
  return btoa(`SALT_2025_${password}`).split('').reverse().join('');
};

// Helper to generate a unique user ID
const generateId = () => `USR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

// Helper to generate a JWT-like session token
const generateToken = (userId: string) => `JWT.${btoa(userId)}.${Date.now()}`;

export const authService = {
  /**
   * SIGNUP NODE
   * Creates a new unique account and hashes credentials.
   */
  signup: async (name: string, email: string, pass: string): Promise<AuthResponse> => {
    const registry = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    
    // Check if email exists
    if (registry.find((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("Email address is already linked to a Nexus Node.");
    }

    const newUser = {
      id: generateId(),
      name,
      email: email.toLowerCase(),
      password: hashPassword(pass),
      role: 'USER',
      verified: true,
      joinedAt: Date.now(),
      tier: 'BASIC'
    };

    registry.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(registry));

    const token = generateToken(newUser.id);
    localStorage.setItem(STORAGE_KEYS.SESSION, token);

    const { password, ...userWithoutPass } = newUser;
    return { user: userWithoutPass as User, token };
  },

  /**
   * LOGIN NODE
   * Verifies credentials against the hashed registry.
   */
  login: async (email: string, pass: string): Promise<AuthResponse> => {
    // Special Admin Bypass for development
    if (email === "admin@alphatrade.ai" && pass === "admin123") {
      const adminUser: User = { 
        id: "sys_admin_01", 
        email, 
        name: "Command Overseer",
        role: "ADMIN", 
        verified: true, 
        joinedAt: 1709164800000,
        tier: 'INSTITUTIONAL'
      };
      const token = generateToken(adminUser.id);
      localStorage.setItem(STORAGE_KEYS.SESSION, token);
      return { user: adminUser, token };
    }

    const registry = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const user = registry.find((u: any) => u.email === email.toLowerCase());

    if (!user || user.password !== hashPassword(pass)) {
      throw new Error("Authentication failed. Invalid identity or passcode.");
    }

    const token = generateToken(user.id);
    localStorage.setItem(STORAGE_KEYS.SESSION, token);

    const { password, ...userWithoutPass } = user;
    return { user: userWithoutPass as User, token };
  },

  /**
   * GOOGLE OAUTH SIMULATION
   */
  googleLogin: async (): Promise<AuthResponse> => {
    // Simulate Google Login Popup and identity retrieval
    await new Promise(r => setTimeout(r, 1500));
    
    const googleId = `G-${Math.random().toString(36).substr(2, 6)}`;
    const mockUser: User = {
      id: generateId(),
      name: "Google Trader",
      email: `google.${googleId}@gmail.com`,
      role: 'USER',
      verified: true,
      joinedAt: Date.now(),
      tier: 'BASIC'
    };

    const token = generateToken(mockUser.id);
    localStorage.setItem(STORAGE_KEYS.SESSION, token);
    return { user: mockUser, token };
  },

  /**
   * SESSION VERIFICATION
   * Checks if a user is already authenticated on this terminal.
   */
  verifySession: async (): Promise<User | null> => {
    const token = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!token) return null;

    try {
      const parts = token.split('.');
      const userId = atob(parts[1]);
      
      // Look for user in registry
      const registry = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const user = registry.find((u: any) => u.id === userId);

      if (user) {
        const { password, ...userWithoutPass } = user;
        return userWithoutPass as User;
      }
      
      // Fallback for special admin session
      if (userId === "sys_admin_01") {
        return { 
          id: "sys_admin_01", 
          email: "admin@alphatrade.ai", 
          name: "Command Overseer",
          role: "ADMIN", 
          verified: true, 
          joinedAt: 1709164800000,
          tier: 'INSTITUTIONAL'
        };
      }
    } catch (e) {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    }
    return null;
  },

  verifyAdminPasscode: (passcode: string): boolean => {
    return passcode === ADMIN_PASSCODE_HASH;
  },

  logout: async () => {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    sessionStorage.clear();
  }
};
