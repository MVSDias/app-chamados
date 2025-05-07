
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyCp9sQoX1VFT9LzHj6SLZ53_KM2lgOlXL0",
  authDomain: "appchamados-947f1.firebaseapp.com",
  projectId: "appchamados-947f1",
  storageBucket: "appchamados-947f1.firebasestorage.app",
  messagingSenderId: "309808350134",
  appId: "1:309808350134:web:7938ca2ca4c71c15aa3717",
  measurementId: "G-JRQ3LMTCCQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage};
