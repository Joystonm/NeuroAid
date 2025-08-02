const mongoose = require('mongoose');

const gameScoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gameType: {
    type: String,
    required: true,
    enum: ['focus-flip', 'dot-dash', 'number-sequence', 'color-match', 'pattern-memory', 'reaction-time']
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  level: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  accuracy: {
    type: Number,
    required: true,
    min: 0,
    max: 1 // Percentage as decimal (0.85 = 85%)
  },
  timeSpent: {
    type: Number,
    required: true,
    min: 0 // Time in seconds
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert'],
    default: 'medium'
  },
  metadata: {
    // Game-specific data
    correctAnswers: Number,
    totalQuestions: Number,
    streak: Number,
    hintsUsed: Number,
    powerUpsUsed: [String],
    gameSettings: mongoose.Schema.Types.Mixed,
    performanceMetrics: {
      reactionTime: Number,
      consistency: Number,
      improvement: Number
    }
  },
  playedAt: {
    type: Date,
    default: Date.now
  },
  sessionId: {
    type: String,
    // Useful for grouping multiple games in one session
  },
  deviceInfo: {
    platform: String,
    browser: String,
    screenSize: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
gameScoreSchema.index({ userId: 1, gameType: 1 });
gameScoreSchema.index({ gameType: 1, score: -1 });
gameScoreSchema.index({ playedAt: -1 });
gameScoreSchema.index({ userId: 1, playedAt: -1 });

// Virtual for performance rating
gameScoreSchema.virtual('performanceRating').get(function() {
  const overallScore = (this.accuracy * 0.7) + ((this.score / 1000) * 0.3);
  
  if (overallScore >= 0.9) return 'Excellent';
  if (overallScore >= 0.8) return 'Great';
  if (overallScore >= 0.7) return 'Good';
  if (overallScore >= 0.6) return 'Fair';
  return 'Needs Improvement';
});

// Static method to get user's best score for a game type
gameScoreSchema.statics.getUserBestScore = function(userId, gameType) {
  return this.findOne({ userId, gameType })
    .sort({ score: -1 })
    .select('score level accuracy playedAt');
};

// Static method to get user's recent scores
gameScoreSchema.statics.getUserRecentScores = function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ playedAt: -1 })
    .limit(limit)
    .select('gameType score level accuracy playedAt');
};

// Static method to get game type statistics
gameScoreSchema.statics.getGameTypeStats = function(gameType) {
  return this.aggregate([
    { $match: { gameType } },
    {
      $group: {
        _id: null,
        totalPlayers: { $addToSet: '$userId' },
        totalGames: { $sum: 1 },
        averageScore: { $avg: '$score' },
        highestScore: { $max: '$score' },
        averageAccuracy: { $avg: '$accuracy' },
        averageTime: { $avg: '$timeSpent' }
      }
    },
    {
      $project: {
        _id: 0,
        totalPlayers: { $size: '$totalPlayers' },
        totalGames: 1,
        averageScore: { $round: ['$averageScore', 2] },
        highestScore: 1,
        averageAccuracy: { $round: ['$averageAccuracy', 3] },
        averageTime: { $round: ['$averageTime', 2] }
      }
    }
  ]);
};

module.exports = mongoose.model('GameScore', gameScoreSchema);
