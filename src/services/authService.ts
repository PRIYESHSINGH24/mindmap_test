import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, githubProvider, db } from '../lib/firebase';

export const authService = {
  loginWithGoogle: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await authService.syncUser(result.user);
      return result.user;
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed') {
        console.error('Google login is not enabled in the Firebase Console.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        console.warn('Login popup was closed by the user.');
      }
      console.error('Google login failed:', error);
      throw error;
    }
  },

  loginWithGithub: async () => {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      await authService.syncUser(result.user);
      return result.user;
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed') {
        console.error('Github login is not enabled in the Firebase Console.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        console.warn('Login popup was closed by the user.');
      }
      console.error('Github login failed:', error);
      throw error;
    }
  },

  logout: () => signOut(auth),

  syncUser: async (user: FirebaseUser) => {
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });
    } else {
      await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
    }
  },

  onAuthStateChanged: (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback);
  }
};
