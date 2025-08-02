// ShapeSorter Game Logic - Visual-Motor Coordination Practice

export const SHAPE_TYPES = {
  CIRCLE: 'circle',
  SQUARE: 'square',
  TRIANGLE: 'triangle',
  DIAMOND: 'diamond',
  STAR: 'star',
  HEXAGON: 'hexagon'
};

export const COLORS = {
  RED: 'red',
  BLUE: 'blue',
  GREEN: 'green',
  YELLOW: 'yellow',
  PURPLE: 'purple',
  ORANGE: 'orange',
  PINK: 'pink',
  CYAN: 'cyan'
};

export const SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large'
};

export const GAME_CONFIG = {
  BASE_POINTS: 15,
  TIME_BONUS_MULTIPLIER: 0.5,
  LEVEL_MULTIPLIER: 1.3,
  SHAPES_PER_LEVEL: {
    1: 4,
    2: 6,
    3: 8,
    4: 10,
    5: 12
  },
  MAX_LEVEL: 8
};

// Generate shapes for a level
export const generateShapes = (level = 1) => {
  const clampedLevel = Math.min(level, GAME_CONFIG.MAX_LEVEL);
  const shapeCount = GAME_CONFIG.SHAPES_PER_LEVEL[Math.min(clampedLevel, 5)] || 12;
  
  // Generate target shape
  const target = generateRandomShape(clampedLevel);
  
  // Generate shapes array with one matching target
  const shapes = [target];
  
  // Add distractors
  while (shapes.length < shapeCount) {
    const distractor = generateDistractorShape(target, clampedLevel);
    
    // Ensure we don't have duplicates
    if (!shapes.some(shape => shapesEqual(shape, distractor))) {
      shapes.push(distractor);
    }
  }
  
  // Shuffle the shapes array
  const shuffledShapes = shuffleArray(shapes);
  
  return {
    shapes: shuffledShapes,
    target: target
  };
};

// Generate a random shape based on level complexity
const generateRandomShape = (level) => {
  const availableTypes = getAvailableShapeTypes(level);
  const availableColors = getAvailableColors(level);
  const availableSizes = getAvailableSizes(level);
  
  return {
    type: availableTypes[Math.floor(Math.random() * availableTypes.length)],
    color: availableColors[Math.floor(Math.random() * availableColors.length)],
    size: availableSizes[Math.floor(Math.random() * availableSizes.length)]
  };
};

// Generate a distractor shape that's similar but not identical to target
const generateDistractorShape = (target, level) => {
  const availableTypes = getAvailableShapeTypes(level);
  const availableColors = getAvailableColors(level);
  const availableSizes = getAvailableSizes(level);
  
  // Decide what to change (type, color, or size)
  const changeOptions = ['type', 'color', 'size'];
  const changeCount = level <= 2 ? 1 : Math.floor(Math.random() * 2) + 1;
  const attributesToChange = shuffleArray(changeOptions).slice(0, changeCount);
  
  let distractor = { ...target };
  
  attributesToChange.forEach(attribute => {
    switch (attribute) {
      case 'type':
        const otherTypes = availableTypes.filter(type => type !== target.type);
        if (otherTypes.length > 0) {
          distractor.type = otherTypes[Math.floor(Math.random() * otherTypes.length)];
        }
        break;
      case 'color':
        const otherColors = availableColors.filter(color => color !== target.color);
        if (otherColors.length > 0) {
          distractor.color = otherColors[Math.floor(Math.random() * otherColors.length)];
        }
        break;
      case 'size':
        const otherSizes = availableSizes.filter(size => size !== target.size);
        if (otherSizes.length > 0) {
          distractor.size = otherSizes[Math.floor(Math.random() * otherSizes.length)];
        }
        break;
    }
  });
  
  return distractor;
};

// Get available shape types based on level
const getAvailableShapeTypes = (level) => {
  const types = [SHAPE_TYPES.CIRCLE, SHAPE_TYPES.SQUARE];
  
  if (level >= 2) types.push(SHAPE_TYPES.TRIANGLE);
  if (level >= 3) types.push(SHAPE_TYPES.DIAMOND);
  if (level >= 4) types.push(SHAPE_TYPES.STAR);
  if (level >= 5) types.push(SHAPE_TYPES.HEXAGON);
  
  return types;
};

// Get available colors based on level
const getAvailableColors = (level) => {
  const colors = [COLORS.RED, COLORS.BLUE, COLORS.GREEN];
  
  if (level >= 2) colors.push(COLORS.YELLOW);
  if (level >= 3) colors.push(COLORS.PURPLE, COLORS.ORANGE);
  if (level >= 4) colors.push(COLORS.PINK, COLORS.CYAN);
  
  return colors;
};

// Get available sizes based on level
const getAvailableSizes = (level) => {
  if (level <= 2) return [SIZES.MEDIUM];
  if (level <= 4) return [SIZES.SMALL, SIZES.MEDIUM];
  return [SIZES.SMALL, SIZES.MEDIUM, SIZES.LARGE];
};

// Check if two shapes are equal
const shapesEqual = (shape1, shape2) => {
  return shape1.type === shape2.type &&
         shape1.color === shape2.color &&
         shape1.size === shape2.size;
};

// Check if selected shape matches target
export const checkShapeMatch = (selectedShape, targetShape) => {
  return shapesEqual(selectedShape, targetShape);
};

