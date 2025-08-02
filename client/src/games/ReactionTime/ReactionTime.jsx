import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import GameLayout from '../../components/GameLayout';
import './ReactionTime.css';

const ReactionTime = () => {
  const [gameState, setGameState] = useState('idle'); // idle, instructions, playing, paused, finished, waiting, ready
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds] = useState(10);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [averageTime, setAverageTime] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [waitTimeout, setWaitTimeout] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  const { startGameSession, recordGameScore, feedback: gameFeedback, clearFeedback } = useGame();
  const { speak, playSound, settings } = useAccessibility();

  // Start game
  const startGame = () => {
    setGameState('instructions');
    speak('Welcome to Reaction Time! This game will help you improve your reflexes.');
  };

  const beginGame = () => {
    startGameSession('reaction-time');
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setCurrentRound(1);
    setReactionTimes([]);
    setAverageTime(0);
    setSuccessCount(0);
    setGameStartTime(Date.now());
    clearFeedback();
    
    speak('Game starting! Wait for the signal, then click as fast as you can.');
    playSound('notification');
    
    // Start first round
    setTimeout(() => startRound(), 1000);
  };

  // Start a new round
  const startRound = useCallback(() => {
    setGameState('waiting');
    setIsActive(false);
    setFeedback('');
    setShowFeedback(false);
    
    // Random delay between 1-5 seconds
    const delay = Math.random() * 4000 + 1000;
    
    const timeout = setTimeout(() => {
      setGameState('ready');
      setIsActive(true);
      setStartTime(Date.now());
      playSound('notification');
      
      if (settings.autoRead) {
        speak('Go!');
      }
    }, delay);
    
    setWaitTimeout(timeout);
  }, [settings.autoRead, speak]);

  // Handle click during game
  const handleClick = () => {
    if (gameState === 'waiting') {
      // Too early!
      clearTimeout(waitTimeout);
      setFeedback('Too early! Wait for the signal.');
      setShowFeedback(true);
      playSound('error');
      speak('Too early! Wait for the signal.');
      
      setTimeout(() => {
        if (currentRound >= totalRounds) {
          endGame();
        } else {
          setCurrentRound(prev => prev + 1);
          startRound();
        }
      }, 2000);
      
    } else if (gameState === 'ready' && isActive) {
      // Good reaction!
      const reactionTime = Date.now() - startTime;
      const newReactionTimes = [...reactionTimes, reactionTime];
      setReactionTimes(newReactionTimes);
      
      const newAverage = Math.round(newReactionTimes.reduce((a, b) => a + b, 0) / newReactionTimes.length);
      setAverageTime(newAverage);
      
      // Calculate score based on reaction time
      let points = 0;
      if (reactionTime < 200) points = 100;
      else if (reactionTime < 300) points = 80;
      else if (reactionTime < 400) points = 60;
      else if (reactionTime < 500) points = 40;
      else points = 20;
      
      setScore(prev => prev + points);
      setSuccessCount(prev => prev + 1);
      setIsActive(false);
      
      setFeedback(`${reactionTime}ms - ${points} points!`);
      setShowFeedback(true);
      playSound('success');
      speak(`${reactionTime} milliseconds`);
      
      // Check for level up
      if (currentRound % 5 === 0) {
        setLevel(prev => prev + 1);
        speak(`Level up! Now level ${level + 1}`);
      }
      
      setTimeout(() => {
        if (currentRound >= totalRounds) {
          endGame();
        } else {
          setCurrentRound(prev => prev + 1);
          startRound();
        }
      }, 2000);
    }
  };

  // End game
  const endGame = async () => {
    setGameState('finished');
    const timeSpent = (Date.now() - gameStartTime) / 1000;
    const accuracy = successCount / totalRounds;

    try {
      await recordGameScore({
        score,
        level,
        accuracy,
        timeSpent,
        difficulty: 'medium',
        metadata: {
          totalRounds,
          successCount,
          averageReactionTime: averageTime,
          bestReactionTime: Math.min(...reactionTimes)
        }
      });
      
      playSound('complete');
      speak(`Game complete! Your average reaction time was ${averageTime} milliseconds.`);
    } catch (error) {
      console.error('Error recording score:', error);
    }
  };

  // Pause/Resume game
  const togglePause = () => {
    if (gameState === 'waiting' || gameState === 'ready') {
      clearTimeout(waitTimeout);
      setGameState('paused');
      speak('Game paused');
    } else if (gameState === 'paused') {
      setGameState('playing');
      speak('Game resumed');
      setTimeout(() => startRound(), 1000);
    }
  };

  const resetGame = () => {
    clearTimeout(waitTimeout);
    setGameState('idle');
    clearFeedback();
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (waitTimeout) {
        clearTimeout(waitTimeout);
      }
    };
  }, [waitTimeout]);

  if (gameState === 'idle') {
    return (
      <div className="reaction-time">
        <div className="game-header">
          <h1>⚡ Reaction Time</h1>
          <p>Test and improve your reaction speed!</p>
        </div>
        
        <div className="game-intro">
          <div className="intro-content">
            <h2>How to Play</h2>
            <ul>
              <li>Wait for the signal to appear</li>
              <li>Click as fast as you can when it turns green</li>
              <li>Don't click too early or you'll lose points</li>
              <li>Try to get the fastest reaction time possible</li>
            </ul>
            
            <div className="difficulty-info">
              <h3>Skills You'll Practice:</h3>
              <div className="skills-grid">
                <div className="skill-item">
                  <span className="skill-icon">⚡</span>
                  <span>Quick Reflexes</span>
                </div>
                <div className="skill-item">
                  <span className="skill-icon">👁️</span>
                  <span>Visual Processing</span>
                </div>
                <div className="skill-item">
                  <span className="skill-icon">🎯</span>
                  <span>Timing</span>
                </div>
              </div>
            </div>
            
            <button 
              className="btn-accessible btn-primary start-btn"
              onClick={startGame}
              aria-label="Start Reaction Time game"
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
      <div className="reaction-time">
        <div className="instructions-screen">
          <h2>🎯 Get Ready!</h2>
          <div className="instruction-example">
            <p>Wait for the circle to turn green, then click it!</p>
            <div className="example-circle waiting">
              Wait...
            </div>
            <p>Don't click too early or you'll lose the round!</p>
          </div>
          
          <div className="ready-controls">
            <button 
              className="btn-accessible btn-primary"
              onClick={beginGame}
              aria-label="Begin playing Reaction Time"
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

  if (gameState === 'playing' || gameState === 'paused' || gameState === 'waiting' || gameState === 'ready') {
    const gameStats = [
      { icon: '🏆', label: 'Score', value: score },
      { icon: '📊', label: 'Level', value: level },
      { icon: '⏰', label: 'Avg Time', value: `${averageTime}ms` },
      { icon: '🎯', label: 'Round', value: `${currentRound}/${totalRounds}` },
      { icon: '✅', label: 'Success', value: successCount }
    ];

    return (
      <div className="reaction-time">
        <GameLayout
          gameTitle="⚡ Reaction Time"
          level={level}
          onPause={togglePause}
          isPaused={gameState === 'paused'}
          stats={gameStats}
        >
          <div className="reaction-container">
            {(gameState === 'waiting' || gameState === 'ready') && (
              <div className="reaction-area">
                <div 
                  className={`reaction-circle ${isActive ? 'active' : 'waiting'}`}
                  onClick={handleClick}
                >
                  {isActive ? 'CLICK NOW!' : 'Wait...'}
                </div>
                <p className="reaction-instruction">
                  {isActive ? 'Click as fast as you can!' : 'Wait for the signal...'}
                </p>
                {showFeedback && (
                  <div className="reaction-feedback">
                    {feedback}
                  </div>
                )}
              </div>
            )}
          </div>
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
    const bestTime = reactionTimes.length > 0 ? Math.min(...reactionTimes) : 0;
    
    return (
      <div className="reaction-time">
        <div className="game-results">
          <h2>🎉 Great Job!</h2>
          
          <div className="results-stats">
            <div className="result-item">
              <span className="result-label">Final Score</span>
              <span className="result-value">{score}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Average Time</span>
              <span className="result-value">{averageTime}ms</span>
            </div>
            <div className="result-item">
              <span className="result-label">Best Time</span>
              <span className="result-value">{bestTime}ms</span>
            </div>
            <div className="result-item">
              <span className="result-label">Success Rate</span>
              <span className="result-value">{Math.round((successCount / totalRounds) * 100)}%</span>
            </div>
          </div>

          {gameFeedback && (
            <div className="ai-feedback">
              <h3>🤖 Your Personal Coach Says:</h3>
              <p>{gameFeedback.text}</p>
            </div>
          )}

          <div className="result-actions">
            <button 
              className="btn-accessible btn-primary"
              onClick={beginGame}
              aria-label="Play Reaction Time again"
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

export default ReactionTime;
