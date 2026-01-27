
import { User, AuthResponse, SubscriptionTier, SubscriptionDetails } from '../types';

const STORAGE_KEYS = {
  USERS: 'nexus_user_registry',
  SESSION: 'nexus_session_token'
};

const ADMIN_PASSCODE_HASH = "09162502987";

const generateHardwareId = (): string => {
  const n = window.navigator;
  const screen = window.screen;
  const data = `${n.userAgent}-${n.language}-${screen.width}x${screen.height}-${n.hardwareConcurrency}`;
  return btoa(data).slice(0, 32);
};

const hashPassword = (password: string): string => {
  return btoa(`SALT_2025_${password}`).split('').reverse().join('');
};

const generateId = () => `USR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
const generateToken = (userId: string) => `JWT.${btoa(userId)}.${Date.now()}`;

const getDefaultSubscription = (tier: SubscriptionTier = 'BASIC'): SubscriptionDetails => ({
  tier,
  startDate: Date.now(),
  expiryDate: tier === 'BASIC' ? Infinity : Date.now() + (30 * 24 * 60 * 60 * 1000),
  autoRenew: true,
  isActive: true
});

export const authService = {
  signup: async (name: string, email: string, pass: string): Promise<AuthResponse> => {
    const registry = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const hwid = generateHardwareId();
    
    if (registry.find((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("Email linked to another node.");
    }

    // Fix: Added missing watchlist property
    const newUser: User = {
      id: generateId(),
      name,
      email: email.toLowerCase(),
      role: 'USER',
      verified: true,
      joinedAt: Date.now(),
      tier: 'BASIC',
      hardwareId: hwid,
      acceptedLegal: false,
      watchlist: [],
      subscription: getDefaultSubscription('BASIC')
    };

    const userWithPass = { ...newUser, password: hashPassword(pass) };
    registry.push(userWithPass);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(registry));

    const token = generateToken(newUser.id);
    localStorage.setItem(STORAGE_KEYS.SESSION, token);

    return { user: newUser, token };
  },

  login: async (email: string, pass: string): Promise<AuthResponse> => {
    const hwid = generateHardwareId();
    
    if (email === "admin@alphatrade.ai" && pass === "admin123") {
      // Fix: Added missing watchlist property
      const admin: User = { 
        id: "sys_admin", 
        email, 
        name: "Overseer", 
        role: "ADMIN", 
        verified: true, 
        joinedAt: 1700000000, 
        tier: 'INSTITUTIONAL', 
        hardwareId: hwid, 
        acceptedLegal: true,
        watchlist: [],
        subscription: getDefaultSubscription('INSTITUTIONAL')
      };
      return { user: admin, token: generateToken(admin.id) };
    }

    const registry = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const user = registry.find((u: any) => u.email === email.toLowerCase());

    if (!user || user.password !== hashPassword(pass)) {
      throw new Error("Invalid credentials.");
    }

    if (user.role !== 'ADMIN' && user.hardwareId && user.hardwareId !== hwid) {
      throw new Error("ACCESS_DENIED: Machine ID Mismatch. Account locked to another device.");
    }

    const token = generateToken(user.id);
    localStorage.setItem(STORAGE_KEYS.SESSION, token);

    const { password, ...userWithoutPass } = user;
    return { user: userWithoutPass as User, token };
  },

  acceptLegal: (userId: string) => {
    const registry = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const idx = registry.findIndex((u: any) => u.id === userId);
    if (idx !== -1) {
      registry[idx].acceptedLegal = true;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(registry));
    }
  },

  verifySession: async (): Promise<User | null> => {
    const token = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!token) return null;
    const hwid = generateHardwareId();

    try {
      const userId = atob(token.split('.')[1]);
      const registry = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const user = registry.find((u: any) => u.id === userId);

      if (user) {
        if (user.role !== 'ADMIN' && user.hardwareId !== hwid) {
          localStorage.removeItem(STORAGE_KEYS.SESSION);
          return null;
        }
        return user;
      }
    } catch (e) {}
    return null;
  },

  getAllUsers: (): User[] => {
    const registry = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    return registry.map(({ password, ...user }: any) => user as User);
  },

  updateUserSubscription: (userId: string, tier: SubscriptionTier, isActive: boolean = true) => {
    const registry = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const idx = registry.findIndex((u: any) => u.id === userId);
    if (idx !== -1) {
      registry[idx].tier = tier;
      registry[idx].subscription = {
        ...getDefaultSubscription(tier),
        isActive,
        startDate: registry[idx].subscription?.startDate || Date.now()
      };
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(registry));
    }
  },

  verifyAdminPasscode: (p: string) => p === ADMIN_PASSCODE_HASH,
  
  logout: () => localStorage.removeItem(STORAGE_KEYS.SESSION)
};
