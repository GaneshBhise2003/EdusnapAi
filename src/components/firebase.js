// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Import Auth for Firebase Authentication
import { getFirestore } from "firebase/firestore"; // Import Firestore
import { getStorage } from "firebase/storage"; // Import Storage

const firebaseConfig = {
  apiKey: "AIzaSyABpeDho9MIpYvnuHQ_ltvw9hj6yfspVCo",
  authDomain: "aihelper-7e3c4.firebaseapp.com",
  projectId: "aihelper-7e3c4",
  storageBucket: "aihelper-7e3c4.firebasestorage.app",
  messagingSenderId: "487588317355",
  appId: "1:487588317355:web:e4285f4c26b82c11438fee",
  measurementId: "G-SJ6Q4DXMPM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth, Firestore, and Storage
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
