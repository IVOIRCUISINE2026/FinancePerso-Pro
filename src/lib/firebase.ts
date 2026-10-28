import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { OperationType, FirestoreErrorInfo } from '../types';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with long-polling for iframe compatibility
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);

let isLoggingInInternal = false;

export async function signInWithGoogle() {
  if (isLoggingInInternal) {
    return;
  }

  isLoggingInInternal = true;
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    return await signInWithPopup(auth, provider);
  } catch (error: any) {
    if (
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request' ||
      error?.code === 'auth/popup-blocked' ||
      error?.code === 'auth/network-request-failed' ||
      (error?.message && error.message.includes('Pending promise was never set'))
    ) {
      console.warn("Google sign-in popup closed, cancelled or network interrupted:", error?.code || error?.message);
    } else {
      console.warn("Google sign-in attempt did not succeed:", error?.code || error?.message);
    }
    throw error;
  } finally {
    isLoggingInInternal = false;
  }
}

export async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.warn("Sign out attempt encountered an issue:", error);
    throw error;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
