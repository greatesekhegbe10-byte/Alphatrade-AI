import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { db } from '../config/firebase';

export const saveBacktestResult = async (req: AuthRequest, res: Response) => {
  if (!db || !req.user) {
    return res.status(503).json({ error: 'Database service unavailable' });
  }

  const result = req.body;

  try {
    const docRef = await db.collection('users').doc(req.user.id).collection('backtests').add({
      ...result,
      userId: req.user.id,
      userEmail: req.user.email,
      createdAt: Date.now()
    });

    res.status(201).json({ id: docRef.id, ...result });
  } catch (error) {
    console.error('[STRATEGY_CONTROLLER] Save Error:', error);
    res.status(500).json({ error: 'Failed to save backtest result' });
  }
};

export const getBacktestHistory = async (req: AuthRequest, res: Response) => {
  if (!db || !req.user) {
    return res.json([]); // Return empty history if DB is down
  }

  try {
    const snapshot = await db.collection('users').doc(req.user.id).collection('backtests')
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();

    const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(results);
  } catch (error: any) {
    console.error('[STRATEGY_CONTROLLER] Fetch Error:', error.message);
    if (error.code === 5 || error.message?.includes('NOT_FOUND')) {
      return res.json([]); // Return empty history if project/collection not found
    }
    res.status(500).json({ error: 'Failed to fetch backtest history' });
  }
};
