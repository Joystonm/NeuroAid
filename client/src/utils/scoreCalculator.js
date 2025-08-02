// Score calculation utilities

export const calculateBaseScore = (correctAnswers, totalQuestions, timeSpent, maxTime) => {
  const accuracy = correctAnswers / totalQuestions;
  const timeBonus = Math.max(0, (maxTime - timeSpent) / maxTime);
  const baseScore = Math.floor(accuracy * 1000 + timeBonus * 500);
  
  return Math.max(0, baseScore);
};

export const calculateLevelMultiplier = (level) => {
  return 1 + (level - 1) * 0.1; // 10% increase per level
};

export const calculateStreakBonus = (streak) => {
  if (streak < 3) return 0;
  if (streak < 5) return 50;
  if (streak < 10) return 100;
  return 200;
};

export const calculateDifficultyMultiplier = (difficulty) => {
  const multipliers = {
    easy: 1.0,
    medium: 1.2,
    hard: 1.5,
    expert: 2.0
  };
  
  return multipliers[difficulty.toLowerCase()] || 1.0;
};

export const calculateFinalScore = (gameData) => {
  const {
    correctAnswers,
    totalQuestions,
    timeSpent,
    maxTime,
    level = 1,
    streak = 0,
    difficulty = 'medium'
  } = gameData;

  const baseScore = calculateBaseScore(correctAnswers, totalQuestions, timeSpent, maxTime);
  const levelMultiplier = calculateLevelMultiplier(level);
  const streakBonus = calculateStreakBonus(streak);
  const difficultyMultiplier = calculateDifficultyMultiplier(difficulty);

  const finalScore = Math.floor(
    (baseScore * levelMultiplier * difficultyMultiplier) + streakBonus
  );

  return {
    baseScore,
    levelMultiplier,
    streakBonus,
    difficultyMultiplier,
    finalScore,
    accuracy: correctAnswers / totalQuestions,
    timeEfficiency: Math.max(0, (maxTime - timeSpent) / maxTime)
  };
};

export const getPerformanceRating = (accuracy, timeEfficiency) => {
  const overallScore = (accuracy * 0.7) + (timeEfficiency * 0.3);
  
  if (overallScore >= 0.9) return 'Excellent';
  if (overallScore >= 0.8) return 'Great';
  if (overallScore >= 0.7) return 'Good';
  if (overallScore >= 0.6) return 'Fair';
  return 'Needs Improvement';
};

export const calculateProgressPercentage = (currentScore, previousBest) => {
  if (!previousBest || previousBest === 0) return 0;
  
  const improvement = ((currentScore - previousBest) / previousBest) * 100;
  return Math.round(improvement * 100) / 100; // Round to 2 decimal places
};
