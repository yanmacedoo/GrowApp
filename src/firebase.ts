import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Credenciais Reais do GrowApp
const firebaseConfig = {
  apiKey: "AIzaSyBo1Q504zH6vbs6pymVp2YkIzcv_HqHKYo",
  authDomain: "growapp-a711a.firebaseapp.com",
  projectId: "growapp-a711a",
  storageBucket: "growapp-a711a.firebasestorage.app",
  messagingSenderId: "1001149761822",
  appId: "1:1001149761822:web:f891676a7720bb201de10f"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
