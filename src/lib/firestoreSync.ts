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
  initialSeed?: T[]
) {
  const colRef = collection(db, collectionName);

  const unsubscribe = onSnapshot(
    colRef,
    async (snapshot) => {
      if (snapshot.empty && initialSeed && initialSeed.length > 0) {
        try {
          for (const item of initialSeed) {
            if (item.id) {
              await setDoc(doc(db, collectionName, String(item.id)), item);
            }
          }
        } catch (err) {
          console.warn(`Seeding error for ${collectionName}:`, err);
        }
      } else {
        const items: T[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as T);
        });
        onUpdate(items);
      }
    },
    (error) => {
      console.warn(`Firestore snapshot notice for ${collectionName}:`, error);
      handleFirestoreError(error, OperationType.GET, collectionName);
    }
  );

  return unsubscribe;
}

export function subscribeToDoc<T>(
  docPath: string,
  onUpdate: (data: T) => void,
  initialSeed?: T
) {
  const docRef = doc(db, docPath);

  const unsubscribe = onSnapshot(
    docRef,
    async (snapshot) => {
      if (!snapshot.exists() && initialSeed) {
        try {
          await setDoc(docRef, initialSeed);
        } catch (err) {
          console.warn(`Seeding error for doc ${docPath}:`, err);
        }
      } else if (snapshot.exists()) {
        onUpdate(snapshot.data() as T);
      }
    },
    (error) => {
      console.warn(`Firestore snapshot notice for doc ${docPath}:`, error);
      handleFirestoreError(error, OperationType.GET, docPath);
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
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${item.id}`);
  }
}

export async function syncDeleteDoc(collectionName: string, id: string) {
  try {
    await deleteDoc(doc(db, collectionName, String(id)));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
  }
}

export async function syncSaveSingleton<T>(docPath: string, data: T) {
  try {
    const docRef = doc(db, docPath);
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}
