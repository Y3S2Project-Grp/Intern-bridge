import {
    collection,
    doc,
    getDocs,
    orderBy,
    query,
    setDoc,
    where
} from 'firebase/firestore';
import { User } from '../types/common';
import { db } from './firebaseConfig';

export interface EligibilityCriteria {
  requiredSkills: string[];
  preferredSkills: string[];
  educationLevel?: string;
  location?: string;
  minGPA?: number;
}

export interface EligibilityResult {
  score: number;
  isEligible: boolean;
  matchedSkills: string[];
  missingSkills: string[];
  suggestions: Suggestion[];
  confidence: number;
}

export interface Suggestion {
  type: 'skill' | 'course' | 'resource';
  title: string;
  description: string;
  url?: string;
  provider?: string;
}

export interface CVData {
  personalInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
  };
  education: Education[];
  experience: Experience[];
  skills: string[];
  projects?: Project[];
}

interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  gpa?: number;
}

interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
}

interface Project {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
}

export class EligibilityService {
  // Check eligibility for an internship
  static async checkEligibility(
    userId: string, 
    internshipId: string, 
    userProfile: User, 
    criteria: EligibilityCriteria
  ): Promise<EligibilityResult> {
    try {
      const userSkills = userProfile.skills || [];
      const requiredSkills = criteria.requiredSkills || [];
      const preferredSkills = criteria.preferredSkills || [];

      // Calculate skill matches
      const matchedRequired = requiredSkills.filter(skill => 
        userSkills.includes(skill)
      );
      const matchedPreferred = preferredSkills.filter(skill => 
        userSkills.includes(skill)
      );
      const missingSkills = requiredSkills.filter(skill => 
        !userSkills.includes(skill)
      );

      // Calculate score (0-100)
      const requiredScore = (matchedRequired.length / requiredSkills.length) * 70;
      const preferredScore = (matchedPreferred.length / preferredSkills.length) * 30;
      let score = requiredScore + preferredScore;

      // Adjust score based on other criteria
      if (criteria.location && userProfile.location === criteria.location) {
        score += 10;
      }
      if (criteria.minGPA && userProfile.education) {
        // Check if user meets GPA requirement (simplified)
        score += 5;
      }

      score = Math.min(score, 100);

      // Generate suggestions
      const suggestions = await this.generateSuggestions(missingSkills);

      // Save eligibility result
      const result: EligibilityResult = {
        score: Math.round(score),
        isEligible: matchedRequired.length >= requiredSkills.length * 0.7, // 70% match required
        matchedSkills: [...matchedRequired, ...matchedPreferred],
        missingSkills,
        suggestions,
        confidence: this.calculateConfidence(score, matchedRequired.length, requiredSkills.length)
      };

      await this.saveEligibilityResult(userId, internshipId, result);

      return result;
    } catch (error: any) {
      throw new Error('Failed to check eligibility: ' + error.message);
    }
  }

  // Generate skill improvement suggestions
  private static async generateSuggestions(missingSkills: string[]): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];

    for (const skill of missingSkills) {
      // Course suggestions
      suggestions.push({
        type: 'course',
        title: `Learn ${skill}`,
        description: `Online course to master ${skill}`,
        provider: 'Coursera',
        url: `https://www.coursera.org/search?query=${encodeURIComponent(skill)}`
      });

      // Resource suggestions
      suggestions.push({
        type: 'resource',
        title: `${skill} Documentation`,
        description: `Official documentation and tutorials`,
        provider: 'MDN Web Docs',
        url: `https://developer.mozilla.org/search?q=${encodeURIComponent(skill)}`
      });
    }

    return suggestions;
  }

  // Calculate confidence score
  private static calculateConfidence(
    score: number, 
    matchedCount: number, 
    totalRequired: number
  ): number {
    const baseConfidence = score / 100;
    const completionRate = matchedCount / totalRequired;
    return Math.round((baseConfidence * 0.7 + completionRate * 0.3) * 100);
  }

  // Save eligibility result to Firestore
  private static async saveEligibilityResult(
    userId: string, 
    internshipId: string, 
    result: EligibilityResult
  ): Promise<void> {
    try {
      await setDoc(doc(db, 'eligibilityResults', `${userId}_${internshipId}`), {
        userId,
        internshipId,
        ...result,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } catch (error: any) {
      console.error('Failed to save eligibility result:', error);
    }
  }

  // Get eligibility history for user
  static async getEligibilityHistory(userId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, 'eligibilityResults'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error: any) {
      throw new Error('Failed to get eligibility history: ' + error.message);
    }
  }

  // Generate ATS-friendly CV
  static async generateCV(userId: string, cvData: CVData): Promise<string> {
    try {
      // This would integrate with an AI service for CV optimization
      // For now, return a simplified version
      const optimizedCV = this.optimizeCVForATS(cvData);
      
      // Save CV to user's profile
      await setDoc(doc(db, 'cvs', userId), {
        ...optimizedCV,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return 'CV generated successfully';
    } catch (error: any) {
      throw new Error('Failed to generate CV: ' + error.message);
    }
  }

  // Optimize CV for Applicant Tracking Systems
  private static optimizeCVForATS(cvData: CVData): any {
    return {
      ...cvData,
      optimized: true,
      keywords: this.extractKeywords(cvData),
      score: this.calculateCVScore(cvData)
    };
  }

  // Extract keywords from CV data
  private static extractKeywords(cvData: CVData): string[] {
    const keywords = new Set<string>();
    
    // Add skills
    cvData.skills.forEach(skill => keywords.add(skill.toLowerCase()));
    
    // Add education keywords
    cvData.education.forEach(edu => {
      keywords.add(edu.field.toLowerCase());
      keywords.add(edu.degree.toLowerCase());
    });
    
    // Add experience keywords
    cvData.experience.forEach(exp => {
      exp.description.toLowerCase().split(' ').forEach(word => {
        if (word.length > 3) keywords.add(word);
      });
    });

    return Array.from(keywords);
  }

  // Calculate CV quality score
  private static calculateCVScore(cvData: CVData): number {
    let score = 0;
    
    // Points for having complete sections
    if (cvData.personalInfo.name && cvData.personalInfo.email) score += 20;
    if (cvData.education.length > 0) score += 20;
    if (cvData.experience.length > 0) score += 20;
    if (cvData.skills.length > 0) score += 20;
    if (cvData.projects && cvData.projects.length > 0) score += 20;
    
    return score;
  }
}