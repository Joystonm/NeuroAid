// ColorTrap Game Logic - Stroop Effect for Impulse Control

export const COLORS = {
  RED: 'red',
  BLUE: 'blue',
  GREEN: 'green',
  YELLOW: 'yellow',
  PURPLE: 'purple',
  ORANGE: 'orange'
};

export const COLOR_WORDS = Object.keys(COLORS);

export const GAME_CONFIG = {
  INITIAL_TIME: 30,
  BASE_POINTS: 10,
  STREAK_MULTIPLIER: 2,
  TIME_BONUS_MULTIPLIER: 1,
  LEVEL_DIFFICULTY_INCREASE: 0.1,
  MAX_LEVEL: 10
};

// Generate a new color trap challenge
export const generateColorTrapChallenge = (level = 1) => {
  const colorKeys = Object.keys(COLORS);
  const colorValues = Object.values(COLORS);
  
  // Select a random word and a random color for display
  const wordIndex = Math.floor(Math.random() * colorKeys.length);
  const colorIndex = Math.floor(Math.random() * colorValues.length);
  
  const word = colorKeys[wordIndex];
  const textColor = colorValues[colorIndex];
  
  // Generate options (always include the correct answer)
  const correctAnswer = textColor;
  const options = [correctAnswer];
  
  // Add 3 more random colors as options
  while (options.length < 4) {
    const randomColor = colorValues[Math.floor(Math.random() * colorValues.length)];
    if (!options.includes(randomColor)) {
      options.push(randomColor);
    }
  }
  
  // Shuffle options
  const shuffledOptions = shuffleArray(options);
  
  return {
    word,
    textColor,
    correctAnswer,
    options: shuffledOptions,
    isCongruent: word.toLowerCase() === textColor, // Word matches color
    difficulty: level
  };
};

// Check if the selected answer is correct
export const checkAnswer = (challenge, selectedColor) => {
  return challenge.correctAnswer === selectedColor;
};

// Calculate score based on various factors
export const calculateScore = (level, streak, timeLeft) => {
  let baseScore = GAME_CONFIG.BASE_POINTS;
  
  // Level multiplier
  const levelMultiplier = 1 + (level - 1) * 0.2;
  
  // Streak bonus
  const streakBonus = streak > 0 ? Math.floor(streak / 3) * GAME_CONFIG.STREAK_MULTIPLIER : 0;
  
  // Time bonus (faster responses get more points)
  const timeBonus = Math.floor(timeLeft * GAME_CONFIG.TIME_BONUS_MULTIPLIER);
  
  const totalScore = Math.floor((baseScore * levelMultiplier) + streakBonus + timeBonus);
  
  return Math.max(totalScore, 1); // Minimum 1 point
};

// Get difficulty settings for a level
export const getLevelConfig = (level) => {
  const clampedLevel = Math.min(level, GAME_CONFIG.MAX_LEVEL);
  
  return {
    level: clampedLevel,
    timePerQuestion: Math.max(3000 - (clampedLevel * 200), 1500), // Decrease time as level increases
    congruentProbability: Math.max(0.5 - (clampedLevel * 0.05), 0.2), // Less congruent challenges at higher levels
    pointsMultiplier: 1 + (clampedLevel - 1) * 0.1
  };
};

// Generate a set of challenges for practice mode
export const generatePracticeChallenges = (count = 5) => {
  const challenges = [];
  
  for (let i = 0; i < count; i++) {
    challenges.push(generateColorTrapChallenge(1));
  }
  
  return challenges;
};

// Analyze performance and provide insights
export const analyzePerformance = (gameResults) => {
  const {
    correctAnswers,
    totalQuestions,
    averageResponseTime,
    congruentCorrect,
    incongruentCorrect,
    totalCongruent,
    totalIncongruent
  } = gameResults;
  
  const overallAccuracy = totalQuestions > 0 ? correctAnswers / totalQuestions : 0;
  const congruentAccuracy = totalCongruent > 0 ? congruentCorrect / totalCongruent : 0;
  const incongruentAccuracy = totalIncongruent > 0 ? incongruentCorrect / totalIncongruent : 0;
  
  const stroopEffect = congruentAccuracy - incongruentAccuracy;
  
  return {
    overallAccuracy,
    congruentAccuracy,
    incongruentAccuracy,
    stroopEffect,
    averageResponseTime,
    performance: getPerformanceRating(overallAccuracy, stroopEffect),
    recommendations: getRecommendations(overallAccuracy, stroopEffect, averageResponseTime)
  };
};

// Get performance rating
const getPerformanceRating = (accuracy, stroopEffect) => {
  if (accuracy >= 0.9 && stroopEffect < 0.1) return 'Excellent';
  if (accuracy >= 0.8 && stroopEffect < 0.2) return 'Great';
  if (accuracy >= 0.7 && stroopEffect < 0.3) return 'Good';
  if (accuracy >= 0.6) return 'Fair';
  return 'Keep Practicing';
};

// Get personalized recommendations
const getRecommendations = (accuracy, stroopEffect, responseTime) => {
  const recommendations = [];
  
  if (accuracy < 0.7) {
    recommendations.push("Focus on accuracy over speed. Take your time to identify the color.");
  }
  
  if (stroopEffect > 0.3) {
    recommendations.push("Practice ignoring what the word says and focus only on the color you see.");
  }
  
  if (responseTime > 3000) {
    recommendations.push("Try to respond a bit faster while maintaining accuracy.");
  }
  
  if (accuracy >= 0.8 && stroopEffect < 0.2) {
    recommendations.push("Great impulse control! Try increasing the difficulty level.");
  }
  
  if (recommendations.length === 0) {
    recommendations.push("Keep up the great work! Regular practice will continue to improve your focus.");
  }
  
  return recommendations;
};

// Utility function to shuffle array
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Generate color combinations that are challenging
export const generateChallengingCombination = (level) => {
  const colorKeys = Object.keys(COLORS);
  const colorValues = Object.values(COLORS);
  
  // At higher levels, prefer incongruent combinations
  const shouldBeIncongruent = level > 2 && Math.random() > 0.3;
  
  let word, textColor;
  
  if (shouldBeIncongruent) {
    // Ensure word and color don't match
    word = colorKeys[Math.floor(Math.random() * colorKeys.length)];
    do {
      textColor = colorValues[Math.floor(Math.random() * colorValues.length)];
    } while (textColor === COLORS[word]);
  } else {
    // Allow any combination
    word = colorKeys[Math.floor(Math.random() * colorKeys.length)];
    textColor = colorValues[Math.floor(Math.random() * colorValues.length)];
  }
  
  return { word, textColor };
};

// Calculate improvement over time
export const calculateImprovement = (previousScores, currentScore) => {
  if (previousScores.length === 0) return 0;
  
  const recentAverage = previousScores.slice(-3).reduce((sum, score) => sum + score, 0) / Math.min(3, previousScores.length);
  const improvement = ((currentScore - recentAverage) / recentAverage) * 100;
  
  return Math.round(improvement);
};
