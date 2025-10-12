// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { initializeAuth, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // your config
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with web-compatible persistence
const auth = initializeAuth(app, {
  persistence: browserLocalPersistence
});

const db = getFirestore(app);

// Only initialize messaging if supported
let messaging = null;
if (typeof window !== 'undefined') {
  import('firebase/messaging').then(async ({ getMessaging, isSupported }) => {
    if (await isSupported()) {
      messaging = getMessaging(app);
    }
  });
}

export { app, auth, db, messaging };