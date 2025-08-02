// SequenceSense Game Logic - Pattern Recognition and Cognitive Planning

export const SEQUENCE_TYPES = {
  ARITHMETIC: 'arithmetic',
  GEOMETRIC: 'geometric',
  FIBONACCI: 'fibonacci',
  SQUARE: 'square',
  PRIME: 'prime',
  CUSTOM: 'custom'
};

export const GAME_CONFIG = {
  BASE_POINTS: 20,
  HINT_PENALTY: 0.5,
  LEVEL_MULTIPLIER: 1.2,
  SEQUENCE_LENGTH: 5,
  MAX_LEVEL: 8
};

// Generate a sequence based on level and type
export const generateSequence = (level = 1) => {
  const clampedLevel = Math.min(level, GAME_CONFIG.MAX_LEVEL);
  const sequenceTypes = getAvailableSequenceTypes(clampedLevel);
  const type = sequenceTypes[Math.floor(Math.random() * sequenceTypes.length)];
  
  switch (type) {
    case SEQUENCE_TYPES.ARITHMETIC:
      return generateArithmeticSequence(clampedLevel);
    case SEQUENCE_TYPES.GEOMETRIC:
      return generateGeometricSequence(clampedLevel);
    case SEQUENCE_TYPES.FIBONACCI:
      return generateFibonacciSequence(clampedLevel);
    case SEQUENCE_TYPES.SQUARE:
      return generateSquareSequence(clampedLevel);
    case SEQUENCE_TYPES.PRIME:
      return generatePrimeSequence(clampedLevel);
    case SEQUENCE_TYPES.CUSTOM:
      return generateCustomSequence(clampedLevel);
    default:
      return generateArithmeticSequence(clampedLevel);
  }
};

// Get available sequence types based on level
const getAvailableSequenceTypes = (level) => {
  const types = [SEQUENCE_TYPES.ARITHMETIC];
  
  if (level >= 2) types.push(SEQUENCE_TYPES.GEOMETRIC);
  if (level >= 3) types.push(SEQUENCE_TYPES.SQUARE);
  if (level >= 4) types.push(SEQUENCE_TYPES.FIBONACCI);
  if (level >= 5) types.push(SEQUENCE_TYPES.PRIME);
  if (level >= 6) types.push(SEQUENCE_TYPES.CUSTOM);
  
  return types;
};

// Generate arithmetic sequence (add/subtract constant)
const generateArithmeticSequence = (level) => {
  const start = Math.floor(Math.random() * 20) + 1;
  const difference = level <= 2 ? 
    Math.floor(Math.random() * 5) + 1 : 
    Math.floor(Math.random() * 10) + 1;
  
  // Sometimes use negative differences for higher levels
  const actualDifference = level >= 3 && Math.random() < 0.3 ? -difference : difference;
  
  const sequence = [];
  for (let i = 0; i < GAME_CONFIG.SEQUENCE_LENGTH; i++) {
    sequence.push(start + (i * actualDifference));
  }
  
  const answer = start + (GAME_CONFIG.SEQUENCE_LENGTH * actualDifference);
  
  return {
    sequence,
    answer,
    type: SEQUENCE_TYPES.ARITHMETIC,
    hint: actualDifference > 0 ? 
      `Add ${actualDifference} each time` : 
      `Subtract ${Math.abs(actualDifference)} each time`,
    difficulty: level
  };
};

// Generate geometric sequence (multiply/divide by constant)
const generateGeometricSequence = (level) => {
  const start = Math.floor(Math.random() * 5) + 1;
  const ratio = level <= 3 ? 2 : Math.floor(Math.random() * 3) + 2;
  
  const sequence = [];
  for (let i = 0; i < GAME_CONFIG.SEQUENCE_LENGTH; i++) {
    sequence.push(start * Math.pow(ratio, i));
  }
  
  const answer = start * Math.pow(ratio, GAME_CONFIG.SEQUENCE_LENGTH);
  
  return {
    sequence,
    answer,
    type: SEQUENCE_TYPES.GEOMETRIC,
    hint: `Multiply by ${ratio} each time`,
    difficulty: level
  };
};

