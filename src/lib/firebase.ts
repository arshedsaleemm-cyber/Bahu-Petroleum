import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  enableMultiTabIndexedDbPersistence,
  enableIndexedDbPersistence,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Enable offline multi-tab persistence for real-time offline support
try {
  enableMultiTabIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      enableIndexedDbPersistence(db).catch((e) => {
        console.warn('Firestore single tab persistence notice:', e);
      });
    } else if (err.code === 'unimplemented') {
      console.warn('Firestore persistence not supported in this environment');
    }
  });
} catch (e) {
  console.warn('Firestore persistence setup warning:', e);
}

export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDoc(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    console.warn('Firestore connection notice:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  onAuthStateChanged,
  firebaseSignOut,
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
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

