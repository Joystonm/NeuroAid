// LLM API Service for Grok integration

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class LLMService {
  async generateFeedback(sessionData) {
    try {
      const response = await fetch(`${API_BASE_URL}/llm/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate feedback');
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating feedback:', error);
      throw error;
    }
  }

  async getPersonalizedRecommendations(userProfile) {
    try {
      const response = await fetch(`${API_BASE_URL}/llm/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userProfile),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  }

  async analyzePerformanceTrends(performanceData) {
    try {
      const response = await fetch(`${API_BASE_URL}/llm/analyze-trends`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(performanceData),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze performance trends');
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing performance trends:', error);
      throw error;
    }
  }

  async generateJournalSummary(journalEntries) {
    try {
      const response = await fetch(`${API_BASE_URL}/llm/journal-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entries: journalEntries }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate journal summary');
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating journal summary:', error);
      throw error;
    }
  }
}

const llmService = new LLMService();
export default llmService;
