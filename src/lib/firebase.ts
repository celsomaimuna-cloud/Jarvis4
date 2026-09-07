import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, setDoc, doc, updateDoc, getDocs, limit, where } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAYNcmkQvmX_RbnZRflJMXBGWNEIk32xyI",
  authDomain: "durable-setting-0dtd0.firebaseapp.com",
  projectId: "durable-setting-0dtd0",
  storageBucket: "durable-setting-0dtd0.firebasestorage.app",
  messagingSenderId: "65631640179",
  appId: "1:65631640179:web:90cca301f9f3221722e806",
};

const app = initializeApp(firebaseConfig);
// Need to specify databaseId for this specific deployment pattern
export const db = getFirestore(app, "ai-studio-dcb6ef26-bbbc-4920-916e-b05be00a859c");

export { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, setDoc, doc, updateDoc, getDocs, limit, where };
