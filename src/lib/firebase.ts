import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// (Optional) import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCYiRVi5FSR5dxjLanAcMDVCfde510dF_Y",
  authDomain: "customer-bingo.firebaseapp.com",
  projectId: "customer-bingo",
  storageBucket: "customer-bingo.appspot.com", // ← fix this line
  messagingSenderId: "405142355392",
  appId: "1:405142355392:web:7811ff5a70f1ecd94e9c25",
  measurementId: "G-JMPS1G6W1S"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Optional: const analytics = getAnalytics(app);
export const db = getFirestore(app);
