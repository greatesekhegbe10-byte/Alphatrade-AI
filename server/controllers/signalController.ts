import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { analyzeMarket, getMarketSituationHUD } from '../services/geminiService';
import { detectPatterns } from '../services/patternDetectionService';
import { getNextHighImpactEvent } from '../services/newsService';
import { getTechnicalAnalysis } from '../services/technicalAnalysisService';
import { Candle, MarketType, Timeframe } from '../../types';
import { db } from '../config/firebase';

export const getSignals = async (req: AuthRequest, res: Response) => {
  const { 
    pair, 
    marketType, 
    timeframe, 
    candles, 
    personality, 
    accountBalance, 
    riskPercent 
  } = req.body;

  if (!pair || !candles || !marketType || !timeframe) {
    return res.status(400).json({ error: 'Missing analysis parameters' });
  }

  try {
    const patterns = detectPatterns(candles);
    const indicators = getTechnicalAnalysis(candles);
    const baseCurrency = pair.split('/')[0];
    const news = getNextHighImpactEvent(baseCurrency);
    
    const signal = await analyzeMarket(
      pair,
      candles,
      marketType as MarketType,
      timeframe as Timeframe,
      patterns,
      news,
      personality || 'BALANCED',
      accountBalance || 1000,
      riskPercent || 1,
      indicators
    );

    // Save to Firebase if DB is available and user is authenticated
    if (db && req.user) {
      try {
        await db.collection('users').doc(req.user.id).collection('signals').add({
          ...signal,
          userId: req.user.id,
          userEmail: req.user.email,
          createdAt: Date.now()
        });
      } catch (dbError) {
        console.error('[SIGNAL_CONTROLLER] DB Save Error:', dbError);
      }
    }

    res.json(signal);
  } catch (error) {
    console.error('[SIGNAL_CONTROLLER] Error:', error);
    res.status(500).json({ error: 'Failed to generate signal' });
  }
};

export const getSignalHistory = async (req: AuthRequest, res: Response) => {
  if (!db || !req.user) {
    return res.json([]); // Return empty history if DB is down
  }

  try {
    const snapshot = await db.collection('users').doc(req.user.id).collection('signals')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const signals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(signals);
  } catch (error: any) {
    console.error('[SIGNAL_CONTROLLER] History Error:', error.message);
    if (error.code === 5 || error.message?.includes('NOT_FOUND')) {
      return res.json([]); // Return empty history if project/collection not found
    }
    res.status(500).json({ error: 'Failed to fetch signal history' });
  }
};

export const getMarketHUD = async (req: AuthRequest, res: Response) => {
  const { pair, candles } = req.body;

  if (!pair || !candles) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    const situation = await getMarketSituationHUD(pair, candles);
    res.json(situation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get market situation' });
  }
};
