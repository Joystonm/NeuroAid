const express = require('express');
const router = express.Router();
const {
  saveGameScore,
  getGameScores,
  getUserStats,
  getLeaderboard
} = require('../controllers/gamesController');

// POST /api/games/score - Save a game score
router.post('/score', saveGameScore);

// GET /api/games/scores/:gameType - Get scores for a specific game type
router.get('/scores/:gameType', getGameScores);

// GET /api/games/stats/:userId - Get user statistics
router.get('/stats/:userId', getUserStats);

// GET /api/games/leaderboard/:gameType - Get leaderboard for a specific game
router.get('/leaderboard/:gameType', getLeaderboard);

module.exports = router;
