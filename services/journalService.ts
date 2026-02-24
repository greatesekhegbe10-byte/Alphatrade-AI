import { JournalEntry } from '../types';
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

export const journalService = {
  getEntries: async (): Promise<JournalEntry[]> => {
    const headers = await getHeaders();
    const response = await fetch('/api/journal', { headers });
    if (!response.ok) throw new Error('Failed to fetch journal entries');
    return await response.json();
  },

  addEntry: async (entry: Partial<JournalEntry>): Promise<JournalEntry> => {
    const headers = await getHeaders();
    const response = await fetch('/api/journal', {
      method: 'POST',
      headers,
      body: JSON.stringify(entry)
    });
    if (!response.ok) throw new Error('Failed to add journal entry');
    return await response.json();
  },

  deleteEntry: async (id: string): Promise<void> => {
    const headers = await getHeaders();
    const response = await fetch(`/api/journal/${id}`, {
      method: 'DELETE',
      headers
    });
    if (!response.ok) throw new Error('Failed to delete journal entry');
  }
};
