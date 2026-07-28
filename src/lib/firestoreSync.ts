import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

export function subscribeToCollection<T extends { id: string }>(
  collectionName: string,
  onUpdate: (items: T[]) => void,
  initialSeed?: T[],
  onStatusChange?: (status: { hasPendingWrites: boolean; fromCache: boolean }) => void
) {
  const colRef = collection(db, collectionName);

  const unsubscribe = onSnapshot(
    colRef,
    { includeMetadataChanges: true },
    async (snapshot) => {
      if (onStatusChange) {
        onStatusChange({
          hasPendingWrites: snapshot.metadata.hasPendingWrites,
          fromCache: snapshot.metadata.fromCache,
        });
      }

      if (snapshot.empty && initialSeed && initialSeed.length > 0 && navigator.onLine) {
        try {
          for (const item of initialSeed) {
            if (item.id) {
              await setDoc(doc(db, collectionName, String(item.id)), item);
            }
          }
        } catch (err) {
          console.warn(`Seeding notice for ${collectionName}:`, err);
        }
      } else if (!snapshot.empty) {
        const items: T[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as T);
        });
        onUpdate(items);
      }
    },
    (error) => {
      console.warn(`Firestore snapshot notice for ${collectionName}:`, error);
      if (navigator.onLine) {
        try {
          handleFirestoreError(error, OperationType.GET, collectionName);
        } catch (e) {
          console.warn('Handled Firestore get error:', e);
        }
      }
    }
  );

  return unsubscribe;
}

export function subscribeToDoc<T>(
  docPath: string,
  onUpdate: (data: T) => void,
  initialSeed?: T,
  onStatusChange?: (status: { hasPendingWrites: boolean; fromCache: boolean }) => void
) {
  const docRef = doc(db, docPath);

  const unsubscribe = onSnapshot(
    docRef,
    { includeMetadataChanges: true },
    async (snapshot) => {
      if (onStatusChange) {
        onStatusChange({
          hasPendingWrites: snapshot.metadata.hasPendingWrites,
          fromCache: snapshot.metadata.fromCache,
        });
      }

      if (!snapshot.exists() && initialSeed && navigator.onLine) {
        try {
          await setDoc(docRef, initialSeed);
        } catch (err) {
          console.warn(`Seeding notice for doc ${docPath}:`, err);
        }
      } else if (snapshot.exists()) {
        onUpdate(snapshot.data() as T);
      }
    },
    (error) => {
      console.warn(`Firestore snapshot notice for doc ${docPath}:`, error);
      if (navigator.onLine) {
        try {
          handleFirestoreError(error, OperationType.GET, docPath);
        } catch (e) {
          console.warn('Handled Firestore get error:', e);
        }
      }
    }
  );

  return unsubscribe;
}

export async function syncSaveDoc<T extends { id: string }>(
  collectionName: string,
  item: T
) {
  try {
    await setDoc(doc(db, collectionName, String(item.id)), item, { merge: true });
  } catch (error) {
    console.warn(`Save write notice for ${collectionName}/${item.id}:`, error);
    if (navigator.onLine) {
      handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${item.id}`);
    }
  }
}

export async function syncDeleteDoc(collectionName: string, id: string) {
  try {
    await deleteDoc(doc(db, collectionName, String(id)));
  } catch (error) {
    console.warn(`Delete write notice for ${collectionName}/${id}:`, error);
    if (navigator.onLine) {
      handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
    }
  }
}

export async function syncSaveSingleton<T>(docPath: string, data: T) {
  try {
    const docRef = doc(db, docPath);
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    console.warn(`Singleton write notice for ${docPath}:`, error);
    if (navigator.onLine) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  }
}
