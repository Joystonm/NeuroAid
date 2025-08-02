const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profile: {
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    avatar: String
  },
  gameStats: {
    type: Map,
    of: {
      bestScore: { type: Number, default: 0 },
      gamesPlayed: { type: Number, default: 0 },
      totalTimeSpent: { type: Number, default: 0 }, // in seconds
      averageAccuracy: { type: Number, default: 0 },
      currentStreak: { type: Number, default: 0 },
      longestStreak: { type: Number, default: 0 }
    },
    default: new Map()
  },
  preferences: {
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'adaptive'],
      default: 'medium'
    },
    soundEnabled: { type: Boolean, default: true },
    notificationsEnabled: { type: Boolean, default: true },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    }
  },
  achievements: [{
    name: String,
    description: String,
    unlockedAt: { type: Date, default: Date.now },
    icon: String
  }],
  lastActive: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ lastActive: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  if (this.profile.firstName && this.profile.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return this.username;
});

// Method to update last active timestamp
userSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save();
};

// Method to get total games played across all game types
userSchema.methods.getTotalGamesPlayed = function() {
  let total = 0;
  for (let [gameType, stats] of this.gameStats) {
    total += stats.gamesPlayed;
  }
  return total;
};

// Method to get overall best score
userSchema.methods.getOverallBestScore = function() {
  let bestScore = 0;
  for (let [gameType, stats] of this.gameStats) {
    if (stats.bestScore > bestScore) {
      bestScore = stats.bestScore;
    }
  }
  return bestScore;
};

module.exports = mongoose.model('User', userSchema);
