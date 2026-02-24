import { BacktestResult } from '../types';
import { auth } from '../src/firebase';
import { getIdToken } from 'firebase/auth';

const getHeaders = async () => {
  const user = auth.currentUser;
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (user) {
    const token = await getIdToken(user, true);
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const strategyService = {
  getHistory: async (): Promise<any[]> => {
    const headers = await getHeaders();
    const response = await fetch('/api/strategies/history', { headers });
    if (!response.ok) throw new Error('Failed to fetch backtest history');
    return await response.json();
  },

  saveResult: async (result: any): Promise<any> => {
    const headers = await getHeaders();
    const response = await fetch('/api/strategies/save', {
      method: 'POST',
      headers,
      body: JSON.stringify(result)
    });
    if (!response.ok) throw new Error('Failed to save backtest result');
    return await response.json();
  }
};