// Generate Fibonacci-like sequence
const generateFibonacciSequence = (level) => {
  const start1 = Math.floor(Math.random() * 3) + 1;
  const start2 = Math.floor(Math.random() * 3) + 1;
  
  const sequence = [start1, start2];
  
  for (let i = 2; i < GAME_CONFIG.SEQUENCE_LENGTH; i++) {
    sequence.push(sequence[i - 1] + sequence[i - 2]);
  }
  
  const answer = sequence[GAME_CONFIG.SEQUENCE_LENGTH - 1] + sequence[GAME_CONFIG.SEQUENCE_LENGTH - 2];
  
  return {
    sequence,
    answer,
    type: SEQUENCE_TYPES.FIBONACCI,
    hint: 'Each number is the sum of the two previous numbers',
    difficulty: level
  };
};

// Generate square number sequence
const generateSquareSequence = (level) => {
  const start = Math.floor(Math.random() * 3) + 1;
  
  const sequence = [];
  for (let i = 0; i < GAME_CONFIG.SEQUENCE_LENGTH; i++) {
    const num = start + i;
    sequence.push(num * num);
  }
  
  const nextNum = start + GAME_CONFIG.SEQUENCE_LENGTH;
  const answer = nextNum * nextNum;
  
  return {
    sequence,
    answer,
    type: SEQUENCE_TYPES.SQUARE,
    hint: 'Each number is a perfect square',
    difficulty: level
  };
};

// Generate prime number sequence
const generatePrimeSequence = (level) => {
  const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
  const startIndex = Math.floor(Math.random() * 3);
  
  const sequence = primes.slice(startIndex, startIndex + GAME_CONFIG.SEQUENCE_LENGTH);
  const answer = primes[startIndex + GAME_CONFIG.SEQUENCE_LENGTH];
  
  return {
    sequence,
    answer,
    type: SEQUENCE_TYPES.PRIME,
    hint: 'These are prime numbers (only divisible by 1 and themselves)',
    difficulty: level
  };
};

// Generate custom/complex sequences
const generateCustomSequence = (level) => {
  const patterns = [
    // Alternating add/subtract
    () => {
      const start = Math.floor(Math.random() * 10) + 1;
      const add = Math.floor(Math.random() * 5) + 2;
      const subtract = Math.floor(Math.random() * 3) + 1;
      
      const sequence = [start];
      for (let i = 1; i < GAME_CONFIG.SEQUENCE_LENGTH; i++) {
        if (i % 2 === 1) {
          sequence.push(sequence[i - 1] + add);
        } else {
          sequence.push(sequence[i - 1] - subtract);
        }
      }
      
      const answer = GAME_CONFIG.SEQUENCE_LENGTH % 2 === 1 ? 
        sequence[GAME_CONFIG.SEQUENCE_LENGTH - 1] + add :
        sequence[GAME_CONFIG.SEQUENCE_LENGTH - 1] - subtract;
      
      return {
        sequence,
        answer,
        hint: `Alternating pattern: add ${add}, subtract ${subtract}`,
        difficulty: level
      };
    },
    
    // Powers of a number
    () => {
      const base = Math.floor(Math.random() * 2) + 2; // 2 or 3
      const sequence = [];
      
      for (let i = 1; i <= GAME_CONFIG.SEQUENCE_LENGTH; i++) {
        sequence.push(Math.pow(base, i));
      }
      
      const answer = Math.pow(base, GAME_CONFIG.SEQUENCE_LENGTH + 1);
      
      return {
        sequence,
        answer,
        hint: `Powers of ${base}`,
        difficulty: level
      };
    }
  ];
  
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
  const result = pattern();
  
  return {
    ...result,
    type: SEQUENCE_TYPES.CUSTOM
  };
};

// Validate user answer
export const validateAnswer = (sequenceData, userAnswer) => {
  return sequenceData.answer === userAnswer;
};

// Get next number in sequence (for validation)
export const getNextInSequence = (sequenceData) => {
  return sequenceData.answer;
};

