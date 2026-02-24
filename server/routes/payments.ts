import { Router } from 'express';
import { handleWebhook, verifyTransaction } from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Webhooks are usually POST and don't have auth (verified by signature)
router.post('/webhook', handleWebhook);

// Client-side verification call
router.post('/verify', authenticate, verifyTransaction);

export default router;
