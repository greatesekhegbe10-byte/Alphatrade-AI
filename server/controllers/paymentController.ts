import { Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../config/firebase';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || '';
const FLUTTERWAVE_SECRET = process.env.FLUTTERWAVE_SECRET_KEY || '';

export const handleWebhook = async (req: Request, res: Response) => {
  const signature = req.headers['x-paystack-signature'] || req.headers['verif-hash'];

  if (!signature) {
    return res.status(400).send('No signature');
  }

  // Verify Paystack Signature
  if (req.headers['x-paystack-signature']) {
    const hash = crypto.createHmac('sha512', PAYSTACK_SECRET).update(JSON.stringify(req.body)).digest('hex');
    if (hash !== signature) return res.status(401).send('Invalid signature');
    
    const event = req.body;
    if (event.event === 'charge.success') {
      await processSuccessfulPayment(event.data.customer.email, event.data.metadata.tier || 'PRO');
    }
  }

  // Verify Flutterwave Signature
  if (req.headers['verif-hash']) {
    if (signature !== process.env.PAYMENT_WEBHOOK_SECRET) return res.status(401).send('Invalid signature');
    
    const event = req.body;
    if (event['event.type'] === 'CARD_TRANSACTION' && event.status === 'successful') {
      await processSuccessfulPayment(event.customer.email, event.meta.tier || 'PRO');
    }
  }

  res.status(200).send('Webhook processed');
};

async function processSuccessfulPayment(email: string, tier: string) {
  try {
    if (!db) {
      console.error('[PAYMENT] Database service unavailable.');
      return;
    }
    const userRef = db.collection('users').doc(email.toLowerCase());
    const userDoc = await userRef.get();

    if (userDoc?.exists) {
      const expiryDate = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days
      await userRef?.update({
        tier: tier,
        'subscription.isActive': true,
        'subscription.tier': tier,
        'subscription.expiryDate': expiryDate,
        'subscription.startDate': Date.now()
      });
      console.log(`[PAYMENT] Subscription updated for ${email}`);
    }
  } catch (error) {
    console.error('[PAYMENT] Error processing successful payment:', error);
  }
}

export const verifyTransaction = async (req: Request, res: Response) => {
  const { reference, gateway } = req.body;

  if (!reference || !gateway) {
    return res.status(400).json({ error: 'Missing reference or gateway' });
  }

  try {
    // In a real app, you would call Paystack/Flutterwave API here
    // For this demo, we'll simulate a successful verification if the reference exists in our logs
    // or just return success for the demo flow.
    
    // Example Paystack verification:
    // const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
    //   headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` }
    // });
    // if (response.data.data.status === 'success') { ... }

    // Mocking success for demo purposes
    const email = "user@example.com"; // In reality, get this from the gateway response
    await processSuccessfulPayment(email, 'PRO');

    res.json({ success: true });
  } catch (error) {
    console.error('[PAYMENT_CONTROLLER] Verification Error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
};
