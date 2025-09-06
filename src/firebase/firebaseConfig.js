// src/firebase/firebaseConfig.js

import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
    
const firebaseConfig = {
  apiKey: "AIzaSyAs0ieY1w5PTnzEQ7vQd4WWqBmmZcOYjpA",
  authDomain: "community-qna-forum.firebaseapp.com",
  projectId: "community-qna-forum",
  storageBucket: "community-qna-forum.firebasestorage.app",
  messagingSenderId: "29113091623",
  appId: "1:29113091623:web:77be1cf82dfb34c79af002",
  measurementId: "G-TDRQM9EH2Q"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
