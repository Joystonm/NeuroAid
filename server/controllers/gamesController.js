const GameScore = require('../models/GameScore');
const User = require('../models/User');

// Save game score
const saveGameScore = async (req, res) => {
  try {
    const {
      userId,
      gameType,
      score,
      level,
      accuracy,
      timeSpent,
      difficulty,
      metadata
    } = req.body;

    const gameScore = new GameScore({
      userId,
      gameType,
      score,
      level,
      accuracy,
      timeSpent,
      difficulty,
      metadata,
      playedAt: new Date()
    });

    await gameScore.save();

    // Update user's best score if this is better
    const user = await User.findById(userId);
    if (user) {
      const gameStats = user.gameStats.get(gameType) || { bestScore: 0, gamesPlayed: 0 };
      
      if (score > gameStats.bestScore) {
        gameStats.bestScore = score;
      }
      gameStats.gamesPlayed += 1;
      
      user.gameStats.set(gameType, gameStats);
      await user.save();
    }

    res.status(201).json({
      success: true,
      data: gameScore
    });
  } catch (error) {
    console.error('Error saving game score:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save game score',
      error: error.message
    });
  }
};

// Get game scores for a specific game type
const getGameScores = async (req, res) => {
  try {
    const { gameType } = req.params;
    const { limit = 10, userId } = req.query;

    const query = { gameType };
    if (userId) {
      query.userId = userId;
    }

    const scores = await GameScore.find(query)
      .sort({ playedAt: -1 })
      .limit(parseInt(limit))
      .populate('userId', 'username email');

    res.json({
      success: true,
      data: scores
    });
  } catch (error) {
    console.error('Error fetching game scores:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch game scores',
      error: error.message
    });
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get recent scores
    const recentScores = await GameScore.find({ userId })
      .sort({ playedAt: -1 })
      .limit(20);

    // Calculate statistics
    const totalGames = recentScores.length;
    const totalScore = recentScores.reduce((sum, score) => sum + score.score, 0);
    const averageScore = totalGames > 0 ? totalScore / totalGames : 0;
    const averageAccuracy = totalGames > 0 
      ? recentScores.reduce((sum, score) => sum + score.accuracy, 0) / totalGames 
      : 0;

    res.json({
      success: true,
      data: {
        gameStats: user.gameStats,
        totalGames,
        averageScore: Math.round(averageScore),
        averageAccuracy: Math.round(averageAccuracy * 100) / 100,
        recentScores: recentScores.slice(0, 5)
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
      error: error.message
    });
  }
};

// Get leaderboard for a specific game
const getLeaderboard = async (req, res) => {
  try {
    const { gameType } = req.params;
    const { limit = 10 } = req.query;

    const leaderboard = await GameScore.aggregate([
      { $match: { gameType } },
      {
        $group: {
          _id: '$userId',
          bestScore: { $max: '$score' },
          gamesPlayed: { $sum: 1 },
          averageAccuracy: { $avg: '$accuracy' }
        }
      },
      { $sort: { bestScore: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $project: {
          userId: '$_id',
          bestScore: 1,
          gamesPlayed: 1,
          averageAccuracy: { $round: ['$averageAccuracy', 2] },
          username: { $arrayElemAt: ['$user.username', 0] }
        }
      }
    ]);

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard',
      error: error.message
    });
  }
};

module.exports = {
  saveGameScore,
  getGameScores,
  getUserStats,
  getLeaderboard
};
