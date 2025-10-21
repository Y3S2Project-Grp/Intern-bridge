// services/authService.ts
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { User, UserRole } from '../types/common';

export class AuthService {
  static async register(email: string, password: string, name: string, role: UserRole): Promise<User> {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile
      await updateProfile(user, {
        displayName: name
      });

      // Create user document in Firestore
      const userData: User = {
        id: user.uid,
        email: user.email!,
        name: name,
        role: role,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'users', user.uid), userData);

      return userData;
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  static async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userData = await this.getCurrentUserData(user.uid);
      return userData;
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  }

  static async getCurrentUserData(userId: string): Promise<User> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }
      
      return userDoc.data() as User;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get user data');
    }
  }

  static async logout(): Promise<void> {
    try {
      await auth.signOut();
    } catch (error: any) {
      throw new Error(error.message || 'Logout failed');
    }
  }
}