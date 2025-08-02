import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import './ReactionTime.css';

const ReactionTime = () => {
  const [gameState, setGameState] = useState('idle'); // idle, instructions, waiting, ready, playing, finished
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(0);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [currentReactionTime, setCurrentReactionTime] = useState(null);
  const [averageTime, setAverageTime] = useState(0);
  const [bestTime, setBestTime] = useState(null);
  const [lives, setLives] = useState(3);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [waitingStartTime, setWaitingStartTime] = useState(null);
  const [challenge, setChallenge] = useState(null);
  const [tooEarly, setTooEarly] = useState(false);

  const { startGameSession, recordGameScore, feedback, clearFeedback } = useGame();
  const { speak, playSound, settings } = useAccessibility();
  
  const timeoutRef = useRef(null);
  const gameAreaRef = useRef(null);

  // Challenge types
  const challengeTypes = [
    { type: 'visual', color: '#e74c3c', text: 'CLICK NOW!', sound: null },
    { type: 'visual', color: '#2ecc71', text: 'GO!', sound: null },
    { type: 'visual', color: '#f39c12', text: 'REACT!', sound: null },
    { type: 'audio', color: '#3498db', text: 'Listen...', sound: 'beep' },
    { type: 'mixed', color: '#9b59b6', text: 'NOW!', sound: 'notification' }
  ];

  const startGame = () => {
    setGameState('instructions');
    speak('Welcome to Lightning Reflex! Test your reaction time with visual and audio challenges.');
  };

  const beginGame = () => {
    startGameSession('reaction-time');
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setRound(0);
    setReactionTimes([]);
    setCurrentReactionTime(null);
    setAverageTime(0);
    setBestTime(null);
    setLives(3);
    setGameStartTime(Date.now());
    setTooEarly(false);
    clearFeedback();
    
    // Use try-catch for audio/speech to prevent blocking
    try {
      speak('Lightning Reflex starting! Wait for the signal, then react as fast as you can!');
    } catch (error) {
      console.warn('Speech failed:', error);
    }
    
    try {
      playSound('notification');
    } catch (error) {
      console.warn('Sound failed:', error);
    }
    
    // Start first round after state updates
    setTimeout(() => {
      console.log('Starting first round from beginGame');
      // Manually start the first round
      setRound(1);
      setCurrentReactionTime(null);
      setTooEarly(false);
      setChallenge(null);
      setGameState('waiting');
      
      // Random wait time between 1-5 seconds
      const waitTime = 1000 + Math.random() * 4000;
      console.log('First round wait time:', waitTime);
      setWaitingStartTime(Date.now());
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        console.log('First round timeout triggered, showing challenge');
        showChallenge();
      }, waitTime);
      
      // Simplified speech without dependency on settings
      try {
        speak('Round 1. Wait for the signal...');
      } catch (error) {
        console.warn('Speech failed:', error);
      }
    }, 1000);
  };

  const endGame = useCallback(async () => {
    setGameState('finished');
    clearTimeout(timeoutRef.current);
    
    const accuracy = reactionTimes.length / Math.max(round, 1);
    const timeSpent = (Date.now() - gameStartTime) / 1000;

    try {
      await recordGameScore({
        score,
        level,
        accuracy,
        timeSpent,
        difficulty: 'medium',
        metadata: {
          totalRounds: round,
          successfulReactions: reactionTimes.length,
          averageReactionTime: averageTime,
          bestReactionTime: bestTime,
          livesRemaining: Math.max(0, lives)
        }
      });
      
      playSound('complete');
      speak(`Game complete! You completed ${reactionTimes.length} successful reactions with an average time of ${averageTime} milliseconds.`);
    } catch (error) {
      console.error('Error recording score:', error);
    }
  }, [score, level, round, reactionTimes.length, averageTime, bestTime, lives, gameStartTime, recordGameScore, playSound, speak]);

  const showChallenge = () => {
    try {
      const challengeType = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];
      console.log('Showing challenge:', challengeType);
      setChallenge(challengeType);
      setGameState('ready');
      setWaitingStartTime(Date.now());
      
      // Play sound for audio challenges
      if (challengeType.sound) {
        try {
          playSound(challengeType.sound);
        } catch (error) {
          console.warn('Sound playback failed:', error);
        }
      }
      
      // Always try to speak the challenge text for visual challenges
      if (challengeType.type === 'visual') {
        try {
          speak(challengeType.text);
        } catch (error) {
          console.warn('Speech failed:', error);
        }
      }
    } catch (error) {
      console.error('Error in showChallenge:', error);
      // Fallback: set a simple challenge
      setChallenge({ type: 'visual', color: '#e74c3c', text: 'CLICK NOW!', sound: null });
      setGameState('ready');
      setWaitingStartTime(Date.now());
    }
  };

  const startRound = useCallback(() => {
    if (lives <= 0) {
      endGame();
      return;
    }

    console.log('Starting new round:', round + 1);
    setRound(prev => prev + 1);
    setCurrentReactionTime(null);
    setTooEarly(false);
    setChallenge(null);
    setGameState('waiting');
    
    // Random wait time between 1-5 seconds
    const waitTime = 1000 + Math.random() * 4000;
    console.log('Wait time:', waitTime);
    setWaitingStartTime(Date.now());
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      console.log('Timeout triggered, showing challenge');
      showChallenge();
    }, waitTime);
    
    // Simplified speech without settings dependency
    try {
      speak(`Round ${round + 1}. Wait for the signal...`);
    } catch (error) {
      console.warn('Speech failed:', error);
    }
  }, [lives, round, speak, endGame]);

  const handleReaction = useCallback(() => {
    console.log('handleReaction called, gameState:', gameState);
    
    if (gameState === 'waiting') {
      // Too early!
      console.log('Too early reaction');
      setTooEarly(true);
      const newLives = Math.max(0, lives - 1);
      setLives(newLives);
      clearTimeout(timeoutRef.current);
      
      playSound('error');
      speak('Too early! Wait for the signal.');
      
      setTimeout(() => {
        if (newLives > 0) {
          startRound();
        } else {
          endGame();
        }
      }, 2000);
      
      return;
    }
    
    if (gameState === 'ready' && waitingStartTime) {
      console.log('Valid reaction in ready state');
      const reactionTime = Date.now() - waitingStartTime;
      setCurrentReactionTime(reactionTime);
      
      // Calculate score based on reaction time
      let points = 0;
      if (reactionTime < 200) {
        points = 1000; // Excellent
      } else if (reactionTime < 300) {
        points = 800; // Great
      } else if (reactionTime < 400) {
        points = 600; // Good
      } else if (reactionTime < 500) {
        points = 400; // Fair
      } else {
        points = 200; // Slow
      }
      
      // Level bonus
      points += (level - 1) * 50;
      
      setScore(prev => prev + points);
      setReactionTimes(prev => {
        const newTimes = [...prev, reactionTime];
        const average = newTimes.reduce((a, b) => a + b, 0) / newTimes.length;
        setAverageTime(Math.round(average));
        
        const best = Math.min(...newTimes);
        setBestTime(best);
        
        return newTimes;
      });
      
      playSound('success');
      
      let feedback = '';
      if (reactionTime < 200) feedback = 'Lightning fast!';
      else if (reactionTime < 300) feedback = 'Excellent reflexes!';
      else if (reactionTime < 400) feedback = 'Good reaction!';
      else if (reactionTime < 500) feedback = 'Not bad!';
      else feedback = 'Try to be faster!';
      
      speak(`${reactionTime} milliseconds. ${feedback}`);
      
      setGameState('result');
      
      // Check for level up (every 5 successful reactions)
      if (reactionTimes.length + 1 >= level * 5) {
        setLevel(prev => prev + 1);
        speak(`Level up! Now on level ${level + 1}`);
      }
      
      // Continue to next round
      setTimeout(() => {
        startRound();
      }, 2000);
    }
  }, [gameState, waitingStartTime, level, reactionTimes.length, lives, speak, playSound, startRound]);

  // Handle clicks and key presses
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space' && (gameState === 'waiting' || gameState === 'ready')) {
        e.preventDefault();
        handleReaction();
      }
    };

    const handleClick = () => {
      if (gameState === 'waiting' || gameState === 'ready') {
        handleReaction();
      }
    };

    if (gameAreaRef.current) {
      gameAreaRef.current.addEventListener('click', handleClick);
    }
    
    document.addEventListener('keydown', handleKeyPress);
    
    return () => {
      if (gameAreaRef.current) {
        gameAreaRef.current.removeEventListener('click', handleClick);
      }
      document.removeEventListener('keydown', handleKeyPress);
      clearTimeout(timeoutRef.current);
    };
  }, [gameState, handleReaction]);

  const resetGame = () => {
    setGameState('idle');
    clearTimeout(timeoutRef.current);
    clearFeedback();
  };

  if (gameState === 'idle') {
    return (
      <div className="reaction-time">
        <div className="game-header">
          <h1>⚡ Lightning Reflex</h1>
          <p>Test and improve your reaction time with quick challenges!</p>
        </div>
        
        <div className="game-intro">
          <div className="intro-content">
            <h2>How to Play</h2>
            <ul>
              <li>Wait for the visual or audio signal</li>
              <li>React as quickly as possible by clicking or pressing SPACE</li>
              <li>Don't react too early or you'll lose a life</li>
              <li>Try to achieve the fastest reaction times</li>
            </ul>
            
            <div className="difficulty-info">
              <h3>Skills You'll Practice:</h3>
              <div className="skills-grid">
                <div className="skill-item">
                  <span className="skill-icon">⚡</span>
                  <span>Reaction Time</span>
                </div>
                <div className="skill-item">
                  <span className="skill-icon">🏃</span>
                  <span>Processing Speed</span>
                </div>
                <div className="skill-item">
                  <span className="skill-icon">🎮</span>
                  <span>Motor Control</span>
                </div>
              </div>
            </div>
            
            <button 
              className="btn-accessible btn-primary start-btn"
              onClick={startGame}
              aria-label="Start Lightning Reflex game"
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
          <div className="instruction-details">
            <div className="instruction-item">
              <h3>⏳ Wait Phase</h3>
              <p>Stay calm and wait for the signal. Don't click too early!</p>
            </div>
            <div className="instruction-item">
              <h3>⚡ React Phase</h3>
              <p>When you see the signal or hear the sound, react immediately!</p>
            </div>
            <div className="instruction-item">
              <h3>🎯 Scoring</h3>
              <p>Faster reactions earn more points. Under 200ms is excellent!</p>
            </div>
          </div>
          
          <div className="ready-controls">
            <button 
              className="btn-accessible btn-primary"
              onClick={beginGame}
              aria-label="Begin playing Lightning Reflex"
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

  return (
    <div className="reaction-time">
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
            <span className="stat-label">Round</span>
            <span className="stat-value">{round}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Lives</span>
            <span className="stat-value">{'❤️'.repeat(Math.max(0, lives))}</span>
          </div>
          {averageTime > 0 && (
            <div className="stat-item">
              <span className="stat-label">Avg Time</span>
              <span className="stat-value">{averageTime}ms</span>
            </div>
          )}
        </div>
      </div>

      <div 
        className={`game-area ${gameState}`}
        ref={gameAreaRef}
        style={{ 
          backgroundColor: challenge?.color || '#f8fafc',
          cursor: (gameState === 'waiting' || gameState === 'ready') ? 'pointer' : 'default'
        }}
      >
        {gameState === 'waiting' && (
          <div className="game-content waiting">
            <h2>⏳ Wait for it...</h2>
            <p>Stay focused and don't click too early!</p>
            {tooEarly && (
              <div className="error-message">
                <h3>❌ Too Early!</h3>
                <p>You lost a life. Wait for the signal!</p>
              </div>
            )}
          </div>
        )}

        {gameState === 'ready' && challenge && (
          <div className="game-content ready">
            <h2 className="challenge-text">{challenge.text}</h2>
            <p>Click now or press SPACE!</p>
          </div>
        )}

        {gameState === 'result' && currentReactionTime && (
          <div className="game-content result">
            <h2>⚡ {currentReactionTime}ms</h2>
            <p>
              {currentReactionTime < 200 ? 'Lightning fast!' :
               currentReactionTime < 300 ? 'Excellent!' :
               currentReactionTime < 400 ? 'Good reaction!' :
               currentReactionTime < 500 ? 'Not bad!' : 'Try to be faster!'}
            </p>
            {bestTime && (
              <p className="best-time">Best: {bestTime}ms</p>
            )}
          </div>
        )}

        {gameState === 'finished' && (
          <div className="game-results">
            <h2>⚡ Lightning Reflexes Complete!</h2>
            
            <div className="results-stats">
              <div className="result-item">
                <span className="result-label">Final Score</span>
                <span className="result-value">{score}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Successful Reactions</span>
                <span className="result-value">{reactionTimes.length}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Average Time</span>
                <span className="result-value">{averageTime}ms</span>
              </div>
              {bestTime && (
                <div className="result-item">
                  <span className="result-label">Best Time</span>
                  <span className="result-value">{bestTime}ms</span>
                </div>
              )}
              <div className="result-item">
                <span className="result-label">Level Reached</span>
                <span className="result-value">{level}</span>
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
                aria-label="Play Lightning Reflex again"
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
        )}
      </div>
    </div>
  );
};

export default ReactionTime;
