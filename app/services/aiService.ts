import { GoogleGenerativeAI } from '@google/generative-ai';

// AI Service for integrating various AI capabilities
export class AIService {
  private static genAI: GoogleGenerativeAI | null = null;
  private static openAIConfig: any = null;

  // Initialize AI services
  static initialize(config: {
    geminiApiKey?: string;
    openAIApiKey?: string;
    huggingFaceToken?: string;
  }) {
    if (config.geminiApiKey) {
      this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
    }
    
    if (config.openAIApiKey) {
      this.openAIConfig = { apiKey: config.openAIApiKey };
    }
  }

  // Generate CV bullet points using AI
  static async generateCVBulletPoints(experience: string): Promise<string[]> {
    try {
      if (!this.genAI) {
        throw new Error('Gemini AI not initialized');
      }

      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
        Transform this work experience into 3-4 professional, ATS-friendly bullet points for a resume:
        
        Experience: ${experience}
        
        Requirements:
        - Start with action verbs
        - Include metrics and results where possible
        - Keep each point concise and impactful
        - Focus on achievements rather than duties
        
        Return as a JSON array of strings.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse JSON response
      try {
        return JSON.parse(text);
      } catch {
        // Fallback: split by lines and clean up
        return text.split('\n')
          .filter(line => line.trim().startsWith('-'))
          .map(line => line.replace(/^-/, '').trim())
          .slice(0, 4);
      }
    } catch (error: any) {
      console.error('Failed to generate CV bullet points:', error);
      return [
        `Managed ${experience.split(' ').slice(0, 3).join(' ')} responsibilities`,
        `Collaborated with team members to achieve project goals`,
        `Developed skills in relevant areas through hands-on experience`
      ];
    }
  }

  // Analyze job description for skills extraction
  static async extractSkillsFromJobDescription(jobDescription: string): Promise<string[]> {
    try {
      if (!this.genAI) {
        // Fallback: simple keyword extraction
        const skills = [
          'javascript', 'python', 'java', 'react', 'node.js', 'html', 'css',
          'sql', 'mongodb', 'aws', 'docker', 'git', 'rest api', 'graphql',
          'machine learning', 'data analysis', 'ui/ux', 'agile', 'scrum'
        ];
        
        return skills.filter(skill => 
          jobDescription.toLowerCase().includes(skill)
        );
      }

      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
        Extract the technical skills and requirements from this job description.
        Return only a JSON array of skill strings, without any additional text.
        
        Job Description: ${jobDescription}
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        return JSON.parse(text);
      } catch {
        return [];
      }
    } catch (error: any) {
      console.error('Failed to extract skills:', error);
      return [];
    }
  }

  // Detect bias in job description
  static async detectBiasInJobDescription(jobDescription: string): Promise<{
    hasBias: boolean;
    biasedPhrases: string[];
    suggestions: string[];
  }> {
    try {
      if (!this.genAI) {
        // Simple rule-based fallback
        const biasedTerms = [
          'rockstar', 'ninja', 'guru', 'young', 'recent graduate',
          'male', 'female', 'him', 'her', 'aggressive', 'dominant'
        ];
        
        const foundBiases = biasedTerms.filter(term => 
          jobDescription.toLowerCase().includes(term)
        );
        
        return {
          hasBias: foundBiases.length > 0,
          biasedPhrases: foundBiases,
          suggestions: foundBiases.map(term => 
            `Consider replacing "${term}" with more inclusive language`
          )
        };
      }

      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
        Analyze this job description for potential bias and suggest improvements.
        Focus on:
        - Gender-biased language
        - Age-related terms
        - Unnecessarily aggressive terminology
        - Exclusionary requirements
        
        Job Description: ${jobDescription}
        
        Return a JSON object with:
        - hasBias: boolean
        - biasedPhrases: string[] (the problematic phrases found)
        - suggestions: string[] (specific improvement suggestions)
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        return JSON.parse(text);
      } catch {
        return {
          hasBias: false,
          biasedPhrases: [],
          suggestions: []
        };
      }
    } catch (error: any) {
      console.error('Failed to detect bias:', error);
      return {
        hasBias: false,
        biasedPhrases: [],
        suggestions: []
      };
    }
  }

  // Generate personalized career recommendations
  static async generateCareerRecommendations(
    userSkills: string[],
    userInterests: string[],
    marketTrends: string[] = []
  ): Promise<{
    recommendedSkills: string[];
    learningPaths: string[];
    jobSuggestions: string[];
  }> {
    try {
      if (!this.genAI) {
        // Fallback recommendations
        return {
          recommendedSkills: ['React', 'Node.js', 'TypeScript', 'AWS'],
          learningPaths: ['Full Stack Development', 'Cloud Computing'],
          jobSuggestions: ['Frontend Developer', 'Backend Developer', 'Full Stack Engineer']
        };
      }

      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
        Based on the user's current skills and interests, provide career recommendations.
        
        Current Skills: ${userSkills.join(', ')}
        Interests: ${userInterests.join(', ')}
        Market Trends: ${marketTrends.join(', ')}
        
        Return a JSON object with:
        - recommendedSkills: string[] (3-5 skills to learn next)
        - learningPaths: string[] (2-3 suggested learning paths)
        - jobSuggestions: string[] (3-5 suitable job roles)
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        return JSON.parse(text);
      } catch {
        return {
          recommendedSkills: [],
          learningPaths: [],
          jobSuggestions: []
        };
      }
    } catch (error: any) {
      console.error('Failed to generate recommendations:', error);
      return {
        recommendedSkills: [],
        learningPaths: [],
        jobSuggestions: []
      };
    }
  }

  // Profile completion suggestions
  static async getProfileCompletionSuggestions(profile: any): Promise<string[]> {
    const suggestions: string[] = [];

    if (!profile.skills || profile.skills.length === 0) {
      suggestions.push('Add your technical skills to get better internship matches');
    }

    if (!profile.education || profile.education.length === 0) {
      suggestions.push('Complete your education history');
    }

    if (!profile.location) {
      suggestions.push('Add your location to find local opportunities');
    }

    if (!profile.bio || profile.bio.length < 50) {
      suggestions.push('Write a more detailed bio to stand out to employers');
    }

    return suggestions.slice(0, 3); // Return top 3 suggestions
  }

  // Sentiment analysis for applications (simplified)
  static async analyzeApplicationSentiment(coverLetter: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    keyPoints: string[];
  }> {
    // Simplified implementation - would use proper NLP in production
    const positiveWords = ['excited', 'passionate', 'learn', 'grow', 'contribute', 'innovative'];
    const negativeWords = ['hate', 'boring', 'terrible', 'awful', 'hate'];
    
    const words = coverLetter.toLowerCase().split(' ');
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (positiveCount > negativeCount) sentiment = 'positive';
    if (negativeCount > positiveCount) sentiment = 'negative';
    
    const confidence = Math.min((Math.abs(positiveCount - negativeCount) / words.length) * 100, 100);
    
    return {
      sentiment,
      confidence,
      keyPoints: this.extractKeyPoints(coverLetter)
    };
  }

  private static extractKeyPoints(text: string): string[] {
    // Simple key phrase extraction
    const sentences = text.split('.');
    return sentences
      .filter(sentence => sentence.length > 20 && sentence.length < 100)
      .slice(0, 3)
      .map(sentence => sentence.trim());
  }
}