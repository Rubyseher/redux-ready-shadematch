import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
  type Auth,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

if (isConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
}

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => {
  if (!auth) throw new Error("Firebase not configured");
  return signInWithPopup(auth, googleProvider);
};
export const loginWithEmail = (email: string, password: string) => {
  if (!auth) throw new Error("Firebase not configured");
  return signInWithEmailAndPassword(auth, email, password);
};
export const signUpWithEmail = (email: string, password: string) => {
  if (!auth) throw new Error("Firebase not configured");
  return createUserWithEmailAndPassword(auth, email, password);
};
export const logout = () => {
  if (!auth) throw new Error("Firebase not configured");
  return signOut(auth);
};

export { auth, isConfigured, onAuthStateChanged, type User };
