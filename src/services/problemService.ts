import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  Timestamp,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/error-handler';

export interface Problem {
  id?: string;
  uid: string;
  title: string;
  platform: string;
  url: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  dateSolved: any;
  timeTaken: number;
  attempts: number;
  status: 'Solved' | 'Revision Pending' | 'Failed';
  createdAt: any;
  updatedAt: any;
  smartTags?: string[];
}

const COLLECTION_NAME = 'problems';

export const problemService = {
  subscribeToUserProblems: (callback: (problems: Problem[]) => void) => {
    if (!auth.currentUser) return () => {};

    const q = query(
      collection(db, COLLECTION_NAME),
      where('uid', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const problems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Problem[];
      callback(problems);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    });
  },

  addProblem: async (problem: Omit<Problem, 'id' | 'uid' | 'createdAt' | 'updatedAt'>) => {
    if (!auth.currentUser) throw new Error('Authentication required');

    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...problem,
        uid: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
    }
  },

  updateProblem: async (id: string, updates: Partial<Problem>) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
    }
  },

  deleteProblem: async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
    }
  },

  getProblem: async (id: string) => {
    try {
      const docSnap = await getDoc(doc(db, COLLECTION_NAME, id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Problem;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${COLLECTION_NAME}/${id}`);
    }
  }
};
