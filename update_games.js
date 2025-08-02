const fs = require('fs');
const path = require('path');

const gamesDir = '/mnt/c/Users/User/Documents/GitHub/NeuroAid/client/src/games';

const gameConfigs = {
  'ColorTrap': {
    title: '🎨 Color Trap',
    stats: [
      { icon: '🏆', label: 'Score', value: 'score' },
      { icon: '📊', label: 'Level', value: 'level' },
      { icon: '❤️', label: 'Lives', value: 'lives' },
      { icon: '⏰', label: 'Time', value: '`${timeLeft}s`' },
      { icon: '🔥', label: 'Streak', value: 'streak' }
    ]
  },
  'DotDash': {
    title: '📡 Dot Dash',
    stats: [
      { icon: '🏆', label: 'Score', value: 'score' },
      { icon: '📊', label: 'Level', value: 'level' },
      { icon: '❤️', label: 'Lives', value: 'lives' },
      { icon: '⏰', label: 'Time', value: '`${timeLeft}s`' },
      { icon: '🎯', label: 'Round', value: 'currentRound' }
    ]
  },
  'MathMaster': {
    title: '🧮 Math Master',
    stats: [
      { icon: '🏆', label: 'Score', value: 'score' },
      { icon: '📊', label: 'Level', value: 'level' },
      { icon: '❤️', label: 'Lives', value: 'lives' },
      { icon: '⏰', label: 'Time', value: '`${timeLeft}s`' },
      { icon: '🔥', label: 'Streak', value: 'streak' }
    ]
  },
  'ReactionTime': {
    title: '⚡ Reaction Time',
    stats: [
      { icon: '🏆', label: 'Score', value: 'score' },
      { icon: '📊', label: 'Level', value: 'level' },
      { icon: '⏰', label: 'Avg Time', value: '`${averageTime}ms`' },
      { icon: '🎯', label: 'Round', value: 'currentRound' },
      { icon: '✅', label: 'Success', value: 'successCount' }
    ]
  },
  'SequenceSense': {
    title: '🔢 Sequence Sense',
    stats: [
      { icon: '🏆', label: 'Score', value: 'score' },
      { icon: '📊', label: 'Level', value: 'level' },
      { icon: '❤️', label: 'Lives', value: 'lives' },
      { icon: '⏰', label: 'Time', value: '`${timeLeft}s`' },
      { icon: '🧠', label: 'Length', value: 'sequenceLength' }
    ]
  },
  'ShapeSorter': {
    title: '🔷 Shape Sorter',
    stats: [
      { icon: '🏆', label: 'Score', value: 'score' },
      { icon: '📊', label: 'Level', value: 'level' },
      { icon: '❤️', label: 'Lives', value: 'lives' },
      { icon: '⏰', label: 'Time', value: '`${timeLeft}s`' },
      { icon: '🎯', label: 'Sorted', value: 'sortedCount' }
    ]
  },
  'WordChain': {
    title: '🔗 Word Chain',
    stats: [
      { icon: '🏆', label: 'Score', value: 'score' },
      { icon: '📊', label: 'Level', value: 'level' },
      { icon: '❤️', label: 'Lives', value: 'lives' },
      { icon: '⏰', label: 'Time', value: '`${timeLeft}s`' },
      { icon: '🔗', label: 'Chain', value: 'chainLength' }
    ]
  }
};

function updateGameFile(gameName) {
  const gameDir = path.join(gamesDir, gameName);
  const jsxFile = path.join(gameDir, `${gameName}.jsx`);
  
  if (!fs.existsSync(jsxFile)) {
    console.log(`Skipping ${gameName} - file not found`);
    return;
  }
  
  let content = fs.readFileSync(jsxFile, 'utf8');
  
  // Add GameLayout import if not present
  if (!content.includes('GameLayout')) {
    content = content.replace(
      /import .*from '\.\/logic';/,
      `$&\nimport GameLayout from '../../components/GameLayout';`
    );
  }
  
  console.log(`Updated ${gameName}`);
  // Note: This is a template - actual file modifications would need more specific regex patterns
}

// Update all games
Object.keys(gameConfigs).forEach(updateGameFile);

console.log('Game update script completed');
