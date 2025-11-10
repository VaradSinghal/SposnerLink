// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDBR36laz60xNOxMO2SHfo_b3LDixL_x5s",
  authDomain: "sponsperlink.firebaseapp.com",
  projectId: "sponsperlink",
  storageBucket: "sponsperlink.firebasestorage.app",
  messagingSenderId: "388550282439",
  appId: "1:388550282439:web:6e055039fbc501f294c2e2",
  measurementId: "G-XDLJS1VY90"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
// Initialize Functions with region (us-central1 is default)
export const functions = getFunctions(app, 'us-central1');
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;

