import { Router } from 'express';
import { saveBacktestResult, getBacktestHistory } from '../controllers/strategyController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/history', authenticate, getBacktestHistory);
router.post('/save', authenticate, saveBacktestResult);

export default router;
