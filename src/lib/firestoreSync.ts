import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

export function sanitizeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore);
  }
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned;
  }
  return obj;
}

let seedInitializationPromise: Promise<void> | null = null;

export async function ensureDatabaseInitialized(seedDataMap: Record<string, any[]>, singletonDataMap?: Record<string, any>) {
  if (seedInitializationPromise) return seedInitializationPromise;

  seedInitializationPromise = (async () => {
    try {
      const initDocRef = doc(db, 'system', 'initialized');
      const initSnap = await getDoc(initDocRef);

      if (!initSnap.exists()) {
        console.log('Database not yet initialized in cloud. Performing initial seed...');
        for (const [colName, items] of Object.entries(seedDataMap)) {
          if (Array.isArray(items) && items.length > 0) {
            for (const item of items) {
              if (item && item.id) {
                const cleanItem = sanitizeForFirestore(item);
                await setDoc(doc(db, colName, String(item.id)), cleanItem, { merge: true });
              }
            }
          }
        }
        if (singletonDataMap) {
          for (const [path, data] of Object.entries(singletonDataMap)) {
            if (data) {
              const cleanData = sanitizeForFirestore(data);
              await setDoc(doc(db, path), cleanData, { merge: true });
            }
          }
        }
        await setDoc(initDocRef, {
          initialized: true,
          initializedAt: new Date().toISOString(),
        });
        console.log('Database initial seed complete.');
      }
    } catch (err) {
      console.warn('Database seed initialization notice:', err);
    }
  })();

  return seedInitializationPromise;
}

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
    (snapshot) => {
      if (onStatusChange) {
        onStatusChange({
          hasPendingWrites: snapshot.metadata.hasPendingWrites,
          fromCache: snapshot.metadata.fromCache,
        });
      }

      const items: T[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as T);
      });
      onUpdate(items);
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
    (snapshot) => {
      if (onStatusChange) {
        onStatusChange({
          hasPendingWrites: snapshot.metadata.hasPendingWrites,
          fromCache: snapshot.metadata.fromCache,
        });
      }

      if (snapshot.exists()) {
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
    const cleanItem = sanitizeForFirestore(item);
    await setDoc(doc(db, collectionName, String(item.id)), cleanItem, { merge: true });
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
    const cleanData = sanitizeForFirestore(data);
    await setDoc(docRef, cleanData, { merge: true });
  } catch (error) {
    console.warn(`Singleton write notice for ${docPath}:`, error);
    if (navigator.onLine) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  }
}

