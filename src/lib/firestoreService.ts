import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  runTransaction,
  writeBatch,
  type DocumentData,
  type UpdateData
} from 'firebase/firestore';
import { db } from './firebase';

// Collection names
export const COLLECTIONS = {
  CATEGORIES: 'categories',
  PRODUCTS: 'products',
  INVOICES: 'invoices',
  COUNTERS: 'counters',
} as const;

// Helper để get next ID từ counter
export async function getNextId(counterName: string): Promise<number> {
  const counterRef = doc(db, COLLECTIONS.COUNTERS, counterName);
  
  return runTransaction(db, async (transaction) => {
    const counterDoc = await transaction.get(counterRef);
    
    let nextId = 1;
    if (counterDoc.exists()) {
      nextId = (counterDoc.data().value || 0) + 1;
      transaction.update(counterRef, { value: nextId });
    } else {
      transaction.set(counterRef, { value: nextId });
    }
    
    return nextId;
  });
}

// Generic CRUD operations
export const firestoreService = {
  // Get all documents from a collection
  async getAll<T>(collectionName: string): Promise<T[]> {
    try {
      const q = query(collection(db, collectionName), orderBy('id', 'asc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
      } as T));
    } catch (error) {
      console.error(`Error getting documents from ${collectionName}:`, error);
      return [];
    }
  },

  // Get a single document by ID
  async getById<T>(collectionName: string, id: number): Promise<T | null> {
    try {
      const q = query(collection(db, collectionName));
      const querySnapshot = await getDocs(q);
      const docData = querySnapshot.docs.find(doc => doc.data().id === id);
      
      if (!docData) return null;
      
      return docData.data() as T;
    } catch (error) {
      console.error(`Error getting document ${id} from ${collectionName}:`, error);
      return null;
    }
  },

  // Create a new document
  async create<T extends { id: number }>(
    collectionName: string, 
    data: Omit<T, 'id'>,
    counterName: string
  ): Promise<T> {
    try {
      const id = await getNextId(counterName);
      const newData = {
        ...data,
        id,
      } as T;
      
      await addDoc(collection(db, collectionName), newData);
      return newData;
    } catch (error) {
      console.error(`Error creating document in ${collectionName}:`, error);
      throw error;
    }
  },

  // Update a document
  async update<T>(
    collectionName: string, 
    id: number, 
    data: Partial<T>
  ): Promise<T | null> {
    try {
      // Find the document by id field
      const q = query(collection(db, collectionName));
      const querySnapshot = await getDocs(q);
      const docToUpdate = querySnapshot.docs.find(doc => doc.data().id === id);
      
      if (!docToUpdate) {
        console.error(`Document with id ${id} not found in ${collectionName}`);
        return null;
      }
      
      const docRef = doc(db, collectionName, docToUpdate.id);
      await updateDoc(docRef, { ...data });
      
      const updatedDoc = await getDoc(docRef);
      return updatedDoc.data() as T;
    } catch (error) {
      console.error(`Error updating document ${id} in ${collectionName}:`, error);
      return null;
    }
  },

  // Delete a document
  async delete(collectionName: string, id: number): Promise<boolean> {
    try {
      // Find the document by id field
      const q = query(collection(db, collectionName));
      const querySnapshot = await getDocs(q);
      const docToDelete = querySnapshot.docs.find(doc => doc.data().id === id);
      
      if (!docToDelete) {
        console.error(`Document with id ${id} not found in ${collectionName}`);
        return false;
      }
      
      const docRef = doc(db, collectionName, docToDelete.id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error(`Error deleting document ${id} from ${collectionName}:`, error);
      return false;
    }
  },

  // Batch operations
  async batchUpdate(operations: Array<{
    collectionName: string;
    id: number;
    data: UpdateData<DocumentData>;
  }>): Promise<boolean> {
    try {
      const batch = writeBatch(db);
      
      for (const op of operations) {
        const q = query(collection(db, op.collectionName));
        const querySnapshot = await getDocs(q);
        const docToUpdate = querySnapshot.docs.find(doc => doc.data().id === op.id);
        
        if (docToUpdate) {
          const docRef = doc(db, op.collectionName, docToUpdate.id);
          batch.update(docRef, op.data);
        }
      }
      
      await batch.commit();
      return true;
    } catch (error) {
      console.error('Error in batch update:', error);
      return false;
    }
  }
};

