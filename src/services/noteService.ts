import { 
  collection, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/error-handler';

export interface Note {
  id?: string;
  problemId: string;
  uid: string;
  content: string;
  updatedAt: any;
}

const COLLECTION_NAME = 'notes';

export const noteService = {
  getNoteByProblemId: async (problemId: string) => {
    if (!auth.currentUser) return null;

    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('problemId', '==', problemId),
        where('uid', '==', auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Note;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    }
  },

  saveNote: async (problemId: string, content: string, noteId?: string) => {
    if (!auth.currentUser) throw new Error('Authentication required');

    try {
      if (noteId) {
        const docRef = doc(db, COLLECTION_NAME, noteId);
        await updateDoc(docRef, {
          content,
          updatedAt: serverTimestamp(),
        });
        return noteId;
      } else {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
          problemId,
          content,
          uid: auth.currentUser.uid,
          updatedAt: serverTimestamp(),
        });
        return docRef.id;
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, COLLECTION_NAME);
    }
  }
};
