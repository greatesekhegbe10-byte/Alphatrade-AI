
import { User, UserRole } from '../types';

const ADMIN_PASSCODE_HASH = "09162502987";

export const authService = {
  login: async (email: string, pass: string): Promise<User | null> => {
    // Isolated logic for elevated privileges
    if (email === "admin@alphatrade.ai" && pass === "admin123") {
      return { 
        id: "sys_admin_01", 
        email, 
        role: "ADMIN", 
        verified: true, 
        joinedAt: 1709164800000 
      };
    }
    
    // Normal user logic
    if (pass.length >= 6) {
      return { 
        id: Math.random().toString(36).substr(2, 9), 
        email, 
        role: "USER", 
        verified: true, 
        joinedAt: Date.now() 
      };
    }
    return null;
  },

  verifyAdminPasscode: (passcode: string): boolean => {
    // Hardware-style secondary verification
    return passcode === ADMIN_PASSCODE_HASH;
  },

  logout: () => {
    // Clear all session states
    sessionStorage.clear();
  }
};
