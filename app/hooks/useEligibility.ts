import { useCallback, useState } from 'react';
import { CVData, EligibilityCriteria, EligibilityResult, EligibilityService } from '../services/eligibilityService';
import { User } from '../types/common';
import { useAuth } from './useAuth';

interface UseEligibilityResult {
  // State
  eligibilityResult: EligibilityResult | null;
  loading: boolean;
  error: string | null;
  history: any[];
  cvGenerating: boolean;
  
  // Methods
  checkEligibility: (internshipId: string, criteria: EligibilityCriteria) => Promise<void>;
  getEligibilityHistory: () => Promise<void>;
  generateCV: (cvData: CVData) => Promise<string>;
  clearResult: () => void;
  clearError: () => void;
}

export const useEligibility = (): UseEligibilityResult => {
  const { user } = useAuth();
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [cvGenerating, setCvGenerating] = useState(false);

  const checkEligibility = useCallback(async (internshipId: string, criteria: EligibilityCriteria) => {
    if (!user) {
      setError('User must be logged in to check eligibility');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await EligibilityService.checkEligibility(
        user.id,
        internshipId,
        user as User,
        criteria
      );
      
      setEligibilityResult(result);
    } catch (err: any) {
      setError(err.message || 'Failed to check eligibility');
      console.error('Eligibility check error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getEligibilityHistory = useCallback(async () => {
    if (!user) {
      setError('User must be logged in to view history');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const historyData = await EligibilityService.getEligibilityHistory(user.id);
      setHistory(historyData);
    } catch (err: any) {
      setError(err.message || 'Failed to load eligibility history');
      console.error('Eligibility history error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const generateCV = useCallback(async (cvData: CVData): Promise<string> => {
    if (!user) {
      throw new Error('User must be logged in to generate CV');
    }

    try {
      setCvGenerating(true);
      setError(null);
      
      const result = await EligibilityService.generateCV(user.id, cvData);
      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to generate CV';
      setError(errorMsg);
      throw err;
    } finally {
      setCvGenerating(false);
    }
  }, [user]);

  const clearResult = useCallback(() => {
    setEligibilityResult(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    eligibilityResult,
    loading,
    error,
    history,
    cvGenerating,
    
    // Methods
    checkEligibility,
    getEligibilityHistory,
    generateCV,
    clearResult,
    clearError,
  };
};

// Specialized hook for checking eligibility for a specific internship
export const useInternshipEligibility = (internshipId?: string) => {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const { user } = useAuth();

  const check = useCallback(async (criteria: EligibilityCriteria) => {
    if (!internshipId || !user) {
      throw new Error('Internship ID and user are required');
    }

    try {
      setChecking(true);
      const eligibilityResult = await EligibilityService.checkEligibility(
        user.id,
        internshipId,
        user as User,
        criteria
      );
      setResult(eligibilityResult);
      return eligibilityResult;
    } catch (error) {
      console.error('Eligibility check failed:', error);
      throw error;
    } finally {
      setChecking(false);
    }
  }, [internshipId, user]);

  const clear = useCallback(() => {
    setResult(null);
  }, []);

  return {
    checking,
    result,
    check,
    clear,
  };
};

export default useEligibility;