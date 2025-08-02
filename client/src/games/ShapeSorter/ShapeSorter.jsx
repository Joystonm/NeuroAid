import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import GameLayout from '../../components/GameLayout';
import './ShapeSorter.css';

const ShapeSorter = () => {
  const [gameState, setGameState] = useState('idle');
  const [currentShape, setCurrentShape] = useState(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [sortedCount, setSortedCount] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalShapes, setTotalShapes] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [sortingCriteria, setSortingCriteria] = useState('color');

  const { startGameSession, recordGameScore, feedback, clearFeedback } = useGame();
  const { speak, playSound, settings } = useAccessibility();

  const shapes = ['circle', 'square', 'triangle'];
  const colors = ['red', 'blue', 'green', 'yellow'];
  const sizes = ['small', 'medium', 'large'];

  // Generate new shape
  const generateShape = useCallback(() => {
    const shape = {
      type: shapes[Math.floor(Math.random() * shapes.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      size: sizes[Math.floor(Math.random() * sizes.length)]
    };
    setCurrentShape(shape);
    setTotalShapes(prev => prev + 1);
    
    if (settings.autoRead) {
      speak(`Sort this ${shape.size} ${shape.color} ${shape.type} by ${sortingCriteria}.`);
    }
  }, [sortingCriteria, settings.autoRead, speak]);

  const startGame = () => {
    setGameState('instructions');
    speak('Welcome to Shape Sorter! This game will help you practice categorization.');
  };

  const beginGame = () => {
    startGameSession('shape-sorter');
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setLives(3);
    setTimeLeft(60);
    setSortedCount(0);
    setCorrectAnswers(0);
    setTotalShapes(0);
    setSortingCriteria('color');
    setGameStartTime(Date.now());
    generateShape();
    clearFeedback();
    
    speak('Game starting! Sort shapes by their properties.');
    playSound('notification');
  };

  const handleSort = (category) => {
    if (!currentShape) return;

    let isCorrect = false;
    switch (sortingCriteria) {
      case 'color':
        isCorrect = category === currentShape.color;
        break;
      case 'shape':
        isCorrect = category === currentShape.type;
        break;
      case 'size':
        isCorrect = category === currentShape.size;
        break;
    }

    if (isCorrect) {
      const points = level * 10;
      setScore(prev => prev + points);
      setSortedCount(prev => prev + 1);
      setCorrectAnswers(prev => prev + 1);
      
      playSound('success');
      speak('Correct!');
      
      // Change criteria every 5 correct sorts
      if (sortedCount > 0 && sortedCount % 5 === 0) {
        const criteria = ['color', 'shape', 'size'];
        const nextCriteria = criteria[(criteria.indexOf(sortingCriteria) + 1) % criteria.length];
        setSortingCriteria(nextCriteria);
        setLevel(prev => prev + 1);
        speak(`Level up! Now sort by ${nextCriteria}`);
      }
      
    } else {
      setLives(prev => prev - 1);
      playSound('error');
      speak(`Wrong! This should go in ${currentShape[sortingCriteria]}`);
      
      if (lives <= 1) {
        setTimeout(() => endGame(), 1000);
        return;
      }
    }

    setTimeout(() => generateShape(), 1000);
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

  const endGame = async () => {
    setGameState('finished');
    const timeSpent = (Date.now() - gameStartTime) / 1000;
    const accuracy = totalShapes > 0 ? correctAnswers / totalShapes : 0;

    try {
      await recordGameScore({
        score,
        level,
        accuracy,
        timeSpent,
        difficulty: 'medium',
        metadata: {
          totalShapes,
          correctAnswers,
          sortedCount,
          livesRemaining: lives
        }
      });
      
      playSound('complete');
      speak(`Game complete! You sorted ${sortedCount} shapes correctly.`);
    } catch (error) {
      console.error('Error recording score:', error);
    }
  };

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
      <div className="shape-sorter">
        <div className="game-header">
          <h1>🔷 Shape Sorter</h1>
          <p>Sort shapes by color, size, and type!</p>
        </div>
        
        <div className="game-intro">
          <div className="intro-content">
            <h2>How to Play</h2>
            <ul>
              <li>Look at the shape's properties</li>
              <li>Sort by the current criteria (color, shape, or size)</li>
              <li>Click the correct category bin</li>
              <li>Criteria change as you advance levels</li>
            </ul>
            
            <div className="difficulty-info">
              <h3>Skills You'll Practice:</h3>
              <div className="skills-grid">
                <div className="skill-item">
                  <span className="skill-icon">👁️</span>
                  <span>Visual Processing</span>
                </div>
                <div className="skill-item">
                  <span className="skill-icon">🧠</span>
                  <span>Categorization</span>
                </div>
                <div className="skill-item">
                  <span className="skill-icon">⚡</span>
                  <span>Quick Decisions</span>
                </div>
              </div>
            </div>
            
            <button 
              className="btn-accessible btn-primary start-btn"
              onClick={startGame}
              aria-label="Start Shape Sorter game"
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
      <div className="shape-sorter">
        <div className="instructions-screen">
          <h2>🎯 Get Ready!</h2>
          <div className="instruction-example">
            <p>Sort shapes by their properties:</p>
            <div className="example-shapes">
              <div className="shape circle red medium"></div>
              <div className="shape square blue large"></div>
            </div>
            <p>Click the correct category bin!</p>
          </div>
          
          <div className="ready-controls">
            <button 
              className="btn-accessible btn-primary"
              onClick={beginGame}
              aria-label="Begin playing Shape Sorter"
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
    const gameStats = [
      { icon: '🏆', label: 'Score', value: score },
      { icon: '📊', label: 'Level', value: level },
      { icon: '❤️', label: 'Lives', value: lives },
      { icon: '⏰', label: 'Time', value: `${timeLeft}s` },
      { icon: '🎯', label: 'Sorted', value: sortedCount }
    ];

    const getSortingBins = () => {
      switch (sortingCriteria) {
        case 'color':
          return colors.map(color => ({ type: color, label: color.toUpperCase() }));
        case 'shape':
          return shapes.map(shape => ({ type: shape, label: shape.toUpperCase() }));
        case 'size':
          return sizes.map(size => ({ type: size, label: size.toUpperCase() }));
        default:
          return [];
      }
    };

    return (
      <div className="shape-sorter">
        <GameLayout
          gameTitle="🔷 Shape Sorter"
          level={level}
          onPause={togglePause}
          isPaused={gameState === 'paused'}
          stats={gameStats}
        >
          {currentShape && gameState === 'playing' && (
            <div className="sorting-container">
              <div className="sorting-instruction">
                <h3>Sort by: {sortingCriteria.toUpperCase()}</h3>
              </div>
              
              <div className="shape-display">
                <div className={`shape ${currentShape.type} ${currentShape.color} ${currentShape.size}`}>
                </div>
              </div>

              <div className="sorting-bins">
                {getSortingBins().map((bin) => (
                  <button
                    key={bin.type}
                    className={`sorting-bin ${bin.type}`}
                    onClick={() => handleSort(bin.type)}
                    aria-label={`Sort into ${bin.label} category`}
                  >
                    {bin.label}
                  </button>
                ))}
              </div>
            </div>
          )}
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

  if (gameState === 'finished') {
    const accuracy = totalShapes > 0 ? Math.round((correctAnswers / totalShapes) * 100) : 0;
    
    return (
      <div className="shape-sorter">
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
              <span className="result-label">Shapes Sorted</span>
              <span className="result-value">{sortedCount}</span>
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
              aria-label="Play Shape Sorter again"
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

export default ShapeSorter;
