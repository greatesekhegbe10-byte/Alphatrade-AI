import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const initializeFirebase = () => {
  if (admin.apps.length > 0) return admin.app();

  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (projectId && clientEmail && privateKey) {
      // Basic validation of the private key format
      if (!privateKey.includes('BEGIN PRIVATE KEY')) {
        console.error('[FIREBASE] Invalid private key format. It should contain "BEGIN PRIVATE KEY".');
      }

      console.log('[FIREBASE] Initializing with provided credentials for project:', projectId);
      return admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        projectId, // Explicitly set projectId
      });
    } else {
      console.warn('[FIREBASE] Missing credentials (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY).');
      
      // Only try default initialization if we are NOT in a production-like environment
      // or if we explicitly want to try it.
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.K_SERVICE) {
        try {
          console.log('[FIREBASE] Attempting default initialization...');
          return admin.initializeApp();
        } catch (e: any) {
          console.error('[FIREBASE] Default initialization failed:', e.message);
          return null;
        }
      }
      return null;
    }
  } catch (error: any) {
    console.error('[FIREBASE] Initialization Error:', error.message);
    return null;
  }
};

const app = initializeFirebase();
export const db = app ? app.firestore() : null;
export const auth = admin.auth();
export default admin;
