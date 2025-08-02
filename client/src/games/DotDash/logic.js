// DotDash Game Logic - Pattern Recognition and Sequential Memory

export const GAME_CONFIG = {
  INITIAL_PATTERN_LENGTH: 3,
  MAX_PATTERN_LENGTH: 8,
  PATTERN_INCREMENT: 1,
  DOT_DURATION: 300,
  DASH_DURATION: 800,
  PAUSE_DURATION: 200,
  POINTS_PER_CORRECT: 50,
  LEVEL_BONUS: 25
};

export const SYMBOLS = {
  DOT: 'dot',
  DASH: 'dash'
};

// Generate a random pattern of dots and dashes
export const generatePattern = (length) => {
  const pattern = [];
  for (let i = 0; i < length; i++) {
    pattern.push(Math.random() < 0.5 ? SYMBOLS.DOT : SYMBOLS.DASH);
  }
  return pattern;
};

// Play pattern with timing (for audio/visual feedback)
export const playPattern = async (pattern, onSymbol) => {
  for (let i = 0; i < pattern.length; i++) {
    const symbol = pattern[i];
    onSymbol(symbol, true); // Show symbol
    
    const duration = symbol === SYMBOLS.DOT ? 
      GAME_CONFIG.DOT_DURATION : 
      GAME_CONFIG.DASH_DURATION;
    
    await sleep(duration);
    onSymbol(symbol, false); // Hide symbol
    
    if (i < pattern.length - 1) {
      await sleep(GAME_CONFIG.PAUSE_DURATION);
    }
  }
};

// Compare two patterns for equality
export const comparePatterns = (pattern1, pattern2) => {
  if (pattern1.length !== pattern2.length) return false;
  return pattern1.every((symbol, index) => symbol === pattern2[index]);
};

// Calculate score based on level and round
export const calculateScore = (level, round) => {
  const baseScore = GAME_CONFIG.POINTS_PER_CORRECT;
  const levelBonus = level * GAME_CONFIG.LEVEL_BONUS;
  const roundBonus = round * 5; // Small bonus for later rounds
  
  return baseScore + levelBonus + roundBonus;
};

// Get next level configuration
export const getNextLevelConfig = (currentLevel) => {
  const patternLength = Math.min(
    GAME_CONFIG.INITIAL_PATTERN_LENGTH + Math.floor(currentLevel / 2),
    GAME_CONFIG.MAX_PATTERN_LENGTH
  );
  
  return {
    level: currentLevel + 1,
    patternLength,
    speed: Math.max(0.5, 1 - (currentLevel * 0.1)) // Increase speed as level increases
  };
};

// Generate practice patterns for tutorial
export const generatePracticePatterns = () => {
  return [
    {
      pattern: ['dot', 'dash'],
      description: 'Short-Long pattern'
    },
    {
      pattern: ['dot', 'dot', 'dash'],
      description: 'Short-Short-Long pattern'
    },
    {
      pattern: ['dash', 'dot', 'dash'],
      description: 'Long-Short-Long pattern'
    }
  ];
};

// Analyze performance and provide insights
export const analyzePerformance = (gameResults) => {
  const {
    correctAnswers,
    totalAttempts,
    averageResponseTime,
    patternLengths
  } = gameResults;
  
  const accuracy = totalAttempts > 0 ? correctAnswers / totalAttempts : 0;
  const averagePatternLength = patternLengths.reduce((a, b) => a + b, 0) / patternLengths.length;
  
  return {
    accuracy,
    averagePatternLength,
    averageResponseTime,
    performance: getPerformanceRating(accuracy, averageResponseTime),
    recommendations: getRecommendations(accuracy, averageResponseTime, averagePatternLength)
  };
};

// Get performance rating based on accuracy and speed
const getPerformanceRating = (accuracy, responseTime) => {
  if (accuracy >= 0.9 && responseTime < 2000) return 'Excellent';
  if (accuracy >= 0.8 && responseTime < 3000) return 'Great';
  if (accuracy >= 0.7 && responseTime < 4000) return 'Good';
  if (accuracy >= 0.6) return 'Fair';
  return 'Keep Practicing';
};

// Get personalized recommendations
const getRecommendations = (accuracy, responseTime, patternLength) => {
  const recommendations = [];
  
  if (accuracy < 0.7) {
    recommendations.push("Focus on accuracy first. Take your time to remember the pattern.");
  }
  
  if (responseTime > 4000) {
    recommendations.push("Try to respond a bit faster while maintaining accuracy.");
  }
  
  if (patternLength >= 6 && accuracy >= 0.8) {
    recommendations.push("Great job with complex patterns! You're developing strong sequential memory.");
  }
  
  if (accuracy >= 0.9) {
    recommendations.push("Excellent pattern recognition! Try increasing the difficulty level.");
  }
  
  if (recommendations.length === 0) {
    recommendations.push("Keep practicing regularly to improve your sequential memory skills!");
  }
  
  return recommendations;
};

// Convert pattern to morse code representation
export const patternToMorse = (pattern) => {
  return pattern.map(symbol => symbol === SYMBOLS.DOT ? '•' : '—').join(' ');
};

// Generate hint for current pattern
export const generateHint = (pattern, userInput) => {
  if (userInput.length === 0) {
    return `The pattern starts with a ${pattern[0]}`;
  }
  
  if (userInput.length < pattern.length) {
    const nextSymbol = pattern[userInput.length];
    return `Next symbol is a ${nextSymbol}`;
  }
  
  return "Pattern complete!";
};

// Check if pattern is valid
export const isValidPattern = (pattern) => {
  return Array.isArray(pattern) && 
         pattern.length > 0 && 
         pattern.every(symbol => Object.values(SYMBOLS).includes(symbol));
};

// Calculate difficulty score for a pattern
export const getPatternDifficulty = (pattern) => {
  let difficulty = pattern.length; // Base difficulty is length
  
  // Add difficulty for alternating patterns
  let alternations = 0;
  for (let i = 1; i < pattern.length; i++) {
    if (pattern[i] !== pattern[i - 1]) {
      alternations++;
    }
  }
  
  difficulty += alternations * 0.5;
  
  return Math.min(difficulty, 10); // Cap at 10
};

// Generate adaptive pattern based on user performance
export const generateAdaptivePattern = (userStats) => {
  const { accuracy, averageTime, level } = userStats;
  
  let targetLength = GAME_CONFIG.INITIAL_PATTERN_LENGTH + Math.floor(level / 2);
  
  // Adjust based on performance
  if (accuracy > 0.9 && averageTime < 2000) {
    targetLength = Math.min(targetLength + 1, GAME_CONFIG.MAX_PATTERN_LENGTH);
  } else if (accuracy < 0.6 || averageTime > 5000) {
    targetLength = Math.max(targetLength - 1, 2);
  }
  
  return generatePattern(targetLength);
};

// Utility function for delays
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
