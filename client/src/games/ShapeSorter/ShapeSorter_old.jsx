import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { generateShapes, checkShapeMatch, calculateScore, getShapeDescription } from './logic';
import './ShapeSorter.css';

const ShapeSorter = () => {
  const [gameState, setGameState] = useState('idle'); // idle, instructions, playing, paused, finished
  const [shapes, setShapes] = useState([]);
  const [targetShape, setTargetShape] = useState(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [correctSorts, setCorrectSorts] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [draggedShape, setDraggedShape] = useState(null);
  const [dropZoneActive, setDropZoneActive] = useState(false);

  const gameAreaRef = useRef(null);
  const { startGameSession, recordGameScore, feedback, clearFeedback } = useGame();
  const { speak, playSound, settings } = useAccessibility();

  // Generate new shapes and target
  const generateNewRound = useCallback(() => {
    const { shapes: newShapes, target } = generateShapes(level);
    setShapes(newShapes);
    setTargetShape(target);
    
    if (settings.autoRead) {
      speak(`Find and drag the ${getShapeDescription(target)} to the target area.`);
    }
  }, [level, settings.autoRead, speak]);

  // Start game
  const startGame = () => {
    setGameState('instructions');
    speak('Welcome to Shape Sorter! This game will help you practice visual coordination and shape recognition.');
  };

  const beginGame = () => {
    const session = startGameSession('shape-sorter');
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setLives(3);
    setTimeLeft(60);
    setCorrectSorts(0);
    setTotalAttempts(0);
    setGameStartTime(Date.now());
    generateNewRound();
    clearFeedback();
    
    speak('Game starting! Drag the matching shapes to the target area.');
    playSound('notification');
  };

  // Handle shape drag start
  const handleDragStart = (e, shape) => {
    setDraggedShape(shape);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    
    if (settings.soundEnabled) {
      playSound('click');
    }
    
    speak(`Dragging ${getShapeDescription(shape)}`);
  };

  // Handle drag over drop zone
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropZoneActive(true);
  };

  // Handle drag leave drop zone
  const handleDragLeave = () => {
    setDropZoneActive(false);
  };

  // Handle shape drop
  const handleDrop = (e) => {
    e.preventDefault();
    setDropZoneActive(false);
    
    if (!draggedShape || !targetShape) return;

    const isMatch = checkShapeMatch(draggedShape, targetShape);
    setTotalAttempts(prev => prev + 1);

    if (isMatch) {
      const points = calculateScore(level, timeLeft);
      setScore(prev => prev + points);
      setCorrectSorts(prev => prev + 1);
      
      playSound('success');
      speak('Correct! Great job!');
      
      // Remove the matched shape and generate new round
      setTimeout(() => {
        // Level up every 5 correct sorts
        if ((correctSorts + 1) % 5 === 0) {
          setLevel(prev => prev + 1);
          speak(`Level up! Now on level ${level + 1}`);
        }
        generateNewRound();
      }, 1000);
    } else {
      setLives(prev => prev - 1);
      
      playSound('error');
      speak(`Not quite right. Look for the ${getShapeDescription(targetShape)}.`);
      
      if (lives <= 1) {
        endGame();
        return;
      }
    }

    setDraggedShape(null);
  };

  // Handle click/tap for mobile
  const handleShapeClick = (shape) => {
    if (!targetShape) return;

    const isMatch = checkShapeMatch(shape, targetShape);
    setTotalAttempts(prev => prev + 1);

    if (isMatch) {
      const points = calculateScore(level, timeLeft);
      setScore(prev => prev + points);
      setCorrectSorts(prev => prev + 1);
      
      playSound('success');
      speak('Correct! Great job!');
      
      // Level up every 5 correct sorts
      if ((correctSorts + 1) % 5 === 0) {
        setLevel(prev => prev + 1);
        speak(`Level up! Now on level ${level + 1}`);
      }
      
      setTimeout(() => {
        generateNewRound();
      }, 1000);
    } else {
      setLives(prev => prev - 1);
      
      playSound('error');
      speak(`Not quite right. Look for the ${getShapeDescription(targetShape)}.`);
      
      if (lives <= 1) {
        endGame();
        return;
      }
    }
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
    const accuracy = totalAttempts > 0 ? correctSorts / totalAttempts : 0;

    try {
      await recordGameScore({
        score,
        level,
        accuracy,
        timeSpent,
        difficulty: 'medium',
        metadata: {
          correctSorts,
          totalAttempts,
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
      <div className="shape-sorter">
        <div className="game-header">
          <h1>🔷 Shape Sorter</h1>
          <p>Practice visual coordination and shape recognition!</p>
        </div>
        
        <div className="game-intro">
          <div className="intro-content">
            <h2>How to Play</h2>
            <ul>
              <li>Look at the target shape shown at the top</li>
              <li>Find the matching shape among the options</li>
              <li>Drag it to the drop zone or click on it</li>
              <li>Match shapes by color, size, and type</li>
            </ul>
            
            <div className="difficulty-info">
              <h3>Skills You'll Practice:</h3>
              <div className="skills-grid">
                <div className="skill-item">
                  <span className="skill-icon">👁️</span>
                  <span>Visual Processing</span>
                </div>
                <div className="skill-item">
                  <span className="skill-icon">🎯</span>
                  <span>Hand-Eye Coordination</span>
                </div>
                <div className="skill-item">
                  <span className="skill-icon">🔍</span>
                  <span>Pattern Matching</span>
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
            <p>When you see this target:</p>
            <div className="example-target">
              <div className="example-shape circle red"></div>
            </div>
            <p>Find and select the matching red circle!</p>
          </div>
          
          <div className="control-tips">
            <h3>Controls:</h3>
            <ul>
              <li><strong>Desktop:</strong> Drag shapes to the target area</li>
              <li><strong>Mobile:</strong> Tap on the matching shape</li>
              <li><strong>Keyboard:</strong> Use Tab and Enter keys</li>
            </ul>
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
    return (
      <div className="shape-sorter">
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

        <div className="game-area" ref={gameAreaRef}>
          {targetShape && gameState === 'playing' && (
            <>
              <div className="target-section">
                <h3>Find this shape:</h3>
                <div className="target-display">
                  <div 
                    className={`shape ${targetShape.type} ${targetShape.color} ${targetShape.size}`}
                    aria-label={`Target: ${getShapeDescription(targetShape)}`}
                  ></div>
                </div>
              </div>

              <div 
                className={`drop-zone ${dropZoneActive ? 'active' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                aria-label="Drop matching shape here"
              >
                <p>Drop Here</p>
                <span className="drop-icon">🎯</span>
              </div>

              <div className="shapes-grid">
                {shapes.map((shape, index) => (
                  <div
                    key={index}
                    className={`shape ${shape.type} ${shape.color} ${shape.size} interactive`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, shape)}
                    onClick={() => handleShapeClick(shape)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleShapeClick(shape);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`${getShapeDescription(shape)} - Click to select`}
                  ></div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    const accuracy = totalAttempts > 0 ? Math.round((correctSorts / totalAttempts) * 100) : 0;
    
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
              <span className="result-label">Accuracy</span>
              <span className="result-value">{accuracy}%</span>
            </div>
            <div className="result-item">
              <span className="result-label">Level Reached</span>
              <span className="result-value">{level}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Shapes Sorted</span>
              <span className="result-value">{correctSorts}</span>
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
