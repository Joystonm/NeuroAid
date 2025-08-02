const { generateFeedback } = require('./generateFeedback');

// Utility functions for journal analysis and summarization

const analyzeJournalSentiment = (entries) => {
  // Simple sentiment analysis based on keywords
  const positiveWords = ['good', 'great', 'excellent', 'improved', 'better', 'progress', 'confident', 'focused', 'sharp'];
  const negativeWords = ['difficult', 'hard', 'frustrated', 'tired', 'worse', 'struggling', 'confused', 'distracted'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  let totalWords = 0;

  entries.forEach(entry => {
    const words = entry.content.toLowerCase().split(/\s+/);
    totalWords += words.length;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });
  });

  const sentimentScore = (positiveCount - negativeCount) / totalWords;
  
  return {
    sentiment: sentimentScore > 0.01 ? 'positive' : sentimentScore < -0.01 ? 'negative' : 'neutral',
    score: sentimentScore,
    positiveCount,
    negativeCount,
    totalWords
  };
};

const extractKeyThemes = (entries) => {
  // Extract common themes and topics from journal entries
  const themes = {
    performance: 0,
    motivation: 0,
    difficulty: 0,
    improvement: 0,
    focus: 0,
    memory: 0,
    speed: 0,
    accuracy: 0
  };

  const themeKeywords = {
    performance: ['score', 'performance', 'result', 'achievement'],
    motivation: ['motivated', 'motivation', 'goal', 'determined', 'inspired'],
    difficulty: ['difficult', 'hard', 'challenging', 'tough', 'struggle'],
    improvement: ['improve', 'better', 'progress', 'growth', 'development'],
    focus: ['focus', 'concentration', 'attention', 'distracted'],
    memory: ['memory', 'remember', 'recall', 'forget'],
    speed: ['speed', 'fast', 'quick', 'slow', 'time'],
    accuracy: ['accuracy', 'accurate', 'correct', 'mistake', 'error']
  };

  entries.forEach(entry => {
    const content = entry.content.toLowerCase();
    
    Object.keys(themeKeywords).forEach(theme => {
      themeKeywords[theme].forEach(keyword => {
        if (content.includes(keyword)) {
          themes[theme]++;
        }
      });
    });
  });

  // Sort themes by frequency
  const sortedThemes = Object.entries(themes)
    .sort(([,a], [,b]) => b - a)
    .filter(([,count]) => count > 0);

  return sortedThemes;
};

const identifyProgressPatterns = (entries) => {
  // Analyze entries chronologically to identify progress patterns
  const sortedEntries = entries.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  const patterns = {
    consistentPractice: false,
    improvementMentioned: false,
    challengesOvercome: false,
    goalSetting: false,
    reflectiveThinking: false
  };

  // Check for consistent practice mentions
  const practiceKeywords = ['practice', 'train', 'play', 'session', 'exercise'];
  const practiceCount = sortedEntries.filter(entry => 
    practiceKeywords.some(keyword => entry.content.toLowerCase().includes(keyword))
  ).length;
  
  patterns.consistentPractice = practiceCount >= entries.length * 0.5;

  // Check for improvement mentions
  const improvementKeywords = ['improve', 'better', 'progress', 'advance'];
  patterns.improvementMentioned = sortedEntries.some(entry =>
    improvementKeywords.some(keyword => entry.content.toLowerCase().includes(keyword))
  );

  // Check for challenge resolution
  const challengeKeywords = ['overcome', 'solved', 'figured out', 'breakthrough'];
  patterns.challengesOvercome = sortedEntries.some(entry =>
    challengeKeywords.some(keyword => entry.content.toLowerCase().includes(keyword))
  );

  // Check for goal setting
  const goalKeywords = ['goal', 'aim', 'target', 'objective', 'plan'];
  patterns.goalSetting = sortedEntries.some(entry =>
    goalKeywords.some(keyword => entry.content.toLowerCase().includes(keyword))
  );

  // Check for reflective thinking
  const reflectionKeywords = ['think', 'realize', 'understand', 'learn', 'notice'];
  patterns.reflectiveThinking = sortedEntries.some(entry =>
    reflectionKeywords.some(keyword => entry.content.toLowerCase().includes(keyword))
  );

  return patterns;
};

const generateInsights = (sentiment, themes, patterns, entries) => {
  const insights = [];

  // Sentiment-based insights
  if (sentiment.sentiment === 'positive') {
    insights.push("Your journal entries show a positive attitude towards your cognitive training journey.");
  } else if (sentiment.sentiment === 'negative') {
    insights.push("Your entries indicate some challenges. Remember that difficulties are part of the learning process.");
  }

  // Theme-based insights
  if (themes.length > 0) {
    const topTheme = themes[0][0];
    insights.push(`Your main focus area appears to be ${topTheme}, which shows good self-awareness.`);
  }

  // Pattern-based insights
  if (patterns.consistentPractice) {
    insights.push("You demonstrate consistent engagement with your training routine.");
  }

  if (patterns.improvementMentioned) {
    insights.push("You're actively tracking your progress and noticing improvements.");
  }

  if (patterns.goalSetting) {
    insights.push("Your goal-oriented approach will help drive continued improvement.");
  }

  if (patterns.reflectiveThinking) {
    insights.push("Your reflective approach to training shows maturity in your learning process.");
  }

  // Entry frequency insights
  if (entries.length >= 7) {
    insights.push("Your regular journaling habit demonstrates commitment to self-reflection.");
  }

  return insights;
};

const createJournalSummary = async (entries) => {
  if (!entries || entries.length === 0) {
    return {
      summary: "No journal entries to analyze.",
      insights: [],
      recommendations: []
    };
  }

  try {
    // Perform local analysis
    const sentiment = analyzeJournalSentiment(entries);
    const themes = extractKeyThemes(entries);
    const patterns = identifyProgressPatterns(entries);
    const insights = generateInsights(sentiment, themes, patterns, entries);

    // Generate AI summary using the main LLM function
    const aiSummary = await generateFeedback.summarizeJournal(entries);

    return {
      summary: aiSummary,
      localAnalysis: {
        sentiment,
        themes: themes.slice(0, 3), // Top 3 themes
        patterns,
        insights
      },
      entryCount: entries.length,
      dateRange: {
        start: entries.reduce((earliest, entry) => 
          new Date(entry.date) < new Date(earliest.date) ? entry : earliest
        ).date,
        end: entries.reduce((latest, entry) => 
          new Date(entry.date) > new Date(latest.date) ? entry : latest
        ).date
      }
    };
  } catch (error) {
    console.error('Error creating journal summary:', error);
    
    // Return basic analysis if AI summary fails
    const sentiment = analyzeJournalSentiment(entries);
    const themes = extractKeyThemes(entries);
    const patterns = identifyProgressPatterns(entries);
    const insights = generateInsights(sentiment, themes, patterns, entries);

    return {
      summary: "Your journal entries show engagement with cognitive training. Continue reflecting on your progress and challenges.",
      localAnalysis: {
        sentiment,
        themes: themes.slice(0, 3),
        patterns,
        insights
      },
      entryCount: entries.length
    };
  }
};

module.exports = {
  analyzeJournalSentiment,
  extractKeyThemes,
  identifyProgressPatterns,
  generateInsights,
  createJournalSummary
};
