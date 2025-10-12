// services/aiService.ts
export class AIService {
  static initialize(config: any) {
    // Mock implementation
  }

  static async detectBiasInJobDescription(description: string): Promise<{ hasBias: boolean; issues: string[] }> {
    // Mock implementation
    return { hasBias: false, issues: [] };
  }

  static async extractSkillsFromJobDescription(description: string): Promise<string[]> {
    // Mock implementation
    return [];
  }
}