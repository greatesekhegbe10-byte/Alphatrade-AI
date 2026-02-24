import { Router } from 'express';
import { getSignals, getMarketHUD, getSignalHistory } from '../controllers/signalController';
import { authenticate, requireSubscription } from '../middleware/auth';
import { signalLimiter } from '../middleware/rateLimit';

const router = Router();

router.post('/analyze', authenticate, requireSubscription, signalLimiter, getSignals);
router.post('/hud', authenticate, requireSubscription, getMarketHUD);
router.get('/history', authenticate, getSignalHistory);

export default router;
