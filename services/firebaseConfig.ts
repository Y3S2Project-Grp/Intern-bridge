// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyATjH8S9YITSnhxBqkZxQ08iZOdGHomCg0",
  authDomain: "reactnative-dd3b9.firebaseapp.com",
  projectId: "reactnative-dd3b9",
  storageBucket: "reactnative-dd3b9.firebasestorage.app",
  messagingSenderId: "544123570650",
  appId: "1:544123570650:web:a63d88a54dbd32558bd8e3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export commonly used Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;