// Calculate score based on various factors
export const calculateScore = (level, hintUsed, questionNumber) => {
  let baseScore = GAME_CONFIG.BASE_POINTS;
  
  // Level multiplier
  const levelMultiplier = Math.pow(GAME_CONFIG.LEVEL_MULTIPLIER, level - 1);
  
  // Question progression bonus
  const progressionBonus = questionNumber * 2;
  
  // Hint penalty
  const hintMultiplier = hintUsed ? GAME_CONFIG.HINT_PENALTY : 1;
  
  const totalScore = Math.floor((baseScore + progressionBonus) * levelMultiplier * hintMultiplier);
  
  return Math.max(totalScore, 1);
};

// Generate practice sequences for tutorial
export const generatePracticeSequences = () => {
  return [
    {
      sequence: [2, 4, 6, 8, 10],
      answer: 12,
      type: SEQUENCE_TYPES.ARITHMETIC,
      hint: 'Add 2 each time',
      difficulty: 1
    },
    {
      sequence: [1, 4, 9, 16, 25],
      answer: 36,
      type: SEQUENCE_TYPES.SQUARE,
      hint: 'Perfect squares: 1², 2², 3², 4², 5²',
      difficulty: 2
    },
    {
      sequence: [1, 1, 2, 3, 5],
      answer: 8,
      type: SEQUENCE_TYPES.FIBONACCI,
      hint: 'Each number is the sum of the two before it',
      difficulty: 3
    }
  ];
};

// Analyze sequence difficulty
export const analyzeSequenceDifficulty = (sequenceData) => {
  const { type, sequence, answer } = sequenceData;
  
  let difficulty = 1;
  
  // Base difficulty by type
  switch (type) {
    case SEQUENCE_TYPES.ARITHMETIC:
      difficulty = 1;
      break;
    case SEQUENCE_TYPES.GEOMETRIC:
      difficulty = 2;
      break;
    case SEQUENCE_TYPES.SQUARE:
      difficulty = 3;
      break;
    case SEQUENCE_TYPES.FIBONACCI:
      difficulty = 4;
      break;
    case SEQUENCE_TYPES.PRIME:
      difficulty = 4;
      break;
    case SEQUENCE_TYPES.CUSTOM:
      difficulty = 5;
      break;
  }
  
  // Adjust for number size
  const maxNumber = Math.max(...sequence, answer);
  if (maxNumber > 100) difficulty += 1;
  if (maxNumber > 1000) difficulty += 1;
  
  // Adjust for negative numbers
  const hasNegative = sequence.some(num => num < 0) || answer < 0;
  if (hasNegative) difficulty += 1;
  
  return Math.min(difficulty, 5);
};

// Get performance feedback
export const getPerformanceFeedback = (correctAnswers, totalQuestions, hintsUsed, level) => {
  const accuracy = totalQuestions > 0 ? correctAnswers / totalQuestions : 0;
  const hintRatio = totalQuestions > 0 ? hintsUsed / totalQuestions : 0;
  
  let feedback = [];
  
  if (accuracy >= 0.9) {
    feedback.push("Excellent pattern recognition skills!");
  } else if (accuracy >= 0.7) {
    feedback.push("Good job identifying the patterns!");
  } else if (accuracy >= 0.5) {
    feedback.push("You're getting better at spotting patterns!");
  } else {
    feedback.push("Keep practicing - pattern recognition takes time to develop!");
  }
  
  if (hintRatio <= 0.2) {
    feedback.push("Great independent thinking!");
  } else if (hintRatio <= 0.5) {
    feedback.push("Good use of hints when needed!");
  } else {
    feedback.push("Try to solve a few without hints to build confidence!");
  }
  
  if (level >= 5) {
    feedback.push("You're tackling advanced sequences - impressive!");
  }
  
  return feedback.join(' ');
};

// Generate hint for a sequence
export const generateHint = (sequenceData) => {
  return sequenceData.hint;
};

// Check if sequence is valid
export const isValidSequence = (sequence) => {
  return Array.isArray(sequence) && 
         sequence.length >= 3 && 
         sequence.every(num => typeof num === 'number' && !isNaN(num));
};
