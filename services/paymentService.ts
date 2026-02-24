import { Transaction, PaymentGateway, SubscriptionTier, User } from '../types';
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

/**
 * 🔒 ALPHA-FINTECH SECURE PAYMENT ARCHITECTURE
 * 
 * Direct SDK Integration for Low-Latency Execution.
 * Uses global window objects injected via index.html.
 */

declare global {
  interface Window {
    FlutterwaveCheckout: any;
    PaystackPop: any;
  }
}

const RATES = {
  USD_NGN: 1650,
  MIN_NGN: 1000
};

const STORAGE_KEY_TX = 'nexus_transaction_logs';

// 🛠️ HELPER: Dynamic Base URL Construction
const getBaseUrl = () => {
  const { protocol, host, pathname } = window.location;
  return `${protocol}//${host}${pathname}`;
};

// 🔑 KEYS CONFIGURATION
// Use provided Public Keys for client-side initiation
const VAULT = {
  PAYSTACK: {
    PUBLIC: 'pk_live_5cd9061dc23feea681bde61151e06200251bb359'
  },
  FLUTTERWAVE: {
    PUBLIC: 'FLWPUBK-2283d9d85c854253a59b635a730a2c8d-X'
  }
};

const recordTransaction = (tx: Transaction) => {
  const logs = JSON.parse(localStorage.getItem(STORAGE_KEY_TX) || '[]');
  logs.push(tx);
  localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(logs));
};

export const paymentService = {
  /**
   * 🚀 INITIATE DIRECT PAYMENT
   * Triggers the Payment Gateway Modal directly on the client.
   */
  initialize: async (
    user: User, 
    gateway: PaymentGateway, 
    tier: SubscriptionTier, 
    usdAmount: number,
    onModalClose?: () => void
  ): Promise<{ success: boolean; error?: string }> => {
    
    const txRef = `NEXUS-${gateway.substring(0,3)}-${Date.now()}-${user.id.slice(-4)}`.toUpperCase();
    const baseUrl = getBaseUrl();
    
    console.log(`[PAYMENT_NODE] Initializing ${gateway}: ${txRef}`);

    try {
      if (gateway === 'FLUTTERWAVE') {
        if (typeof window.FlutterwaveCheckout === 'undefined') {
           throw new Error("Flutterwave SDK not loaded. Check network.");
        }

        // Initialize Flutterwave
        window.FlutterwaveCheckout({
          public_key: VAULT.FLUTTERWAVE.PUBLIC,
          tx_ref: txRef,
          amount: usdAmount,
          currency: "USD",
          payment_options: "card,mobilemoney,ussd",
          redirect_url: baseUrl, // Auto-redirects with ?status=successful&tx_ref=...
          customer: {
            email: user.email,
            name: user.name || "Trader",
          },
          customizations: {
            title: `AlphaTrade ${tier}`,
            description: "Institutional Node Access",
            logo: "https://nexustrader.com/logo.png", // Replace with valid logo if available
          },
          meta: { tier, userId: user.id },
          onclose: function() {
            if (onModalClose) onModalClose();
          }
        });

        // Log PENDING
        recordTransaction({
          id: Math.random().toString(36).substr(2, 9),
          userId: user.id,
          userEmail: user.email,
          amount: usdAmount,
          currency: 'USD',
          gateway: 'FLUTTERWAVE',
          reference: txRef,
          status: 'PENDING',
          tier,
          timestamp: Date.now(),
          verificationSource: 'DIRECT_SDK'
        });

      } else if (gateway === 'PAYSTACK') {
        if (typeof window.PaystackPop === 'undefined') {
           throw new Error("Paystack SDK not loaded. Check network.");
        }

        const amountNGN = Math.ceil(usdAmount * RATES.USD_NGN);
        const amountKobo = amountNGN * 100;

        // Initialize Paystack
        const handler = window.PaystackPop.setup({
          key: VAULT.PAYSTACK.PUBLIC,
          email: user.email,
          amount: amountKobo,
          currency: 'NGN',
          ref: txRef,
          metadata: {
            custom_fields: [{ display_name: "Plan", value: tier }]
          },
          callback: function(response: any) {
            // Manual Redirect for Paystack to match Flutterwave behavior for App.tsx
            const redirectUrl = `${baseUrl}?trxref=${response.reference}&reference=${response.reference}`;
            window.location.href = redirectUrl;
          },
          onClose: function() {
            if (onModalClose) onModalClose();
          }
        });
        
        handler.openIframe();

        // Log PENDING
        recordTransaction({
          id: Math.random().toString(36).substr(2, 9),
          userId: user.id,
          userEmail: user.email,
          amount: amountNGN,
          currency: 'NGN',
          gateway: 'PAYSTACK',
          reference: txRef,
          status: 'PENDING',
          tier,
          timestamp: Date.now(),
          verificationSource: 'DIRECT_SDK'
        });
      }

      return { success: true };

    } catch (err: any) {
      console.error("Payment Init Error:", err);
      return { success: false, error: err.message || "Gateway handshake failed." };
    }
  },

  getAllTransactions: (): Transaction[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_TX) || '[]');
  },

  /**
   * 🔍 VERIFY TRANSACTION
   * Matches the URL params with the local ledger.
   */
  verify: async (reference: string, gateway: PaymentGateway): Promise<boolean> => {
    try {
      const headers = await getHeaders();
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers,
        body: JSON.stringify({ reference, gateway })
      });

      if (!response.ok) return false;
      
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('[PAYMENT_SERVICE] Verification Error:', error);
      return false;
    }
  }
};