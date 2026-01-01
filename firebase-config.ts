import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, Analytics } from 'firebase/analytics';

// Your Firebase configuration object
// Using environment variables for security (recommended)
// Falls back to direct values if env vars are not set
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC7SUsbQNX9NilTeellKMDlW5YVX2VBwAU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "pokewalker-tracker.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "pokewalker-tracker",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "pokewalker-tracker.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "559484610342",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:559484610342:web:bb5ec3b50ffd92aaa1c3e7",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-3GM2BZN5SS"
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth: Auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db: Firestore = getFirestore(app);

// Initialize Analytics (only in browser environment)
let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Analytics initialization failed:', error);
  }
}
export { analytics };

export default app;

