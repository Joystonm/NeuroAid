const { generateFeedback, generateRecommendations, analyzePerformance, summarizeJournal } = require('../llm/generateFeedback');

// Generate personalized feedback based on game session
const getFeedback = async (req, res) => {
  try {
    const sessionData = req.body;
    
    const feedback = await generateFeedback(sessionData);
    
    res.json({
      success: true,
      data: {
        feedback,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error generating feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate feedback',
      error: error.message
    });
  }
};

// Get personalized recommendations
const getRecommendations = async (req, res) => {
  try {
    const userProfile = req.body;
    
    const recommendations = await generateRecommendations(userProfile);
    
    res.json({
      success: true,
      data: {
        recommendations,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate recommendations',
      error: error.message
    });
  }
};

// Analyze performance trends
const analyzeTrends = async (req, res) => {
  try {
    const performanceData = req.body;
    
    const analysis = await analyzePerformance(performanceData);
    
    res.json({
      success: true,
      data: {
        analysis,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error analyzing trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze performance trends',
      error: error.message
    });
  }
};

// Generate journal summary
const getJournalSummary = async (req, res) => {
  try {
    const { entries } = req.body;
    
    const summary = await summarizeJournal(entries);
    
    res.json({
      success: true,
      data: {
        summary,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error generating journal summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate journal summary',
      error: error.message
    });
  }
};

module.exports = {
  getFeedback,
  getRecommendations,
  analyzeTrends,
  getJournalSummary
};
