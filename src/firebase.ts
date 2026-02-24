/// <reference types="vite/client" />
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if we have a valid-looking API key
const isValidConfig = firebaseConfig.apiKey && 
                     firebaseConfig.apiKey !== 'your_api_key' && 
                     !firebaseConfig.apiKey.startsWith('<');

let app: FirebaseApp | undefined;
let auth: Auth | any; // Use any to allow dummy object if needed

if (isValidConfig) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
} else {
  console.warn('[FIREBASE] Client-side configuration is missing or invalid. Authentication will be unavailable until VITE_FIREBASE_* environment variables are set.');
  // Provide a dummy auth object to prevent immediate crashes on import
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback: any) => {
      callback(null);
      return () => {};
    },
    signOut: async () => {},
  };
}

export { app, auth };
