import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { db } from '../config/firebase';

export const getJournalEntries = async (req: AuthRequest, res: Response) => {
  if (!db || !req.user) {
    return res.json([]); // Return empty journal if DB is down
  }

  try {
    const snapshot = await db.collection('users').doc(req.user.id).collection('journal')
      .orderBy('timestamp', 'desc')
      .get();

    const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(entries);
  } catch (error: any) {
    console.error('[JOURNAL_CONTROLLER] Fetch Error:', error.message);
    if (error.code === 5 || error.message?.includes('NOT_FOUND')) {
      return res.json([]); // Return empty journal if project/collection not found
    }
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
};

export const addJournalEntry = async (req: AuthRequest, res: Response) => {
  if (!db || !req.user) {
    return res.status(503).json({ error: 'Database service unavailable' });
  }

  const entry = req.body;

  try {
    const docRef = await db.collection('users').doc(req.user.id).collection('journal').add({
      ...entry,
      userId: req.user.id,
      userEmail: req.user.email,
      timestamp: entry.timestamp || Date.now()
    });

    res.status(201).json({ id: docRef.id, ...entry });
  } catch (error) {
    console.error('[JOURNAL_CONTROLLER] Add Error:', error);
    res.status(500).json({ error: 'Failed to add journal entry' });
  }
};

export const deleteJournalEntry = async (req: AuthRequest, res: Response) => {
  if (!db || !req.user) {
    return res.status(503).json({ error: 'Database service unavailable' });
  }

  const { id } = req.params;

  try {
    const docRef = db.collection('users').doc(req.user.id).collection('journal').doc(id as string);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    await docRef.delete();
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('[JOURNAL_CONTROLLER] Delete Error:', error);
    res.status(500).json({ error: 'Failed to delete journal entry' });
  }
};
