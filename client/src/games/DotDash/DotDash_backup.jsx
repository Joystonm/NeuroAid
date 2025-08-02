import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { generatePattern, playPattern, comparePatterns, calculateScore } from './logic';
import './DotDash.css';

const DotDash = () => {
  const [gameState, setGameState] = useState('idle'); // idle, instructions, playing, paused, finished, showing, inputting
  const [currentPattern, setCurrentPattern] = useState([]);
  const [userInput, setUserInput] = useState([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds] = useState(10);
  const [isShowingPattern, setIsShowingPattern] = useState(false);
  const [currentSymbol, setCurrentSymbol] = useState('');
  const [gameStartTime, setGameStartTime] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const { startGameSession, recordGameScore, feedback, clearFeedback } = useGame();
  const { speak, playSound, settings } = useAccessibility();

  // Generate new pattern
  const generateNewPattern = useCallback(() => {
    const patternLength = Math.min(3 + Math.floor(level / 2), 8);
    const pattern = generatePattern(patternLength);
    setCurrentPattern(pattern);
    setUserInput([]);
    
    if (settings.autoRead) {
      speak(`Round ${currentRound}. Watch the pattern of ${patternLength} symbols.`);
    }
  }, [level, currentRound, settings.autoRead, speak]);

  // Start game
  const startGame = () => {
    setGameState('instructions');
    speak('Welcome to Dot Dash! This game will help you practice pattern memory and reaction time.');
  };

  const beginGame = () => {
    startGameSession('dot-dash');
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setLives(3);
    setCurrentRound(1);
    setCorrectAnswers(0);
    setGameStartTime(Date.now());
    generateNewPattern();
    clearFeedback();
    
    speak('Game starting! Watch the morse code patterns and repeat them.');
    playSound('notification');
    
    // Start showing pattern after a brief delay
    setTimeout(() => {
      showPattern();
    }, 1000);
  };

  // Show pattern to user
  const showPattern = async () => {
    setGameState('showing');
    setIsShowingPattern(true);
    
    speak('Watch carefully!');
    
    for (let i = 0; i < currentPattern.length; i++) {
      const symbol = currentPattern[i];
      setCurrentSymbol(symbol);
      
      // Play sound for the symbol
      if (symbol === 'dot') {
        playSound('click');
      } else {
        playSound('notification');
      }
      
      // Show symbol for different durations
      const duration = symbol === 'dot' ? 300 : 800;
      await new Promise(resolve => setTimeout(resolve, duration));
      
      setCurrentSymbol('');
      
      // Pause between symbols
      if (i < currentPattern.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    setIsShowingPattern(false);
    setGameState('inputting');
    speak('Now repeat the pattern!');
  };

  // Handle user input
  const handleInput = (symbol) => {
    if (gameState !== 'inputting') return;
    
    const newInput = [...userInput, symbol];
    setUserInput(newInput);
    
    playSound('click');
    speak(symbol);
    
    // Check if pattern is complete
    if (newInput.length === currentPattern.length) {
      checkPattern(newInput);
    }
  };

  // Check if user input matches pattern
  const checkPattern = (input) => {
    const isCorrect = comparePatterns(currentPattern, input);
    
    if (isCorrect) {
      const points = calculateScore(level, currentRound);
      setScore(prev => prev + points);
      setCorrectAnswers(prev => prev + 1);
      
      playSound('success');
      speak('Correct! Well done!');
      
      // Move to next round
      setTimeout(() => {
        if (currentRound >= totalRounds) {
          // Level complete
          setLevel(prev => prev + 1);
          setCurrentRound(1);
          speak(`Level ${level} complete! Moving to level ${level + 1}`);
        } else {
          setCurrentRound(prev => prev + 1);
        }
        
        generateNewPattern();
        setTimeout(() => {
          showPattern();
        }, 1500);
      }, 1500);
    } else {
      setLives(prev => prev - 1);
      
      playSound('error');
      speak('Not quite right. The correct pattern was: ' + currentPattern.join(', '));
      
      if (lives <= 1) {
        endGame();
        return;
      }
      
      // Show pattern again after a delay
      setTimeout(() => {
        showPattern();
      }, 2000);
    }
  };

  // End game
  const endGame = async () => {
    setGameState('finished');
    const timeSpent = (Date.now() - gameStartTime) / 1000;
    const totalAttempts = currentRound - 1 + (totalRounds * (level - 1));
    const accuracy = totalAttempts > 0 ? correctAnswers / totalAttempts : 0;

    try {
      await recordGameScore({
        score,
        level,
        accuracy,
        timeSpent,
        difficulty: 'medium',
        metadata: {
          correctAnswers,
          totalAttempts,
          livesRemaining: lives,
          roundsCompleted: currentRound - 1
        }
      });
      
      playSound('complete');
      speak(`Game complete! You scored ${score} points with ${Math.round(accuracy * 100)}% accuracy.`);
    } catch (error) {
      console.error('Error recording score:', error);
    }
  };

  // Pause/Resume game
  const togglePause = () => {
    if (gameState === 'playing' || gameState === 'inputting') {
      setGameState('paused');
      speak('Game paused');
    } else if (gameState === 'paused') {
      setGameState('inputting');
      speak('Game resumed');
    }
  };

  const resetGame = () => {
    setGameState('idle');
    clearFeedback();
  };

  // Clear user input
  const clearInput = () => {
    setUserInput([]);
    speak('Input cleared');
  };

  if (gameState === 'idle') {
    return (
      <div className="dot-dash">
        <div className="game-header">
          <h1>📡 Dot Dash</h1>
          <p>Test your memory with morse code patterns!</p>
        </div>
        
        <div className="game-intro">
          <div className="intro-content">
            <h2>How to Play</h2>
            <ul>
              <li>Watch the sequence of dots and dashes</li>
              <li>Remember the pattern shown</li>
              <li>Repeat the pattern using the buttons</li>
              <li>Complete all rounds to advance levels</li>
            </ul>
            
            <div className="difficulty-info">
              <h3>Skills You'll Practice:</h3>
              <div className="skills-grid">
                <div className="skill-item">
                  <span className="skill-icon">🧠</span>
                  <span>Sequential Memory</span>
                </div>
                <div className="skill-item">
                  <span className="skill-icon">⚡</span>
                  <span>Reaction Time</span>
                </div>
                <div className="skill-item">
                  <span className="skill-icon">🎯</span>
                  <span>Pattern Recognition</span>
                </div>
              </div>
            </div>
            
            <button 
              className="btn-accessible btn-primary start-btn"
              onClick={startGame}
              aria-label="Start Dot Dash game"
            >
              Start Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'instructions') {
    return (
      <div className="dot-dash">
        <div className="instructions-screen">
          <h2>🎯 Get Ready!</h2>
          <div className="instruction-example">
            <p>You'll see patterns like this:</p>
            <div className="example-pattern">
              <div className="example-symbol dot">•</div>
              <div className="example-symbol dash">—</div>
              <div className="example-symbol dot">•</div>
            </div>
            <p>Then repeat it using the Dot and Dash buttons!</p>
          </div>
          
          <div className="morse-info">
            <h3>Morse Code Basics:</h3>
            <ul>
              <li><strong>Dot (•):</strong> Short signal</li>
              <li><strong>Dash (—):</strong> Long signal</li>
              <li>Pay attention to the timing!</li>
            </ul>
          </div>
          
          <div className="ready-controls">
            <button 
              className="btn-accessible btn-primary"
              onClick={beginGame}
              aria-label="Begin playing Dot Dash"
            >
              I'm Ready!
            </button>
            <button 
              className="btn-accessible btn-secondary"
              onClick={() => setGameState('idle')}
              aria-label="Go back to main screen"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'playing' || gameState === 'paused' || gameState === 'showing' || gameState === 'inputting') {
    return (
      <div className="dot-dash">
        <div className="game-header">
          <div className="game-stats">
            <div className="stat-item">
              <span className="stat-label">Score</span>
              <span className="stat-value">{score}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Level</span>
              <span className="stat-value">{level}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Lives</span>
              <span className="stat-value">{'❤️'.repeat(lives)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Round</span>
              <span className="stat-value">{currentRound}/{totalRounds}</span>
            </div>
          </div>
          
          <button 
            className="btn-accessible btn-secondary pause-btn"
            onClick={togglePause}
            aria-label={gameState === 'paused' ? 'Resume game' : 'Pause game'}
            disabled={gameState === 'showing'}
          >
            {gameState === 'paused' ? '▶️ Resume' : '⏸️ Pause'}
          </button>
        </div>

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

        <div className="game-area">
          {/* Pattern Display */}
          <div className="pattern-section">
            <h3>
              {gameState === 'showing' ? 'Watch the Pattern:' : 
               gameState === 'inputting' ? 'Repeat the Pattern:' : 'Pattern:'}
            </h3>
            
            <div className="pattern-display">
              {gameState === 'showing' && currentSymbol && (
                <div className={`current-symbol ${currentSymbol}`}>
                  {currentSymbol === 'dot' ? '•' : '—'}
                </div>
              )}
              
              {gameState === 'inputting' && (
                <div className="pattern-reference">
                  {currentPattern.map((symbol, index) => (
                    <div key={index} className={`symbol-ref ${symbol}`}>
                      {symbol === 'dot' ? '•' : '—'}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* User Input Display */}
          {gameState === 'inputting' && (
            <div className="input-section">
              <h3>Your Input:</h3>
              <div className="user-input-display">
                {userInput.map((symbol, index) => (
                  <div key={index} className={`input-symbol ${symbol}`}>
                    {symbol === 'dot' ? '•' : '—'}
                  </div>
                ))}
                {userInput.length < currentPattern.length && (
                  <div className="input-cursor">|</div>
                )}
              </div>
            </div>
          )}

          {/* Control Buttons */}
          {gameState === 'inputting' && (
            <div className="controls-section">
              <div className="input-controls">
                <button
                  className="control-btn dot-btn"
                  onClick={() => handleInput('dot')}
                  aria-label="Input dot"
                  disabled={userInput.length >= currentPattern.length}
                >
                  <span className="btn-symbol">•</span>
                  <span className="btn-label">Dot</span>
                </button>
                
                <button
                  className="control-btn dash-btn"
                  onClick={() => handleInput('dash')}
                  aria-label="Input dash"
                  disabled={userInput.length >= currentPattern.length}
                >
                  <span className="btn-symbol">—</span>
                  <span className="btn-label">Dash</span>
                </button>
              </div>
              
              <button
                className="btn-accessible btn-secondary clear-btn"
                onClick={clearInput}
                aria-label="Clear input"
                disabled={userInput.length === 0}
              >
                🗑️ Clear
              </button>
            </div>
          )}

          {/* Status Messages */}
          <div className="status-section">
            {gameState === 'showing' && (
              <p className="status-message">👀 Watch carefully...</p>
            )}
            {gameState === 'inputting' && (
              <p className="status-message">
                🎯 Enter {currentPattern.length - userInput.length} more symbol{currentPattern.length - userInput.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    const totalAttempts = currentRound - 1 + (totalRounds * (level - 1));
    const accuracy = totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 0;
    
    return (
      <div className="dot-dash">
        <div className="game-results">
          <h2>🎉 Great Job!</h2>
          
          <div className="results-stats">
            <div className="result-item">
              <span className="result-label">Final Score</span>
              <span className="result-value">{score}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Level Reached</span>
              <span className="result-value">{level}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Accuracy</span>
              <span className="result-value">{accuracy}%</span>
            </div>
            <div className="result-item">
              <span className="result-label">Patterns Completed</span>
              <span className="result-value">{correctAnswers}</span>
            </div>
          </div>

          {feedback && (
            <div className="ai-feedback">
              <h3>🤖 Your Personal Coach Says:</h3>
              <p>{feedback.text}</p>
            </div>
          )}

          <div className="result-actions">
            <button 
              className="btn-accessible btn-primary"
              onClick={beginGame}
              aria-label="Play Dot Dash again"
            >
              Play Again
            </button>
            <button 
              className="btn-accessible btn-secondary"
              onClick={resetGame}
              aria-label="Return to main menu"
            >
              Main Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default DotDash;
