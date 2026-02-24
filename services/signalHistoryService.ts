import { Signal } from '../types';
import { auth } from '../src/firebase';
import { getIdToken } from 'firebase/auth';

export const signalHistoryService = {
  getHistory: async (): Promise<Signal[]> => {
    const user = auth.currentUser;
    const headers: HeadersInit = {};
    if (user) {
      const token = await getIdToken(user, true);
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch('/api/signals/history', { headers });
    if (!response.ok) throw new Error('Failed to fetch signal history');
    return await response.json();
  }
};
