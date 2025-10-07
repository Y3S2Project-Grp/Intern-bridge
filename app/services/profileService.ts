import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    updateDoc,
    where
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { User, UserRole } from '../types/common';
import { db, storage } from './firebaseConfig';

export interface ProfileUpdate {
  name?: string;
  location?: string;
  skills?: string[];
  education?: Education[];
  experience?: Experience[];
  bio?: string;
  avatar?: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
}

export interface Experience {
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description?: string;
}

export class ProfileService {
  // Get user profile
  static async getUserProfile(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      return userDoc.exists() ? (userDoc.data() as User) : null;
    } catch (error: any) {
      throw new Error('Failed to get profile: ' + error.message);
    }
  }

  // Update user profile
  static async updateProfile(userId: string, updates: ProfileUpdate): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error: any) {
      throw new Error('Failed to update profile: ' + error.message);
    }
  }

  // Upload profile image
  static async uploadProfileImage(userId: string, file: Blob): Promise<string> {
    try {
      const storageRef = ref(storage, `profile_images/${userId}/${Date.now()}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error: any) {
      throw new Error('Failed to upload image: ' + error.message);
    }
  }

  // Get organizations pending approval
  static async getPendingOrganizations(): Promise<User[]> {
    try {
      const q = query(
        collection(db, 'users'),
        where('role', '==', UserRole.ORG),
        where('approved', '==', false)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as User);
    } catch (error: any) {
      throw new Error('Failed to get pending organizations: ' + error.message);
    }
  }

  // Approve organization
  static async approveOrganization(orgId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', orgId), {
        approved: true,
        approvedAt: new Date(),
        updatedAt: new Date()
      });
    } catch (error: any) {
      throw new Error('Failed to approve organization: ' + error.message);
    }
  }

  // Reject organization
  static async rejectOrganization(orgId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', orgId), {
        approved: false,
        rejectionReason: 'Manual rejection by admin',
        updatedAt: new Date()
      });
    } catch (error: any) {
      throw new Error('Failed to reject organization: ' + error.message);
    }
  }

  // Search users by skills or location
  static async searchUsers(criteria: {
    skills?: string[];
    location?: string;
    role?: UserRole;
  }): Promise<User[]> {
    try {
      let q = query(collection(db, 'users'));
      
      const constraints = [];
      if (criteria.role) {
        constraints.push(where('role', '==', criteria.role));
      }
      if (criteria.location) {
        constraints.push(where('location', '==', criteria.location));
      }

      if (constraints.length > 0) {
        q = query(collection(db, 'users'), ...constraints);
      }

      const querySnapshot = await getDocs(q);
      let users = querySnapshot.docs.map(doc => doc.data() as User);

      // Filter by skills if provided
      if (criteria.skills && criteria.skills.length > 0) {
        users = users.filter(user => 
          user.skills && criteria.skills!.some(skill => 
            user.skills!.includes(skill)
          )
        );
      }

      return users;
    } catch (error: any) {
      throw new Error('Failed to search users: ' + error.message);
    }
  }
}