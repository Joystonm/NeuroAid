const express = require('express');
const router = express.Router();
const {
  getFeedback,
  getRecommendations,
  analyzeTrends,
  getJournalSummary
} = require('../controllers/llmController');

// POST /api/llm/feedback - Generate personalized feedback
router.post('/feedback', getFeedback);

// POST /api/llm/recommendations - Get personalized recommendations
router.post('/recommendations', getRecommendations);

// POST /api/llm/analyze-trends - Analyze performance trends
router.post('/analyze-trends', analyzeTrends);

// POST /api/llm/journal-summary - Generate journal summary
router.post('/journal-summary', getJournalSummary);

module.exports = router;
