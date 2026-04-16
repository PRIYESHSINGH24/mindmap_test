import { 
  collection, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/error-handler';

export interface Solution {
  id?: string;
  problemId: string;
  uid: string;
  language: string;
  code: string;
  version: number;
  createdAt: any;
}

const COLLECTION_NAME = 'solutions';

export const solutionService = {
  subscribeToProblemSolutions: (problemId: string, callback: (solutions: Solution[]) => void) => {
    if (!auth.currentUser) return () => {};

    const q = query(
      collection(db, COLLECTION_NAME),
      where('problemId', '==', problemId),
      where('uid', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const solutions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Solution[];
      callback(solutions);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    });
  },

  addSolution: async (problemId: string, language: string, code: string, version: number = 1) => {
    if (!auth.currentUser) throw new Error('Authentication required');

    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        problemId,
        uid: auth.currentUser.uid,
        language,
        code,
        version,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
    }
  },

  deleteSolution: async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
    }
  }
};
