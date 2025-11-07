// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDW5ntQiR9cF-qZ9vOGY49P6hTOUhTPxdc",
  authDomain: "neurobet-ai.firebaseapp.com",
  databaseURL: "https://neurobet-ai-default-rtdb.firebaseio.com",
  projectId: "neurobet-ai",
  storageBucket: "neurobet-ai.firebasestorage.app",
  messagingSenderId: "793175611155",
  appId: "1:793175611155:web:10d91cb8d4fca30f6eece6",
  measurementId: "G-RPZZ9MPQTJ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// ✅ Add these unified exports
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);
export { app, analytics };
