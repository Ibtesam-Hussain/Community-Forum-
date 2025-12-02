// // src/firebase/firebaseConfig.js

// import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage";
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
    

// //***********previous account configuration ******************/
// // const firebaseConfig = {
// //   apiKey: "AIzaSyAs0ieY1w5PTnzEQ7vQd4WWqBmmZcOYjpA",
// //   authDomain: "community-qna-forum.firebaseapp.com",
// //   projectId: "community-qna-forum",
// //   storageBucket: "community-qna-forum.firebasestorage.app",
// //   messagingSenderId: "29113091623",
// //   appId: "1:29113091623:web:77be1cf82dfb34c79af002",
// //   measurementId: "G-TDRQM9EH2Q"
// // };


// const firebaseConfig = {
//   apiKey: "AIzaSyCiXGm993YhsJQ-t8XiY4MCgfMx32GNqtI",
//   authDomain: "community-forum-4c659.firebaseapp.com",
//   projectId: "community-forum-4c659",
//   storageBucket: "community-forum-4c659.firebasestorage.app",
//   messagingSenderId: "759957685278",
//   appId: "1:759957685278:web:4f82361b76b27fd0515a0f",
//   measurementId: "G-1NRNCPLZPP"
// };

// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const db = getFirestore(app);
// const storage = getStorage(app);

// export { app, auth, db, storage };


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCiXGm993YhsJQ-t8XiY4MCgfMx32GNqtI",
  authDomain: "community-forum-4c659.firebaseapp.com",
  projectId: "community-forum-4c659",
  storageBucket: "community-forum-4c659.firebasestorage.app",
  messagingSenderId: "759957685278",
  appId: "1:759957685278:web:4f82361b76b27fd0515a0f",
  measurementId: "G-1NRNCPLZPP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };