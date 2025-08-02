// WordChain Game Logic

export const GAME_CONFIG = {
  BASE_SCORE: 100,
  STREAK_MULTIPLIER: 1.2,
  TIME_BONUS_MULTIPLIER: 2,
  CHAIN_BONUS: 10,
  LEVEL_MULTIPLIER: 1.1
};

// Word lists organized by difficulty level
const STARTER_WORDS = {
  1: ['cat', 'dog', 'sun', 'tree', 'book', 'car', 'house', 'water', 'fire', 'bird'],
  2: ['ocean', 'mountain', 'forest', 'music', 'dance', 'sport', 'school', 'friend', 'family', 'travel'],
  3: ['adventure', 'mystery', 'science', 'technology', 'creativity', 'wisdom', 'courage', 'freedom', 'justice', 'harmony'],
  4: ['philosophy', 'innovation', 'sustainability', 'consciousness', 'transformation', 'enlightenment', 'perseverance', 'authenticity', 'serendipity', 'metamorphosis'],
  5: ['transcendence', 'quintessential', 'paradigm', 'epiphany', 'synchronicity', 'juxtaposition', 'dichotomy', 'paradox', 'catalyst', 'renaissance']
};

// Word associations and categories for validation and hints
const WORD_ASSOCIATIONS = {
  // Animals
  'cat': ['pet', 'animal', 'feline', 'meow', 'whiskers', 'fur', 'paw', 'tail', 'kitten', 'purr'],
  'dog': ['pet', 'animal', 'canine', 'bark', 'loyal', 'fur', 'paw', 'tail', 'puppy', 'fetch'],
  'bird': ['animal', 'fly', 'wings', 'feathers', 'nest', 'song', 'sky', 'tweet', 'beak', 'egg'],
  
  // Nature
  'sun': ['light', 'bright', 'hot', 'day', 'solar', 'yellow', 'star', 'energy', 'warm', 'sky'],
  'tree': ['nature', 'green', 'leaves', 'branch', 'root', 'forest', 'wood', 'shade', 'oxygen', 'plant'],
  'water': ['liquid', 'drink', 'ocean', 'river', 'rain', 'wet', 'blue', 'life', 'flow', 'clean'],
  'fire': ['hot', 'burn', 'flame', 'red', 'heat', 'light', 'smoke', 'danger', 'warm', 'energy'],
  'ocean': ['water', 'blue', 'waves', 'deep', 'fish', 'salt', 'beach', 'vast', 'tide', 'sea'],
  'mountain': ['high', 'peak', 'climb', 'rock', 'snow', 'view', 'tall', 'nature', 'summit', 'stone'],
  'forest': ['trees', 'green', 'nature', 'woods', 'animals', 'leaves', 'peaceful', 'wild', 'plants', 'shade'],
  
  // Objects
  'book': ['read', 'story', 'pages', 'knowledge', 'learn', 'words', 'library', 'author', 'paper', 'text'],
  'car': ['drive', 'vehicle', 'transport', 'road', 'wheels', 'engine', 'travel', 'speed', 'fuel', 'metal'],
  'house': ['home', 'building', 'live', 'roof', 'door', 'window', 'family', 'shelter', 'room', 'walls'],
  
  // Abstract concepts
  'music': ['sound', 'song', 'melody', 'rhythm', 'instrument', 'dance', 'harmony', 'beat', 'note', 'listen'],
  'dance': ['movement', 'rhythm', 'music', 'graceful', 'steps', 'performance', 'art', 'expression', 'body', 'flow'],
  'sport': ['game', 'competition', 'athletic', 'team', 'exercise', 'fitness', 'play', 'skill', 'training', 'victory'],
  'school': ['learn', 'education', 'student', 'teacher', 'knowledge', 'study', 'classroom', 'books', 'test', 'grade'],
  'friend': ['companion', 'buddy', 'loyal', 'trust', 'support', 'fun', 'relationship', 'care', 'share', 'bond'],
  'family': ['relatives', 'love', 'support', 'home', 'parents', 'children', 'bond', 'care', 'together', 'blood'],
  'travel': ['journey', 'adventure', 'explore', 'destination', 'vacation', 'experience', 'culture', 'distance', 'trip', 'discover']
};

// Common word categories for hints
const WORD_CATEGORIES = {
  'cat': ['animals', 'pets', 'mammals'],
  'dog': ['animals', 'pets', 'mammals'],
  'bird': ['animals', 'flying creatures', 'nature'],
  'sun': ['celestial bodies', 'weather', 'energy sources'],
  'tree': ['plants', 'nature', 'living things'],
  'water': ['liquids', 'natural elements', 'essentials'],
  'fire': ['elements', 'energy', 'natural forces'],
  'book': ['objects', 'education', 'entertainment'],
  'car': ['vehicles', 'transportation', 'machines'],
  'house': ['buildings', 'shelter', 'architecture'],
  'music': ['arts', 'entertainment', 'sounds'],
  'dance': ['arts', 'movement', 'performance'],
  'sport': ['activities', 'competition', 'physical'],
  'school': ['education', 'institutions', 'learning'],
  'friend': ['relationships', 'people', 'social'],
  'family': ['relationships', 'people', 'social'],
  'travel': ['activities', 'movement', 'exploration']
};

/**
 * Generate a starting word based on the current level
 * @param {number} level - Current game level
 * @returns {string} - Starting word
 */
export const generateStartWord = (level) => {
  const levelWords = STARTER_WORDS[Math.min(level, 5)] || STARTER_WORDS[1];
  const randomIndex = Math.floor(Math.random() * levelWords.length);
  return levelWords[randomIndex];
};

/**
 * Validate if a word connects well to the current word
 * @param {string} currentWord - The current word in the chain
 * @param {string} inputWord - The word the user wants to add
 * @param {Array} wordChain - The current word chain
 * @returns {Object} - Validation result with isValid, connection, and reason
 */
export const validateWordConnection = (currentWord, inputWord, wordChain) => {
  // Basic validation
  if (!inputWord || inputWord.length < 2) {
    return {
      isValid: false,
      reason: 'Word must be at least 2 letters long.',
      connection: ''
    };
  }

  // Check if word was already used
  if (wordChain.includes(inputWord)) {
    return {
      isValid: false,
      reason: 'This word was already used in your chain.',
      connection: ''
    };
  }

  // Check if it's the same word
  if (currentWord === inputWord) {
    return {
      isValid: false,
      reason: 'You cannot use the same word.',
      connection: ''
    };
  }

  // Check direct associations
  const currentAssociations = WORD_ASSOCIATIONS[currentWord] || [];
  if (currentAssociations.includes(inputWord)) {
    return {
      isValid: true,
      connection: `Great connection! ${inputWord} is directly related to ${currentWord}.`,
      reason: ''
    };
  }

  // Check reverse associations
  const inputAssociations = WORD_ASSOCIATIONS[inputWord] || [];
  if (inputAssociations.includes(currentWord)) {
    return {
      isValid: true,
      connection: `Nice! ${currentWord} relates well to ${inputWord}.`,
      reason: ''
    };
  }

  // Check for common categories
  const currentCategories = WORD_CATEGORIES[currentWord] || [];
  const inputCategories = WORD_CATEGORIES[inputWord] || [];
  
  for (const category of currentCategories) {
    if (inputCategories.includes(category)) {
      return {
        isValid: true,
        connection: `Both words belong to the ${category} category.`,
        reason: ''
      };
    }
  }

  // Check for phonetic similarity (rhyming or similar sounds)
  if (checkPhoneticSimilarity(currentWord, inputWord)) {
    return {
      isValid: true,
      connection: `These words sound similar or rhyme.`,
      reason: ''
    };
  }

  // Check for letter patterns (starting/ending with same letters)
  if (checkLetterPatterns(currentWord, inputWord)) {
    return {
      isValid: true,
      connection: `These words share similar letter patterns.`,
      reason: ''
    };
  }

  // If no strong connection found, be more lenient for creativity
  if (inputWord.length >= 3) {
    return {
      isValid: true,
      connection: `Creative connection! Every word can relate in some way.`,
      reason: ''
    };
  }

  return {
    isValid: false,
    reason: 'Try to find a stronger connection between the words.',
    connection: ''
  };
};

/**
 * Check for phonetic similarity between words
 * @param {string} word1 - First word
 * @param {string} word2 - Second word
 * @returns {boolean} - Whether words are phonetically similar
 */
const checkPhoneticSimilarity = (word1, word2) => {
  // Simple rhyme check (same ending)
  if (word1.length >= 3 && word2.length >= 3) {
    const ending1 = word1.slice(-2);
    const ending2 = word2.slice(-2);
    if (ending1 === ending2) return true;
  }

  // Check for similar vowel patterns
  const vowels1 = word1.match(/[aeiou]/gi) || [];
  const vowels2 = word2.match(/[aeiou]/gi) || [];
  
  if (vowels1.length > 0 && vowels2.length > 0) {
    const vowelPattern1 = vowels1.join('').toLowerCase();
    const vowelPattern2 = vowels2.join('').toLowerCase();
    if (vowelPattern1 === vowelPattern2) return true;
  }

  return false;
};

/**
 * Check for letter patterns between words
 * @param {string} word1 - First word
 * @param {string} word2 - Second word
 * @returns {boolean} - Whether words share letter patterns
 */
const checkLetterPatterns = (word1, word2) => {
  // Same first letter
  if (word1[0].toLowerCase() === word2[0].toLowerCase()) return true;
  
  // Same last letter
  if (word1[word1.length - 1].toLowerCase() === word2[word2.length - 1].toLowerCase()) return true;
  
  // Contains similar letter sequences
  if (word1.length >= 3 && word2.length >= 3) {
    for (let i = 0; i <= word1.length - 2; i++) {
      const sequence = word1.slice(i, i + 2).toLowerCase();
      if (word2.toLowerCase().includes(sequence)) return true;
    }
  }

  return false;
};

/**
 * Calculate score based on various factors
 * @param {number} level - Current level
 * @param {number} streak - Current streak
 * @param {number} timeLeft - Time remaining
 * @param {number} chainLength - Current chain length
 * @returns {number} - Calculated score
 */
export const calculateScore = (level, streak, timeLeft, chainLength) => {
  let score = GAME_CONFIG.BASE_SCORE;
  
  // Level multiplier
  score *= Math.pow(GAME_CONFIG.LEVEL_MULTIPLIER, level - 1);
  
  // Streak bonus
  if (streak > 1) {
    score *= Math.pow(GAME_CONFIG.STREAK_MULTIPLIER, Math.min(streak - 1, 10));
  }
  
  // Time bonus (more points for faster responses)
  const timeBonus = Math.floor(timeLeft * GAME_CONFIG.TIME_BONUS_MULTIPLIER);
  score += timeBonus;
  
  // Chain length bonus
  const chainBonus = chainLength * GAME_CONFIG.CHAIN_BONUS;
  score += chainBonus;
  
  return Math.floor(score);
};

/**
 * Get word categories for hints
 * @param {string} word - The word to get categories for
 * @returns {Array} - Array of category strings
 */
export const getWordCategories = (word) => {
  const categories = WORD_CATEGORIES[word];
  if (categories && categories.length > 0) {
    return categories;
  }
  
  // Fallback categories based on word characteristics
  const fallbackCategories = [];
  
  if (word.length <= 3) {
    fallbackCategories.push('short words');
  } else if (word.length >= 7) {
    fallbackCategories.push('long words');
  }
  
  // Check if it might be a noun, verb, etc. (simple heuristics)
  if (word.endsWith('ing')) {
    fallbackCategories.push('action words');
  } else if (word.endsWith('ly')) {
    fallbackCategories.push('descriptive words');
  } else if (word.endsWith('tion') || word.endsWith('sion')) {
    fallbackCategories.push('concept words');
  } else {
    fallbackCategories.push('general words');
  }
  
  return fallbackCategories.length > 0 ? fallbackCategories : ['any related words'];
};

/**
 * Get performance rating based on game statistics
 * @param {number} accuracy - Accuracy percentage (0-1)
 * @param {number} chainLength - Final chain length
 * @param {number} timeSpent - Time spent in seconds
 * @returns {string} - Performance rating
 */
export const getPerformanceRating = (accuracy, chainLength, timeSpent) => {
  let rating = 0;
  
  // Accuracy component (0-40 points)
  rating += accuracy * 40;
  
  // Chain length component (0-30 points)
  const chainScore = Math.min(chainLength / 20, 1) * 30; // Optimal around 20 words
  rating += chainScore;
  
  // Speed component (0-30 points)
  const speedScore = Math.max(0, 1 - timeSpent / 300) * 30; // Optimal under 5 minutes
  rating += speedScore;
  
  if (rating >= 85) return 'Excellent';
  if (rating >= 70) return 'Great';
  if (rating >= 55) return 'Good';
  if (rating >= 40) return 'Fair';
  return 'Keep Practicing';
};

/**
 * Generate a helpful hint for the current word
 * @param {string} currentWord - The current word
 * @param {Array} wordChain - The current word chain
 * @returns {string} - Hint text
 */
export const generateHint = (currentWord, wordChain) => {
  const associations = WORD_ASSOCIATIONS[currentWord];
  const categories = WORD_CATEGORIES[currentWord];
  
  if (associations && associations.length > 0) {
    // Filter out already used words
    const availableAssociations = associations.filter(word => !wordChain.includes(word));
    if (availableAssociations.length > 0) {
      const randomAssociation = availableAssociations[Math.floor(Math.random() * availableAssociations.length)];
      return `Try "${randomAssociation}" - it connects well with ${currentWord}!`;
    }
  }
  
  if (categories && categories.length > 0) {
    return `Think of words related to: ${categories.join(', ')}`;
  }
  
  return `Think of words that relate to ${currentWord} in any way - be creative!`;
};
