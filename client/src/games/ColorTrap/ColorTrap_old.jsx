import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { generateColorTrapChallenge, checkAnswer, calculateScore } from './logic';
import GameLayout from '../../components/GameLayout';import './ColorTrap.css';

const ColorTrap = () => {
  const [gameState, setGameState] = useState('idle'); // idle, instructions, playing, paused, finished
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(30);
  const [streak, setStreak] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(null);

  const { startGameSession, recordGameScore, feedback, clearFeedback } = useGame();
  const { speak, playSound, settings } = useAccessibility();

  // Generate new challenge
  const generateNewChallenge = useCallback(() => {
    const challenge = generateColorTrapChallenge(level);
    setCurrentChallenge(challenge);
    setTotalQuestions(prev => prev + 1);
    
    if (settings.autoRead) {
      speak(`What color is the word ${challenge.word}?`);
    }
  }, [level, settings.autoRead, speak]);

  // Start game
  const startGame = () => {
    setGameState('instructions');
    speak('Welcome to Color Trap! This game will help you practice impulse control.');
  };

  const beginGame = () => {
    const session = startGameSession('color-trap');
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setLives(3);
    setTimeLeft(30);
    setStreak(0);
    setTotalQuestions(0);
    setCorrectAnswers(0);
    setGameStartTime(Date.now());
    generateNewChallenge();
    clearFeedback();
    
    speak('Game starting! Click the color of the word, not what the word says.');
    playSound('notification');
  };

  // Handle answer selection
  const handleAnswer = (selectedColor) => {
    if (gameState !== 'playing' || !currentChallenge) return;

    const isCorrect = checkAnswer(currentChallenge, selectedColor);
    
    if (isCorrect) {
      const points = calculateScore(level, streak, timeLeft);
      setScore(prev => prev + points);
      setCorrectAnswers(prev => prev + 1);
      setStreak(prev => prev + 1);
      
      playSound('success');
      speak('Correct!');
      
      // Level up every 5 correct answers
      if ((correctAnswers + 1) % 5 === 0) {
        setLevel(prev => prev + 1);
        speak(`Level up! Now on level ${level + 1}`);
      }
    } else {
      setLives(prev => prev - 1);
      setStreak(0);
      
      playSound('error');
      speak(`Incorrect. The word was ${currentChallenge.textColor} color.`);
      
      if (lives <= 1) {
        endGame();
        return;
      }
    }

    // Generate next challenge after a brief delay
    setTimeout(() => {
      if (gameState === 'playing') {
        generateNewChallenge();
      }
    }, 1000);
  };

  // Timer effect
  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  // End game
  const endGame = async () => {
    setGameState('finished');
    const timeSpent = (Date.now() - gameStartTime) / 1000;
    const accuracy = totalQuestions > 0 ? correctAnswers / totalQuestions : 0;

    try {
      await recordGameScore({
        score,
        level,
        accuracy,
        timeSpent,
        difficulty: 'medium',
        metadata: {
          correctAnswers,
          totalQuestions,
          streak,
          livesRemaining: lives
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
    if (gameState === 'playing') {
      setGameState('paused');
      speak('Game paused');
    } else if (gameState === 'paused') {
      setGameState('playing');
      speak('Game resumed');
    }
  };

  const resetGame = () => {
    setGameState('idle');
    clearFeedback();
  };

  if (gameState === 'idle') {
    return (
      <div className="color-trap">
        <div className="game-header">
          <h1>🎨 Color Trap</h1>
          <p>Train your impulse control with the Stroop effect!</p>
        </div>
        
        <div className="game-intro">
          <div className="intro-content">
            <h2>How to Play</h2>
            <ul>
              <li>You'll see words that name colors</li>
              <li>Click the button that matches the COLOR of the word</li>
              <li>Don't get trapped by what the word SAYS!</li>
              <li>Be quick but careful - you have 3 lives</li>
            </ul>
            
            <div className="difficulty-info">
              <h3>Skills You'll Practice:</h3>
              <div className="skills-grid">
                <div className="skill-item">
                  <span className="skill-icon">🧠</span>
                  <span>Impulse Control</span>
                </div>
                <div className="skill-item">
                  <span className="skill-icon">👁️</span>
                  <span>Visual Processing</span>
                </div>
                <div className="skill-item">
                  <span className="skill-icon">⚡</span>
                  <span>Quick Thinking</span>
                </div>
              </div>
            </div>
            
            <button 
              className="btn-accessible btn-primary start-btn"
              onClick={startGame}
              aria-label="Start Color Trap game"
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
      <div className="color-trap">
        <div className="instructions-screen">
          <h2>🎯 Get Ready!</h2>
          <div className="instruction-example">
            <p>Example: If you see the word</p>
            <div className="example-word" style={{ color: 'blue' }}>RED</div>
            <p>Click the <strong>BLUE</strong> button (the color you see)</p>
            <p>Not the RED button (what the word says)</p>
          </div>
          
          <div className="ready-controls">
            <button 
              className="btn-accessible btn-primary"
              onClick={beginGame}
              aria-label="Begin playing Color Trap"
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

  if (gameState === 'playing' || gameState === 'paused') {
    return (
      <div className="color-trap">
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
              <span className="stat-label">Time</span>
              <span className="stat-value">{timeLeft}s</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Streak</span>
              <span className="stat-value">{streak}</span>
            </div>
          </div>
          
          <button 
            className="btn-accessible btn-secondary pause-btn"
            onClick={togglePause}
            aria-label={gameState === 'paused' ? 'Resume game' : 'Pause game'}
          >
            {gameState === 'paused' ? '▶️ Resume' : '⏸️ Pause'}
          </button>
        </div>

        {gameState === 'paused' && (
          <div className="pause-overlay">
            <div className="pause-message">
              <h2>⏸️ Game Paused</h2>
              <p>Take a break! Click Resume when you're ready.</p>
            </div>
          </div>
        )}

        <div className="game-area">
          {currentChallenge && gameState === 'playing' && (
            <>
              <div className="challenge-display">
                <p className="challenge-instruction">What COLOR is this word?</p>
                <div 
                  className="challenge-word"
                  style={{ color: currentChallenge.textColor }}
                  aria-label={`The word ${currentChallenge.word} displayed in ${currentChallenge.textColor} color`}
                >
                  {currentChallenge.word}
                </div>
              </div>

              <div className="color-options">
                {currentChallenge.options.map((color) => (
                  <button
                    key={color}
                    className={`color-option ${color}`}
                    onClick={() => handleAnswer(color)}
                    aria-label={`Select ${color}`}
                    style={{ backgroundColor: color }}
                  >
                    {color.toUpperCase()}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    
    return (
      <div className="color-trap">
        <div className="game-results">
          <h2>🎉 Great Job!</h2>
          
          <div className="results-stats">
            <div className="result-item">
              <span className="result-label">Final Score</span>
              <span className="result-value">{score}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Accuracy</span>
              <span className="result-value">{accuracy}%</span>
            </div>
            <div className="result-item">
              <span className="result-label">Level Reached</span>
              <span className="result-value">{level}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Best Streak</span>
              <span className="result-value">{streak}</span>
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
              aria-label="Play Color Trap again"
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

export default ColorTrap;
