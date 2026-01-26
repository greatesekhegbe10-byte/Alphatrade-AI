
import { Transaction, PaymentGateway, SubscriptionTier, User } from '../types';

/**
 * ALPHA-FINTECH SECURE PAYMENT ENGINE (PRO-DURABLE v7.0)
 * 
 * CORE FIX: Resolves "Unexpected token < in JSON" error by:
 * 1. Verifying 'Content-Type: application/json' before parsing.
 * 2. Providing descriptive error messages when the server returns HTML (404/500).
 * 3. Enforcing strict JSON response structure for Gateway handshakes.
 */

// In production, this should be your actual API endpoint.
const API_BASE_URL = window.location.origin;

/**
 * Robust JSON Fetcher
 * Prevents crashing when backend returns HTML error pages.
 */
const secureFetch = async (url: string, options: RequestInit) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Accept': 'application/json',
    },
  });

  const contentType = response.headers.get('content-type');
  
  // If the server didn't return JSON, it's likely an HTML error page (404/500)
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    console.error(`[PAYMENT-ERROR] Expected JSON but received:`, text.substring(0, 100));
    throw new Error(`Server Error: Received an invalid response format (HTML instead of JSON). Status: ${response.status}`);
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Gateway returned status ${response.status}`);
  }

  return data;
};

export const paymentService = {
  /**
   * INITIALIZE
   * Hits the backend to create a real session with Paystack/Flutterwave.
   */
  initialize: async (
    user: User, 
    gateway: PaymentGateway, 
    tier: SubscriptionTier, 
    usdAmount: number
  ): Promise<{ authUrl: string, reference: string }> => {
    
    console.log(`[PAYMENT-INIT] Initiating Secure ${gateway} Handshake...`);

    try {
      const data = await secureFetch(`${API_BASE_URL}/api/payment/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          amount: usdAmount,
          gateway: gateway,
          tier: tier,
          userId: user.id,
          currency: 'USD'
        })
      });

      // Strict validation of the JSON contract
      const authUrl = data.data?.authorization_url || data.data?.link;
      const reference = data.data?.reference || data.data?.tx_ref;

      if (!authUrl || !authUrl.startsWith('http')) {
        throw new Error("Handshake Failed: Backend provided an invalid or missing Authorization URI.");
      }

      return { authUrl, reference };
    } catch (error: any) {
      // Re-throw with clarity
      if (error.message.includes('Unexpected token')) {
        throw new Error("Protocol Error: The server returned HTML. Ensure your /api/payment/initialize endpoint is active and returns JSON.");
      }
      throw error;
    }
  },

  /**
   * VERIFY
   * Polling verification from the backend ledger.
   */
  verify: async (reference: string): Promise<Transaction | null> => {
    try {
      const data = await secureFetch(`${API_BASE_URL}/api/payment/verify?reference=${reference}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (data.status === 'success' && data.data) {
        return data.data as Transaction;
      }
      
      return null;
    } catch (error) {
      console.error("[VERIFY-ERROR]", error);
      return null;
    }
  }
};
