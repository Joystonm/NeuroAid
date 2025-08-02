// Game configuration for updating layouts
const gameConfigs = {
  'MathMaster': {
    title: '🧮 Math Master',
    description: 'Sharpen your math skills with timed challenges!',
    skills: [
      { icon: '🧠', name: 'Mental Math' },
      { icon: '⚡', name: 'Quick Thinking' },
      { icon: '🎯', name: 'Accuracy' }
    ],
    stats: [
      { icon: '🏆', label: 'Score', value: 'score' },
      { icon: '📊', label: 'Level', value: 'level' },
      { icon: '❤️', label: 'Lives', value: 'lives' },
      { icon: '⏰', label: 'Time', value: '`${timeLeft}s`' },
      { icon: '🔥', label: 'Streak', value: 'streak' }
    ],
    gameContent: `
      {currentProblem && gameState === 'playing' && (
        <div className="math-container">
          <div className="problem-display">
            <h3>Solve this problem:</h3>
            <div className="math-problem">
              {currentProblem.question}
            </div>
          </div>
          <div className="answer-input">
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Your answer..."
              className="answer-field"
              autoFocus
            />
            <button 
              className="btn-accessible btn-primary submit-btn"
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        </div>
      )}
    `
  },
  
  'ReactionTime': {
    title: '⚡ Reaction Time',
    description: 'Test and improve your reaction speed!',
    skills: [
      { icon: '⚡', name: 'Quick Reflexes' },
      { icon: '👁️', name: 'Visual Processing' },
      { icon: '🎯', name: 'Timing' }
    ],
    stats: [
      { icon: '🏆', label: 'Score', value: 'score' },
      { icon: '📊', label: 'Level', value: 'level' },
      { icon: '⏰', label: 'Avg Time', value: '`${averageTime}ms`' },
      { icon: '🎯', label: 'Round', value: 'currentRound' },
      { icon: '✅', label: 'Success', value: 'successCount' }
    ],
    gameContent: `
      <div className="reaction-container">
        {gameState === 'playing' && (
          <div className="reaction-area">
            <div className={\`reaction-circle \${isActive ? 'active' : ''}\`}>
              {isActive ? 'CLICK NOW!' : 'Wait...'}
            </div>
            <p className="reaction-instruction">
              {isActive ? 'Click as fast as you can!' : 'Wait for the signal...'}
            </p>
          </div>
        )}
      </div>
    `
  },

  'SequenceSense': {
    title: '🔢 Sequence Sense',
    description: 'Remember and repeat number sequences!',
    skills: [
      { icon: '🧠', name: 'Working Memory' },
      { icon: '🔢', name: 'Number Recall' },
      { icon: '🎯', name: 'Concentration' }
    ],
    stats: [
      { icon: '🏆', label: 'Score', value: 'score' },
      { icon: '📊', label: 'Level', value: 'level' },
      { icon: '❤️', label: 'Lives', value: 'lives' },
      { icon: '⏰', label: 'Time', value: '`${timeLeft}s`' },
      { icon: '🧠', label: 'Length', value: 'sequenceLength' }
    ],
    gameContent: `
      <div className="sequence-container">
        {gameState === 'showing' && (
          <div className="sequence-display">
            <h3>Memorize this sequence:</h3>
            <div className="number-sequence">
              {currentSequence.map((num, index) => (
                <span key={index} className="sequence-number">
                  {num}
                </span>
              ))}
            </div>
          </div>
        )}
        {gameState === 'inputting' && (
          <div className="input-area">
            <h3>Enter the sequence:</h3>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Enter numbers..."
              className="sequence-input"
              autoFocus
            />
          </div>
        )}
      </div>
    `
  },

  'ShapeSorter': {
    title: '🔷 Shape Sorter',
    description: 'Sort shapes by color, size, and type!',
    skills: [
      { icon: '👁️', name: 'Visual Processing' },
      { icon: '🧠', name: 'Categorization' },
      { icon: '⚡', name: 'Quick Decisions' }
    ],
    stats: [
      { icon: '🏆', label: 'Score', value: 'score' },
      { icon: '📊', label: 'Level', value: 'level' },
      { icon: '❤️', label: 'Lives', value: 'lives' },
      { icon: '⏰', label: 'Time', value: '`${timeLeft}s`' },
      { icon: '🎯', label: 'Sorted', value: 'sortedCount' }
    ],
    gameContent: `
      <div className="sorting-container">
        {currentShape && (
          <div className="shape-display">
            <div className="shape-to-sort">
              <div className={\`shape \${currentShape.type} \${currentShape.color} \${currentShape.size}\`}>
              </div>
            </div>
            <div className="sorting-bins">
              {sortingBins.map((bin, index) => (
                <button
                  key={index}
                  className={\`sorting-bin \${bin.type}\`}
                  onClick={() => handleSort(bin.type)}
                >
                  {bin.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    `
  },

  'WordChain': {
    title: '🔗 Word Chain',
    description: 'Build word chains and expand your vocabulary!',
    skills: [
      { icon: '📚', name: 'Vocabulary' },
      { icon: '🧠', name: 'Word Association' },
      { icon: '⚡', name: 'Quick Thinking' }
    ],
    stats: [
      { icon: '🏆', label: 'Score', value: 'score' },
      { icon: '📊', label: 'Level', value: 'level' },
      { icon: '❤️', label: 'Lives', value: 'lives' },
      { icon: '⏰', label: 'Time', value: '`${timeLeft}s`' },
      { icon: '🔗', label: 'Chain', value: 'chainLength' }
    ],
    gameContent: `
      <div className="word-chain-container">
        <div className="word-display">
          <h3>Current Word:</h3>
          <div className="current-word">
            {currentWord}
          </div>
        </div>
        <div className="word-input">
          <input
            type="text"
            value={userWord}
            onChange={(e) => setUserWord(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleWordSubmit()}
            placeholder="Enter a word that starts with the last letter..."
            className="word-field"
            autoFocus
          />
          <button 
            className="btn-accessible btn-primary submit-btn"
            onClick={handleWordSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    `
  }
};

// Function to generate JSX template
function generateGameJSX(gameName, config) {
  return `import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import GameLayout from '../../components/GameLayout';
import './\${gameName}.css';

const \${gameName} = () => {
  // Game state and variables would go here
  const [gameState, setGameState] = useState('idle');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  
  const { startGameSession, recordGameScore, feedback, clearFeedback } = useGame();
  const { speak, playSound, settings } = useAccessibility();

  // Game logic functions would go here...

  if (gameState === 'playing' || gameState === 'paused') {
    const gameStats = [
      \${config.stats.map(stat => `{ icon: '${stat.icon}', label: '${stat.label}', value: ${stat.value} }`).join(',\n      ')}
    ];

    return (
      <div className="\${gameName.toLowerCase()}">
        <GameLayout
          gameTitle="\${config.title}"
          level={level}
          onPause={togglePause}
          isPaused={gameState === 'paused'}
          stats={gameStats}
        >
          \${config.gameContent}
        </GameLayout>

        {gameState === 'paused' && (
          <div className="pause-overlay">
            <div className="pause-message">
              <h2>⏸️ Game Paused</h2>
              <p>Take a break! Click Resume when you're ready.</p>
              <button 
                className="btn-accessible btn-primary"
                onClick={togglePause}
                aria-label="Resume game"
              >
                ▶️ Resume Game
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Other game states (idle, instructions, finished) would go here...
  return null;
};

export default \${gameName};`;
}

console.log('Game update templates ready!');
module.exports = { gameConfigs, generateGameJSX };
