// FocusFlip Game Logic

export const GAME_CONFIG = {
  INITIAL_CARDS: 8,
  MAX_CARDS: 16,
  LEVEL_INCREMENT: 2,
  TIME_LIMIT: 60000, // 60 seconds
  POINTS_PER_MATCH: 100,
  BONUS_MULTIPLIER: 1.5
};

// Card symbols for the memory game
const CARD_SYMBOLS = [
  '🌟', '🎈', '🎯', '🎨', '🎪', '🎭', '🎸', '🎺',
  '🌈', '🌸', '🌺', '🌻', '🌷', '🌹', '🌼', '🌿',
  '🍎', '🍊', '🍋', '🍌', '🍇', '🍓', '🍒', '🍑',
  '⭐', '💎', '🔥', '💫', '✨', '🌙', '☀️', '🌍'
];

export const generateCards = (count) => {
  // Ensure even number of cards for pairs
  const cardCount = Math.floor(count / 2) * 2;
  const pairs = cardCount / 2;
  const cards = [];
  
  // Get random symbols for this game
  const selectedSymbols = shuffleArray(CARD_SYMBOLS).slice(0, pairs);
  
  // Create pairs
  selectedSymbols.forEach((symbol, index) => {
    cards.push({ 
      id: index * 2, 
      value: index, 
      symbol: symbol,
      matched: false, 
      flipped: false 
    });
    cards.push({ 
      id: index * 2 + 1, 
      value: index, 
      symbol: symbol,
      matched: false, 
      flipped: false 
    });
  });
  
  return shuffleArray(cards);
};

export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const calculateScore = (level, timeLeft, moves) => {
  const baseScore = GAME_CONFIG.POINTS_PER_MATCH;
  const levelMultiplier = 1 + (level - 1) * 0.2;
  const timeBonus = Math.floor(timeLeft * 2); // 2 points per second remaining
  const efficiencyBonus = Math.max(0, 50 - moves * 2); // Bonus for fewer moves
  
  const totalScore = Math.floor((baseScore + timeBonus + efficiencyBonus) * levelMultiplier);
  
  return Math.max(totalScore, 10); // Minimum 10 points
};

export const checkGameComplete = (matchedCards, totalCards) => {
  return matchedCards.length === totalCards;
};

export const getNextLevelConfig = (currentLevel) => {
  const cardCount = Math.min(
    GAME_CONFIG.INITIAL_CARDS + (currentLevel - 1) * GAME_CONFIG.LEVEL_INCREMENT,
    GAME_CONFIG.MAX_CARDS
  );
  
  return {
    level: currentLevel + 1,
    cardCount,
    timeLimit: GAME_CONFIG.TIME_LIMIT - (currentLevel * 5000) // Decrease time as level increases
  };
};

export const getPerformanceRating = (accuracy, moves, timeSpent) => {
  let rating = 0;
  
  // Accuracy component (0-40 points)
  rating += accuracy * 40;
  
  // Efficiency component (0-30 points)
  const efficiency = Math.max(0, 1 - (moves - 10) / 20); // Optimal around 10 moves
  rating += efficiency * 30;
  
  // Speed component (0-30 points)
  const speed = Math.max(0, 1 - timeSpent / 120); // Optimal under 2 minutes
  rating += speed * 30;
  
  if (rating >= 90) return 'Excellent';
  if (rating >= 75) return 'Great';
  if (rating >= 60) return 'Good';
  if (rating >= 45) return 'Fair';
  return 'Keep Practicing';
};

export const generateHint = (cards, flippedCards, matchedCards) => {
  // Find unmatched cards
  const unmatchedCards = cards.filter((_, index) => 
    !matchedCards.includes(index) && !flippedCards.includes(index)
  );
  
  if (unmatchedCards.length === 0) return null;
  
  // Find a pair that exists
  const cardValues = unmatchedCards.map((card, index) => ({ card, originalIndex: cards.indexOf(card) }));
  
  for (let i = 0; i < cardValues.length; i++) {
    for (let j = i + 1; j < cardValues.length; j++) {
      if (cardValues[i].card.value === cardValues[j].card.value) {
        return {
          message: `Look for the ${cardValues[i].card.symbol} symbol!`,
          positions: [cardValues[i].originalIndex, cardValues[j].originalIndex]
        };
      }
    }
  }
  
  return { message: "Keep looking for matching pairs!", positions: [] };
};
