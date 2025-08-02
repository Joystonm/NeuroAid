const axios = require('axios');

const GROK_API_URL = process.env.GROK_API_URL || 'https://api.x.ai/v1/chat/completions';
const GROK_API_KEY = process.env.GROK_API_KEY;

// Create Grok API client
const grokClient = axios.create({
  baseURL: GROK_API_URL,
  headers: {
    'Authorization': `Bearer ${GROK_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

// Generate personalized feedback based on game session data
const generateFeedback = async (sessionData) => {
  try {
    const {
      gameType,
      score,
      accuracy,
      timeSpent,
      level,
      difficulty,
      previousScores = [],
      userProfile = {}
    } = sessionData;

    const prompt = `
As a cognitive training expert, provide personalized feedback for a user who just completed a brain training game.

Game Details:
- Game Type: ${gameType}
- Score: ${score}
- Accuracy: ${(accuracy * 100).toFixed(1)}%
- Time Spent: ${timeSpent} seconds
- Level: ${level}
- Difficulty: ${difficulty}

Previous Performance:
${previousScores.length > 0 ? 
  previousScores.map(s => `- Score: ${s.score}, Accuracy: ${(s.accuracy * 100).toFixed(1)}%`).join('\n') :
  'No previous scores available'
}

Please provide:
1. A brief performance summary (2-3 sentences)
2. Specific strengths observed
3. Areas for improvement
4. Actionable tips for next session
5. Motivational message

Keep the tone encouraging and constructive. Focus on cognitive benefits and improvement strategies.
`;

    const response = await grokClient.post('', {
      model: 'grok-beta',
      messages: [
        {
          role: 'system',
          content: 'You are an expert cognitive training coach who provides personalized, encouraging feedback to help users improve their brain training performance.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating feedback with Grok:', error);
    
    // Fallback feedback if API fails
    return generateFallbackFeedback(sessionData);
  }
};

// Generate personalized recommendations
const generateRecommendations = async (userProfile) => {
  try {
    const {
      gameStats,
      preferences,
      recentPerformance,
      goals = []
    } = userProfile;

    const prompt = `
Based on the following user profile, provide personalized game recommendations and training strategies:

Game Statistics:
${Object.entries(gameStats || {}).map(([game, stats]) => 
  `- ${game}: Best Score: ${stats.bestScore}, Games Played: ${stats.gamesPlayed}, Avg Accuracy: ${(stats.averageAccuracy * 100).toFixed(1)}%`
).join('\n')}

User Preferences:
- Difficulty: ${preferences?.difficulty || 'medium'}
- Goals: ${goals.join(', ') || 'General cognitive improvement'}

Recent Performance Trends:
${recentPerformance ? `Average improvement: ${recentPerformance.improvement}%` : 'No recent data'}

Please provide:
1. Recommended games to focus on next
2. Suggested difficulty adjustments
3. Training schedule recommendations
4. Specific cognitive skills to target
5. Long-term improvement strategy

Format as actionable recommendations.
`;

    const response = await grokClient.post('', {
      model: 'grok-beta',
      messages: [
        {
          role: 'system',
          content: 'You are a cognitive training specialist who creates personalized training programs based on user performance data and goals.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 600,
      temperature: 0.6
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating recommendations with Grok:', error);
    return generateFallbackRecommendations(userProfile);
  }
};

// Analyze performance trends
const analyzePerformance = async (performanceData) => {
  try {
    const {
      scores,
      timeframe,
      gameTypes
    } = performanceData;

    const prompt = `
Analyze the following cognitive training performance data and provide insights:

Performance Data:
${scores.map(score => 
  `Date: ${score.date}, Game: ${score.gameType}, Score: ${score.score}, Accuracy: ${(score.accuracy * 100).toFixed(1)}%`
).join('\n')}

Timeframe: ${timeframe}
Game Types: ${gameTypes.join(', ')}

Please provide:
1. Overall performance trends
2. Strengths and weaknesses by game type
3. Consistency analysis
4. Improvement patterns
5. Recommendations for continued growth

Focus on actionable insights and cognitive development patterns.
`;

    const response = await grokClient.post('', {
      model: 'grok-beta',
      messages: [
        {
          role: 'system',
          content: 'You are a data analyst specializing in cognitive performance metrics and brain training effectiveness.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 700,
      temperature: 0.5
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error analyzing performance with Grok:', error);
    return generateFallbackAnalysis(performanceData);
  }
};

// Summarize journal entries
const summarizeJournal = async (entries) => {
  try {
    const prompt = `
Summarize the following cognitive training journal entries and provide insights:

Journal Entries:
${entries.map(entry => 
  `Date: ${entry.date}\nEntry: ${entry.content}`
).join('\n\n')}

Please provide:
1. Key themes and patterns
2. Emotional and motivational trends
3. Challenges mentioned
4. Progress indicators
5. Recommendations based on self-reflection

Keep the summary supportive and insightful.
`;

    const response = await grokClient.post('', {
      model: 'grok-beta',
      messages: [
        {
          role: 'system',
          content: 'You are a cognitive training coach who helps users reflect on their training journey through journal analysis.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.6
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error summarizing journal with Grok:', error);
    return generateFallbackJournalSummary(entries);
  }
};

// Fallback functions for when API is unavailable
const generateFallbackFeedback = (sessionData) => {
  const { score, accuracy, gameType } = sessionData;
  const accuracyPercent = (accuracy * 100).toFixed(1);
  
  return `Great job completing the ${gameType} game! You scored ${score} points with ${accuracyPercent}% accuracy. 
  
Keep practicing to improve your cognitive skills. Focus on maintaining accuracy while increasing your speed. 
Regular training sessions will help you see continued improvement in your performance.`;
};

const generateFallbackRecommendations = (userProfile) => {
  return `Based on your current performance, here are some recommendations:

1. Continue practicing your strongest games to maintain skills
2. Challenge yourself with slightly higher difficulty levels
3. Try new game types to develop different cognitive abilities
4. Aim for consistent daily practice sessions
5. Focus on both speed and accuracy for balanced improvement`;
};

const generateFallbackAnalysis = (performanceData) => {
  return `Performance Analysis Summary:

Your training data shows consistent engagement with cognitive exercises. 
Continue your regular practice routine and focus on gradual improvement. 
Consider varying your game selection to target different cognitive skills.`;
};

const generateFallbackJournalSummary = (entries) => {
  return `Journal Summary:

Your entries show dedication to cognitive training. Keep reflecting on your progress 
and noting areas where you feel improvement. This self-awareness will help guide 
your continued development.`;
};

module.exports = {
  generateFeedback,
  generateRecommendations,
  analyzePerformance,
  summarizeJournal
};
