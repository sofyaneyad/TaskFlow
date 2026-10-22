import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAHNmU-Q8H3fJI1d5FVQ1LONkoA0ttdJoI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "taskflow-30a5c.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "taskflow-30a5c",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "taskflow-30a5c.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "622510900970",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:622510900970:web:dea42660a22471a0da3993",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-QS0N56VE1J",
};

// Singleton pattern to prevent re-initializing in Next.js Hot Reload
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Initialize Firestore with experimentalForceLongPolling to ensure fast, reliable connections without WebSocket hangs
let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  });
} catch {
  firestoreDb = getFirestore(app);
}

export const db = firestoreDb;
export default app;
