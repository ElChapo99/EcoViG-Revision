import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import bundledConfig from '../../firebase-applet-config.json';

// Public Firebase web client configuration (safe for browser distribution)
const firebaseConfig = {
  apiKey: (import.meta.env?.VITE_FIREBASE_API_KEY as string) || bundledConfig.apiKey,
  authDomain: (import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN as string) || bundledConfig.authDomain,
  projectId: (import.meta.env?.VITE_FIREBASE_PROJECT_ID as string) || bundledConfig.projectId,
  storageBucket: (import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET as string) || bundledConfig.storageBucket,
  messagingSenderId: (import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || bundledConfig.messagingSenderId,
  appId: (import.meta.env?.VITE_FIREBASE_APP_ID as string) || bundledConfig.appId,
  firestoreDatabaseId: (import.meta.env?.VITE_FIREBASE_DATABASE_ID as string) || bundledConfig.firestoreDatabaseId,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const storage = getStorage(app);
