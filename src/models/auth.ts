// src/authModel.ts
import {auth} from '../utils/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential,
  updateProfile,
} from 'firebase/auth';

const googleProvider = new GoogleAuthProvider();

export async function loginWithEmail(email: string, password: string): Promise<UserCredential> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error: any) {
    throw new Error(`Login failed: ${error.message}`);
  }
}

export async function registerWithEmail(name: string, email: string, password: string): Promise<UserCredential> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    return userCredential;
  } catch (error: any) {
    throw new Error(`Registration failed: ${error.message}`);
  }
}

export async function loginWithGoogle(): Promise<UserCredential> {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    return userCredential;
  } catch (error: any) {
    throw new Error(`Google sign-in failed: ${error.message}`);
  }
}

export async function logout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(`Logout failed: ${error.message}`);
  }
}
