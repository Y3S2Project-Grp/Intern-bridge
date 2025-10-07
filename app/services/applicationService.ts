import {
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    setDoc,
    updateDoc,
    where
} from 'firebase/firestore';
import { db } from './firebaseConfig';

export interface Application {
  id?: string;
  userId: string;
  internshipId: string;
  organizationId: string;
  status: ApplicationStatus;
  appliedAt: Date;
  updatedAt: Date;
  coverLetter?: string;
  resumeUrl?: string;
  questions?: { question: string; answer: string }[];
  eligibilityScore?: number;
}

export enum ApplicationStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  SHORTLISTED = 'shortlisted',
  INTERVIEW = 'interview',
  REJECTED = 'rejected',
  ACCEPTED = 'accepted',
  WITHDRAWN = 'withdrawn'
}

export interface ApplicationAnalytics {
  totalApplications: number;
  statusDistribution: { status: ApplicationStatus; count: number }[];
  monthlyTrends: { month: string; count: number }[];
  popularCategories: { category: string; count: number }[];
}

export class ApplicationService {
  // Apply for internship
  static async applyForInternship(application: Omit<Application, 'id' | 'appliedAt' | 'updatedAt'>): Promise<string> {
    try {
      // Check if already applied
      const existingApplication = await this.getUserApplicationForInternship(
        application.userId, 
        application.internshipId
      );

      if (existingApplication) {
        throw new Error('You have already applied for this internship');
      }

      const applicationRef = doc(collection(db, 'applications'));
      const applicationData: Application = {
        ...application,
        id: applicationRef.id,
        status: ApplicationStatus.PENDING,
        appliedAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(applicationRef, applicationData);
      return applicationRef.id;
    } catch (error: any) {
      throw new Error('Failed to apply: ' + error.message);
    }
  }

  // Update application status
  static async updateApplicationStatus(
    applicationId: string, 
    status: ApplicationStatus,
    feedback?: string
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'applications', applicationId), {
        status,
        feedback,
        updatedAt: new Date()
      });
    } catch (error: any) {
      throw new Error('Failed to update application: ' + error.message);
    }
  }

  // Withdraw application
  static async withdrawApplication(applicationId: string): Promise<void> {
    try {
      await this.updateApplicationStatus(applicationId, ApplicationStatus.WITHDRAWN);
    } catch (error: any) {
      throw new Error('Failed to withdraw application: ' + error.message);
    }
  }

  // Get user's applications
  static async getUserApplications(userId: string): Promise<Application[]> {
    try {
      const q = query(
        collection(db, 'applications'),
        where('userId', '==', userId),
        orderBy('appliedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as Application);
    } catch (error: any) {
      throw new Error('Failed to get user applications: ' + error.message);
    }
  }

  // Get applications for an internship
  static async getInternshipApplications(internshipId: string): Promise<Application[]> {
    try {
      const q = query(
        collection(db, 'applications'),
        where('internshipId', '==', internshipId),
        orderBy('appliedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as Application);
    } catch (error: any) {
      throw new Error('Failed to get internship applications: ' + error.message);
    }
  }

  // Get applications for an organization
  static async getOrganizationApplications(organizationId: string): Promise<Application[]> {
    try {
      const q = query(
        collection(db, 'applications'),
        where('organizationId', '==', organizationId),
        orderBy('appliedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as Application);
    } catch (error: any) {
      throw new Error('Failed to get organization applications: ' + error.message);
    }
  }

  // Get specific application
  static async getApplication(applicationId: string): Promise<Application | null> {
    try {
      const applicationDoc = await getDoc(doc(db, 'applications', applicationId));
      return applicationDoc.exists() ? (applicationDoc.data() as Application) : null;
    } catch (error: any) {
      throw new Error('Failed to get application: ' + error.message);
    }
  }

  // Check if user has applied for internship
  static async getUserApplicationForInternship(userId: string, internshipId: string): Promise<Application | null> {
    try {
      const q = query(
        collection(db, 'applications'),
        where('userId', '==', userId),
        where('internshipId', '==', internshipId)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.empty ? null : (querySnapshot.docs[0].data() as Application);
    } catch (error: any) {
      throw new Error('Failed to check application: ' + error.message);
    }
  }

  // Get application analytics for admin
  static async getApplicationAnalytics(): Promise<ApplicationAnalytics> {
    try {
      const applicationsSnapshot = await getDocs(collection(db, 'applications'));
      const applications = applicationsSnapshot.docs.map(doc => doc.data() as Application);
      
      // Calculate status distribution
      const statusDistribution = Object.values(ApplicationStatus).map(status => ({
        status,
        count: applications.filter(app => app.status === status).length
      }));

      // Calculate monthly trends (last 6 months)
      const monthlyTrends = this.calculateMonthlyTrends(applications);

      // Get popular categories (this would need internship data)
      const popularCategories = await this.getPopularCategories();

      return {
        totalApplications: applications.length,
        statusDistribution,
        monthlyTrends,
        popularCategories
      };
    } catch (error: any) {
      throw new Error('Failed to get analytics: ' + error.message);
    }
  }

  // Calculate monthly application trends
  private static calculateMonthlyTrends(applications: Application[]): { month: string; count: number }[] {
    const trends: { [key: string]: number } = {};
    const now = new Date();
    
    // Last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      trends[key] = 0;
    }

    applications.forEach(application => {
      const appliedDate = new Date(application.appliedAt);
      const key = appliedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      
      if (trends[key] !== undefined) {
        trends[key]++;
      }
    });

    return Object.entries(trends).map(([month, count]) => ({ month, count }));
  }

  // Get popular internship categories
  private static async getPopularCategories(): Promise<{ category: string; count: number }[]> {
    try {
      // This would typically aggregate from internships and applications
      // Simplified implementation for now
      const categories = [
        { category: 'Software Development', count: 45 },
        { category: 'Data Science', count: 32 },
        { category: 'Web Development', count: 28 },
        { category: 'UI/UX Design', count: 22 },
        { category: 'Digital Marketing', count: 18 }
      ];

      return categories;
    } catch (error: any) {
      return [];
    }
  }

  // Detect potential fraud in applications
  static async detectFraud(applicationId: string): Promise<{ isFraud: boolean; reasons: string[] }> {
    try {
      // This would integrate with AI service for fraud detection
      // Simplified implementation
      const reasons: string[] = [];
      
      // Check for suspicious patterns
      const application = await this.getApplication(applicationId);
      if (application) {
        // Example checks
        if (application.coverLetter && application.coverLetter.length < 50) {
          reasons.push('Cover letter too short');
        }
        
        // Add more sophisticated checks here
      }

      return {
        isFraud: reasons.length > 0,
        reasons
      };
    } catch (error: any) {
      throw new Error('Failed to detect fraud: ' + error.message);
    }
  }
}