// Calculate score based on level and time
export const calculateScore = (level, timeLeft) => {
  const baseScore = GAME_CONFIG.BASE_POINTS;
  const levelMultiplier = Math.pow(GAME_CONFIG.LEVEL_MULTIPLIER, level - 1);
  const timeBonus = Math.floor(timeLeft * GAME_CONFIG.TIME_BONUS_MULTIPLIER);
  
  const totalScore = Math.floor((baseScore + timeBonus) * levelMultiplier);
  
  return Math.max(totalScore, 1);
};

// Get human-readable description of a shape
export const getShapeDescription = (shape) => {
  const sizeText = shape.size === SIZES.SMALL ? 'small' : 
                   shape.size === SIZES.LARGE ? 'large' : '';
  
  const parts = [sizeText, shape.color, shape.type].filter(Boolean);
  return parts.join(' ');
};

// Generate practice shapes for tutorial
export const generatePracticeShapes = () => {
  return {
    target: {
      type: SHAPE_TYPES.CIRCLE,
      color: COLORS.RED,
      size: SIZES.MEDIUM
    },
    shapes: [
      { type: SHAPE_TYPES.CIRCLE, color: COLORS.RED, size: SIZES.MEDIUM },
      { type: SHAPE_TYPES.SQUARE, color: COLORS.RED, size: SIZES.MEDIUM },
      { type: SHAPE_TYPES.CIRCLE, color: COLORS.BLUE, size: SIZES.MEDIUM },
      { type: SHAPE_TYPES.TRIANGLE, color: COLORS.RED, size: SIZES.MEDIUM }
    ]
  };
};

// Analyze shape difficulty
export const analyzeShapeDifficulty = (target, distractors) => {
  let difficulty = 1;
  
  // Count number of similar attributes
  distractors.forEach(distractor => {
    let similarities = 0;
    if (distractor.type === target.type) similarities++;
    if (distractor.color === target.color) similarities++;
    if (distractor.size === target.size) similarities++;
    
    // More similar distractors increase difficulty
    if (similarities === 2) difficulty += 0.5;
    if (similarities === 1) difficulty += 0.3;
  });
  
  // More shapes increase difficulty
  difficulty += distractors.length * 0.1;
  
  return Math.min(difficulty, 5);
};

// Get performance feedback
export const getPerformanceFeedback = (correctSorts, totalAttempts, level, timeSpent) => {
  const accuracy = totalAttempts > 0 ? correctSorts / totalAttempts : 0;
  const averageTimePerSort = totalAttempts > 0 ? timeSpent / totalAttempts : 0;
  
  let feedback = [];
  
  if (accuracy >= 0.9) {
    feedback.push("Excellent shape recognition skills!");
  } else if (accuracy >= 0.8) {
    feedback.push("Great job identifying the shapes!");
  } else if (accuracy >= 0.7) {
    feedback.push("Good work on shape matching!");
  } else {
    feedback.push("Keep practicing - you're improving your visual skills!");
  }
  
  if (averageTimePerSort < 3) {
    feedback.push("Impressive speed and coordination!");
  } else if (averageTimePerSort < 5) {
    feedback.push("Good reaction time!");
  }
  
  if (level >= 5) {
    feedback.push("You're handling complex shape combinations well!");
  }
  
  return feedback.join(' ');
};

// Generate shapes with specific difficulty
export const generateShapesWithDifficulty = (targetDifficulty) => {
  let level = 1;
  let shapes;
  
  do {
    shapes = generateShapes(level);
    const actualDifficulty = analyzeShapeDifficulty(shapes.target, shapes.shapes.filter(s => !shapesEqual(s, shapes.target)));
    
    if (Math.abs(actualDifficulty - targetDifficulty) < 0.5) {
      break;
    }
    
    level = actualDifficulty < targetDifficulty ? level + 1 : Math.max(1, level - 1);
  } while (level <= GAME_CONFIG.MAX_LEVEL);
  
  return shapes;
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

// Check if shape is valid
export const isValidShape = (shape) => {
  return shape &&
         Object.values(SHAPE_TYPES).includes(shape.type) &&
         Object.values(COLORS).includes(shape.color) &&
         Object.values(SIZES).includes(shape.size);
};

// Get shape complexity score
export const getShapeComplexity = (shape) => {
  let complexity = 1;
  
  // Shape type complexity
  const typeComplexity = {
    [SHAPE_TYPES.CIRCLE]: 1,
    [SHAPE_TYPES.SQUARE]: 1,
    [SHAPE_TYPES.TRIANGLE]: 2,
    [SHAPE_TYPES.DIAMOND]: 2,
    [SHAPE_TYPES.STAR]: 3,
    [SHAPE_TYPES.HEXAGON]: 3
  };
  
  complexity += typeComplexity[shape.type] || 1;
  
  // Size adds slight complexity
  if (shape.size === SIZES.SMALL || shape.size === SIZES.LARGE) {
    complexity += 0.5;
  }
  
  return complexity;
};

// Generate adaptive shapes based on user performance
export const generateAdaptiveShapes = (userStats) => {
  const { accuracy, averageTime, level } = userStats;
  
  let targetLevel = level;
  
  // Adjust difficulty based on performance
  if (accuracy > 0.9 && averageTime < 3) {
    targetLevel = Math.min(level + 1, GAME_CONFIG.MAX_LEVEL);
  } else if (accuracy < 0.6 || averageTime > 8) {
    targetLevel = Math.max(level - 1, 1);
  }
  
  return generateShapes(targetLevel);
};
