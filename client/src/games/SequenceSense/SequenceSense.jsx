import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import GameLayout from '../../components/GameLayout';
import './SequenceSense.css';

const SequenceSense = () => {
  const [gameState, setGameState] = useState('idle'); // idle, instructions, playing, paused, finished, showing, inputting
  const [currentSequence, setCurrentSequence] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [sequenceLength, setSequenceLength] = useState(3);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalSequences, setTotalSequences] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [showingIndex, setShowingIndex] = useState(-1);

  const { startGameSession, recordGameScore, feedback, clearFeedback } = useGame();
  const { speak, playSound, settings } = useAccessibility();

  // Generate new sequence
  const generateSequence = useCallback(() => {
    const sequence = [];
    for (let i = 0; i < sequenceLength; i++) {
      sequence.push(Math.floor(Math.random() * 9) + 1);
    }
    setCurrentSequence(sequence);
    setTotalSequences(prev => prev + 1);
    
    if (settings.autoRead) {
      speak(`Memorize this ${sequenceLength} digit sequence.`);
    }
  }, [sequenceLength, settings.autoRead, speak]);

  // Start game
  const startGame = () => {
    setGameState('instructions');
    speak('Welcome to Sequence Sense! This game will help you practice working memory.');
  };

  const beginGame = () => {
    startGameSession('sequence-sense');
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setLives(3);
    setTimeLeft(60);
    setSequenceLength(3);
    setCorrectAnswers(0);
    setTotalSequences(0);
    setUserInput('');
    setGameStartTime(Date.now());
    generateSequence();
    clearFeedback();
    
    speak('Game starting! Watch the number sequence and remember it.');
    playSound('notification');
    
    // Start showing sequence
    setTimeout(() => showSequence(), 1000);
  };

  // Show sequence to user
  const showSequence = async () => {
    setGameState('showing');
    setShowingIndex(-1);
    
    // Show each number for 1 second
    for (let i = 0; i < currentSequence.length; i++) {
      setShowingIndex(i);
      playSound('notification');
      
      if (settings.autoRead) {
        speak(currentSequence[i].toString());
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setShowingIndex(-1);
    setGameState('inputting');
    speak('Now enter the sequence you saw.');
  };

  // Handle input submission
  const handleSubmit = () => {
    if (userInput.length !== currentSequence.length) {
      speak('Please enter all digits of the sequence.');
      return;
    }

    const userSequence = userInput.split('').map(Number);
    const isCorrect = userSequence.every((num, index) => num === currentSequence[index]);
    
    if (isCorrect) {
      const points = sequenceLength * 10 * level;
      setScore(prev => prev + points);
      setCorrectAnswers(prev => prev + 1);
      
      playSound('success');
      speak('Correct! Well done.');
      
      // Increase difficulty
      if (correctAnswers > 0 && correctAnswers % 3 === 0) {
        if (sequenceLength < 8) {
          setSequenceLength(prev => prev + 1);
        } else {
          setLevel(prev => prev + 1);
          setSequenceLength(3);
        }
        speak(`Level up! Now level ${level + 1}`);
      }
      
    } else {
      setLives(prev => prev - 1);
      playSound('error');
      speak(`Incorrect. The sequence was ${currentSequence.join(', ')}`);
      
      if (lives <= 1) {
        setTimeout(() => endGame(), 2000);
        return;
      }
    }

    // Generate new sequence
    setTimeout(() => {
      setUserInput('');
      generateSequence();
      setTimeout(() => showSequence(), 1000);
    }, 2000);
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  // Timer effect
  useEffect(() => {
    let timer;
    if (gameState === 'inputting' && timeLeft > 0) {
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
    const accuracy = totalSequences > 0 ? correctAnswers / totalSequences : 0;

    try {
      await recordGameScore({
        score,
        level,
        accuracy,
        timeSpent,
        difficulty: 'medium',
        metadata: {
          totalSequences,
          correctAnswers,
          maxSequenceLength: sequenceLength,
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
    if (gameState === 'inputting') {
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

  if (gameState === 'idle') {
    return (
      <div className="sequence-sense">
        <div className="game-header">
          <h1>🔢 Sequence Sense</h1>
          <p>Remember and repeat number sequences!</p>
        </div>
        
        <div className="game-intro">
          <div className="intro-content">
            <h2>How to Play</h2>
            <ul>
              <li>Watch the number sequence carefully</li>
              <li>Memorize the order of the digits</li>
              <li>Enter the sequence exactly as shown</li>
              <li>Sequences get longer as you progress</li>
            </ul>
            
            <div className="difficulty-info">
              <h3>Skills You'll Practice:</h3>
              <div className="skills-grid">
                <div className="skill-item">
                  <span className="skill-icon">🧠</span>
                  <span>Working Memory</span>
                </div>
                <div className="skill-item">
                  <span className="skill-icon">🔢</span>
                  <span>Number Recall</span>
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
              aria-label="Start Sequence Sense game"
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
      <div className="sequence-sense">
        <div className="instructions-screen">
          <h2>🎯 Get Ready!</h2>
          <div className="instruction-example">
            <p>You'll see sequences like:</p>
            <div className="example-sequence">
              <span className="sequence-number">3</span>
              <span className="sequence-number">7</span>
              <span className="sequence-number">1</span>
            </div>
            <p>Watch carefully, then type: 371</p>
          </div>
          
          <div className="ready-controls">
            <button 
              className="btn-accessible btn-primary"
              onClick={beginGame}
              aria-label="Begin playing Sequence Sense"
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
    const gameStats = [
      { icon: '🏆', label: 'Score', value: score },
      { icon: '📊', label: 'Level', value: level },
      { icon: '❤️', label: 'Lives', value: lives },
      { icon: '⏰', label: 'Time', value: `${timeLeft}s` },
      { icon: '🧠', label: 'Length', value: sequenceLength }
    ];

    return (
      <div className="sequence-sense">
        <GameLayout
          gameTitle="🔢 Sequence Sense"
          level={level}
          onPause={togglePause}
          isPaused={gameState === 'paused'}
          stats={gameStats}
        >
          <div className="sequence-container">
            {gameState === 'showing' && (
              <div className="sequence-display">
                <h3>Memorize this sequence:</h3>
                <div className="number-sequence">
                  {currentSequence.map((num, index) => (
                    <span 
                      key={index} 
                      className={`sequence-number ${index === showingIndex ? 'active' : ''}`}
                    >
                      {num}
                    </span>
                  ))}
                </div>
                <p className="sequence-instruction">Watch carefully...</p>
              </div>
            )}

            {gameState === 'inputting' && (
              <div className="input-area">
                <h3>Enter the sequence:</h3>
                <div className="input-display">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value.replace(/\D/g, '').slice(0, sequenceLength))}
                    onKeyPress={handleKeyPress}
                    placeholder={`Enter ${sequenceLength} digits...`}
                    className="sequence-input"
                    maxLength={sequenceLength}
                    autoFocus
                  />
                  <button 
                    className="btn-accessible btn-primary submit-btn"
                    onClick={handleSubmit}
                    disabled={userInput.length !== sequenceLength}
                  >
                    Submit
                  </button>
                </div>
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
    const accuracy = totalSequences > 0 ? Math.round((correctAnswers / totalSequences) * 100) : 0;
    
    return (
      <div className="sequence-sense">
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
              <span className="result-label">Max Length</span>
              <span className="result-value">{sequenceLength}</span>
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
              aria-label="Play Sequence Sense again"
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

export default SequenceSense;
