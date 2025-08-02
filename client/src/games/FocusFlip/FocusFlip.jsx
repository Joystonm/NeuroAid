import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { generateCards, shuffleArray, calculateScore } from './logic';
import './FocusFlip.css';

const FocusFlip = () => {
  const [gameState, setGameState] = useState('idle'); // idle, instructions, playing, paused, finished
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [moves, setMoves] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(null);

  const { startGameSession, recordGameScore, feedback, clearFeedback } = useGame();
  const { speak, playSound, settings } = useAccessibility();

  // Generate new level
  const generateNewLevel = useCallback(() => {
    const cardCount = Math.min(8 + (level - 1) * 2, 16); // 8 to 16 cards
    const newCards = generateCards(cardCount);
    setCards(newCards);
    setFlippedCards([]);
    setMatchedCards([]);
    
    if (settings.autoRead) {
      speak(`Level ${level}. Find matching pairs among ${cardCount} cards.`);
    }
  }, [level, settings.autoRead, speak]);

  // Start game
  const startGame = () => {
    setGameState('instructions');
    speak('Welcome to Focus Flip! This game will help you practice memory and attention.');
  };

  const beginGame = () => {
    startGameSession('focus-flip');
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setLives(3);
    setTimeLeft(60);
    setMoves(0);
    setGameStartTime(Date.now());
    generateNewLevel();
    clearFeedback();
    
    speak('Game starting! Click on cards to flip them and find matching pairs.');
    playSound('notification');
  };

  // Handle card click
  const handleCardClick = (cardIndex) => {
    if (gameState !== 'playing') return;
    if (flippedCards.length >= 2) return;
    if (flippedCards.includes(cardIndex)) return;
    if (matchedCards.includes(cardIndex)) return;

    const newFlippedCards = [...flippedCards, cardIndex];
    setFlippedCards(newFlippedCards);
    playSound('click');

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      // Check for match after a brief delay
      setTimeout(() => {
        checkForMatch(newFlippedCards);
      }, 1000);
    }
  };

  // Check if two flipped cards match
  const checkForMatch = (flippedIndices) => {
    const [first, second] = flippedIndices;
    const firstCard = cards[first];
    const secondCard = cards[second];

    if (firstCard.value === secondCard.value) {
      // Match found
      const newMatchedCards = [...matchedCards, first, second];
      setMatchedCards(newMatchedCards);
      
      const points = calculateScore(level, timeLeft, moves);
      setScore(prev => prev + points);
      
      playSound('success');
      speak('Match found!');

      // Check if level is complete
      if (newMatchedCards.length === cards.length) {
        setTimeout(() => {
          if (level < 5) {
            setLevel(prev => prev + 1);
            speak(`Level ${level} complete! Moving to level ${level + 1}`);
            generateNewLevel();
          } else {
            endGame();
          }
        }, 1500);
      }
    } else {
      // No match
      setLives(prev => prev - 1);
      playSound('error');
      speak('No match. Try again.');
      
      if (lives <= 1) {
        setTimeout(() => endGame(), 1000);
        return;
      }
    }

    // Reset flipped cards
    setFlippedCards([]);
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

  // Generate new level when level changes
  useEffect(() => {
    if (gameState === 'playing' && level > 1) {
      generateNewLevel();
    }
  }, [level, gameState, generateNewLevel]);

  // End game
  const endGame = async () => {
    setGameState('finished');
    const timeSpent = (Date.now() - gameStartTime) / 1000;
    const accuracy = moves > 0 ? matchedCards.length / (moves * 2) : 0;

    try {
      await recordGameScore({
        score,
        level,
        accuracy,
        timeSpent,
        difficulty: 'medium',
        metadata: {
          moves,
          matchedPairs: matchedCards.length / 2,
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

  // Get card display value
  const getCardContent = (card, index) => {
    if (matchedCards.includes(index)) {
      return card.symbol;
    }
    if (flippedCards.includes(index)) {
      return card.symbol;
    }
    return '?';
  };

  // Get card class
  const getCardClass = (index) => {
    let className = 'memory-card';
    if (matchedCards.includes(index)) {
      className += ' matched';
    } else if (flippedCards.includes(index)) {
      className += ' flipped';
    }
    return className;
  };

  if (gameState === 'idle') {
    return (
      <div className="focus-flip">
        <div className="game-header">
          <h1>🃏 Focus Flip</h1>
          <p>Test your memory and attention with card matching!</p>
        </div>
        
        <div className="game-intro">
          <div className="intro-content">
            <h2>How to Play</h2>
            <ul>
              <li>Click on cards to flip them over</li>
              <li>Find matching pairs of symbols</li>
              <li>Remember where you saw each symbol</li>
              <li>Complete all pairs to advance levels</li>
            </ul>
            
            <div className="difficulty-info">
              <h3>Skills You'll Practice:</h3>
              <div className="skills-grid">
                <div className="skill-item">
                  <span className="skill-icon">🧠</span>
                  <span>Working Memory</span>
                </div>
                <div className="skill-item">
                  <span className="skill-icon">👁️</span>
                  <span>Visual Attention</span>
                </div>
                <div className="skill-item">
                  <span className="skill-icon">🎯</span>
                  <span>Concentration</span>
                </div>
              </div>
            </div>
            
            <button 
              className="btn-accessible btn-primary start-btn"
              onClick={startGame}
              aria-label="Start Focus Flip game"
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
      <div className="focus-flip">
        <div className="instructions-screen">
          <h2>🎯 Get Ready!</h2>
          <div className="instruction-example">
            <p>Click on two cards to see if they match:</p>
            <div className="example-cards">
              <div className="example-card">🌟</div>
              <div className="example-card">🌟</div>
            </div>
            <p>If they match, they stay flipped. If not, they flip back!</p>
          </div>
          
          <div className="ready-controls">
            <button 
              className="btn-accessible btn-primary"
              onClick={beginGame}
              aria-label="Begin playing Focus Flip"
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
      <div className="focus-flip">
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
              <span className="stat-label">Moves</span>
              <span className="stat-value">{moves}</span>
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
          {gameState === 'playing' && (
            <div className="cards-grid">
              {cards.map((card, index) => (
                <button
                  key={index}
                  className={getCardClass(index)}
                  onClick={() => handleCardClick(index)}
                  disabled={flippedCards.length >= 2 && !flippedCards.includes(index)}
                  aria-label={`Card ${index + 1}: ${matchedCards.includes(index) || flippedCards.includes(index) ? card.symbol : 'Hidden'}`}
                >
                  <span className="card-content">
                    {getCardContent(card, index)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    const accuracy = moves > 0 ? Math.round((matchedCards.length / (moves * 2)) * 100) : 0;
    
    return (
      <div className="focus-flip">
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
              <span className="result-label">Moves Used</span>
              <span className="result-value">{moves}</span>
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
              aria-label="Play Focus Flip again"
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

export default FocusFlip;
