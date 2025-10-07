import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    setDoc,
    startAfter,
    updateDoc,
    where
} from 'firebase/firestore';
import { db } from './firebaseConfig';

export interface Internship {
  id?: string;
  title: string;
  description: string;
  organizationId: string;
  organizationName: string;
  requirements: string[];
  skills: string[];
  location: string;
  type: 'full-time' | 'part-time' | 'remote' | 'hybrid';
  duration: string;
  stipend?: number;
  applicationDeadline: Date;
  startDate: Date;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InternshipFilter {
  category?: string;
  type?: string;
  location?: string;
  skills?: string[];
  maxDuration?: number;
  minStipend?: number;
}

export class InternshipService {
  // Create new internship
  static async createInternship(internship: Omit<Internship, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const internshipRef = doc(collection(db, 'internships'));
      const internshipData: Internship = {
        ...internship,
        id: internshipRef.id,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(internshipRef, internshipData);
      return internshipRef.id;
    } catch (error: any) {
      throw new Error('Failed to create internship: ' + error.message);
    }
  }

  // Update internship
  static async updateInternship(internshipId: string, updates: Partial<Internship>): Promise<void> {
    try {
      await updateDoc(doc(db, 'internships', internshipId), {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error: any) {
      throw new Error('Failed to update internship: ' + error.message);
    }
  }

  // Delete internship
  static async deleteInternship(internshipId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'internships', internshipId));
    } catch (error: any) {
      throw new Error('Failed to delete internship: ' + error.message);
    }
  }

  // Get internship by ID
  static async getInternship(internshipId: string): Promise<Internship | null> {
    try {
      const internshipDoc = await getDoc(doc(db, 'internships', internshipId));
      return internshipDoc.exists() ? (internshipDoc.data() as Internship) : null;
    } catch (error: any) {
      throw new Error('Failed to get internship: ' + error.message);
    }
  }

  // Get internships with filtering and pagination
  static async getInternships(
    filters: InternshipFilter = {},
    pageSize: number = 10,
    lastDoc?: any
  ): Promise<{ internships: Internship[]; lastVisible: any }> {
    try {
      let q = query(
        collection(db, 'internships'),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );

      // Apply filters
      const constraints = [where('isActive', '==', true)];
      
      if (filters.category) {
        constraints.push(where('category', '==', filters.category));
      }
      if (filters.type) {
        constraints.push(where('type', '==', filters.type));
      }
      if (filters.location) {
        constraints.push(where('location', '==', filters.location));
      }

      q = query(collection(db, 'internships'), ...constraints, orderBy('createdAt', 'desc'), limit(pageSize));

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const internships = querySnapshot.docs.map(doc => doc.data() as Internship);
      
      // Apply additional filters that can't be done in Firestore query
      let filteredInternships = internships;
      
      if (filters.skills && filters.skills.length > 0) {
        filteredInternships = filteredInternships.filter(internship =>
          filters.skills!.some(skill => internship.skills.includes(skill))
        );
      }
      
      if (filters.minStipend) {
        filteredInternships = filteredInternships.filter(internship =>
          internship.stipend && internship.stipend >= filters.minStipend!
        );
      }

      return {
        internships: filteredInternships,
        lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1]
      };
    } catch (error: any) {
      throw new Error('Failed to get internships: ' + error.message);
    }
  }

  // Get internships by organization
  static async getInternshipsByOrganization(organizationId: string): Promise<Internship[]> {
    try {
      const q = query(
        collection(db, 'internships'),
        where('organizationId', '==', organizationId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as Internship);
    } catch (error: any) {
      throw new Error('Failed to get organization internships: ' + error.message);
    }
  }

  // Search internships
  static async searchInternships(searchTerm: string, filters: InternshipFilter = {}): Promise<Internship[]> {
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a basic implementation - consider using Algolia or similar for production
      const { internships } = await this.getInternships(filters, 50);
      
      return internships.filter(internship =>
        internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        internship.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        internship.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        internship.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    } catch (error: any) {
      throw new Error('Failed to search internships: ' + error.message);
    }
  }

  // Get internship categories
  static async getCategories(): Promise<string[]> {
    try {
      // This would typically come from a maintained list
      return [
        'Software Development',
        'Data Science',
        'Web Development',
        'Mobile Development',
        'UI/UX Design',
        'Digital Marketing',
        'Business Analysis',
        'Project Management',
        'Content Writing',
        'Graphic Design',
        'Sales & Marketing',
        'Human Resources'
      ];
    } catch (error: any) {
      throw new Error('Failed to get categories: ' + error.message);
    }
  }

  // Check for bias in job description (would integrate with AI service)
  static async checkBias(jobDescription: string): Promise<{ hasBias: boolean; issues: string[] }> {
    try {
      // This would integrate with OpenAI API for bias detection
      const issues: string[] = [];
      
      // Simple keyword-based bias detection
      const biasedTerms = [
        'rockstar', 'ninja', 'guru', 'young', 'recent graduate',
        'male', 'female', 'him', 'her'
      ];
      
      biasedTerms.forEach(term => {
        if (jobDescription.toLowerCase().includes(term)) {
          issues.push(`Potential biased term: "${term}"`);
        }
      });

      return {
        hasBias: issues.length > 0,
        issues
      };
    } catch (error: any) {
      throw new Error('Failed to check bias: ' + error.message);
    }
  }
}