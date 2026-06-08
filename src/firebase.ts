import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence, waitForPendingWrites } from 'firebase/firestore';
// @ts-ignore
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Improved persistence handling
enableIndexedDbPersistence(db)
  .then(() => console.log("Firestore persistence enabled successfully."))
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn("Multiple tabs open, persistence can only be enabled in one.");
    } else if (err.code === 'unimplemented') {
      console.warn("Browser doesn't support persistence.");
    } else {
      console.error("Firestore persistence error:", err);
    }
  });

export const auth = getAuth();
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/drive');

// Export a function to check connection status
export const checkFirestoreConnection = async () => {
    try {
        await waitForPendingWrites(db);
        return true;
    } catch (e) {
        console.error("Firestore connection check failed:", e);
        return false;
    }
};
