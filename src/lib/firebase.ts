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
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  serverTimestamp,
  type Firestore,
} from "firebase/firestore";

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
let db: Firestore | null = null;

if (isConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
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

// ─── Firestore: Outfit History ──────────────────────────────────
export interface OutfitRecord {
  id?: string;
  userId: string;
  clothType: string;
  detectedColor: string;
  detectedColorHex: string;
  gender: string;
  suggestions: { itemType: string; colorName: string; colorHex: string }[];
  usedAi: boolean;
  createdAt: any;
}

export const saveOutfit = async (data: Omit<OutfitRecord, "id" | "createdAt">) => {
  if (!db) throw new Error("Firebase not configured");
  return addDoc(collection(db, "outfits"), {
    ...data,
    createdAt: serverTimestamp(),
  });
};

export const subscribeToOutfits = (
  userId: string,
  callback: (outfits: OutfitRecord[]) => void
) => {
  if (!db) return () => {};
  const q = query(
    collection(db, "outfits"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const outfits = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as OutfitRecord));
    callback(outfits);
  }, (error) => {
    console.error("Firestore subscription error:", error);
    callback([]);
  });
};

export const deleteOutfit = async (outfitId: string) => {
  if (!db) throw new Error("Firebase not configured");
  return deleteDoc(doc(db, "outfits", outfitId));
};

export { auth, db, isConfigured, onAuthStateChanged, type User };
