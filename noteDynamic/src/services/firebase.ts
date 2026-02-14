// Firebase configuration and initialization
// Uses environment variables from .env file

import { initializeApp, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseConfig, validateFirebaseConfig } from '../config/firebase';

// Validate configuration before initialization
if (!validateFirebaseConfig()) {
  console.warn(
    '[Firebase] Invalid or missing Firebase configuration. ' +
    'Please check your .env file and ensure all required fields are set.'
  );
}

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

// Only initialize if not already initialized
if (!app) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

export { app, auth, db, storage };

// Auth helper functions
export const signInWithEmail = async (email: string, password: string) => {
  const { signInWithEmailAndPassword } = await import('firebase/auth');
  return signInWithEmailAndPassword(auth, email, password);
};

export const signUpWithEmail = async (email: string, password: string) => {
  const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential;
};

export const updateUserProfile = async (displayName: string, photoURL?: string) => {
  const { updateProfile } = await import('firebase/auth');
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName, photoURL: photoURL || null });
  }
};

export const signOutUser = async () => {
  const { signOut } = await import('firebase/auth');
  return signOut(auth);
};

// Firestore helper functions
export const createDocument = async (
  collectionName: string,
  data: Record<string, unknown>,
  docId?: string
) => {
  const { setDoc, doc, collection, addDoc } = await import('firebase/firestore');

  if (docId) {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, { ...data, createdAt: new Date().toISOString() });
    return docId;
  } else {
    const colRef = collection(db, collectionName);
    const docRef = await addDoc(colRef, { ...data, createdAt: new Date().toISOString() });
    return docRef.id;
  }
};

export const getDocuments = async (collectionName: string, userId?: string) => {
  const { collection, query, where, getDocs, orderBy } = await import('firebase/firestore');

  const colRef = collection(db, collectionName);
  let q = query(colRef, orderBy('updatedAt', 'desc'));

  if (userId) {
    q = query(colRef, where('userId', '==', userId), orderBy('updatedAt', 'desc'));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const updateDocument = async (
  collectionName: string,
  docId: string,
  data: Record<string, unknown>
) => {
  const { doc, updateDoc } = await import('firebase/firestore');
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
};

export const deleteDocument = async (collectionName: string, docId: string) => {
  const { doc, deleteDoc } = await import('firebase/firestore');
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
};
