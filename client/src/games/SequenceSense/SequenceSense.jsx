import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { generateSequence, getNextInSequence, validateAnswer, calculateScore } from './logic';
import './SequenceSense.css';

const SequenceSense = () => {
  const [gameState, setGameState] = useState('idle'); // idle, instructions, playing, paused, finished
  const [currentSequence, setCurrentSequence] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [totalQuestions] = useState(10);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);

  const { startGameSession, recordGameScore, feedback, clearFeedback } = useGame();
  const { speak, playSound, settings } = useAccessibility();

  // Generate new sequence challenge
  const generateNewChallenge = useCallback(() => {
    const sequence = generateSequence(level);
    setCurrentSequence(sequence);
    setUserAnswer('');
    setShowHint(false);
    
    if (settings.autoRead) {
      const sequenceText = sequence.sequence.join(', ');
      speak(`Find the next number in this sequence: ${sequenceText}`);
    }
  }, [level, settings.autoRead, speak]);

  // Start game
  const startGame = () => {
    setGameState('instructions');
    speak('Welcome to Sequence Sense! This game will help you practice pattern recognition and logical thinking.');
  };

  const beginGame = () => {
    const session = startGameSession('sequence-sense');
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setLives(3);
    setCurrentQuestion(1);
    setCorrectAnswers(0);
    setHintsUsed(0);
    setGameStartTime(Date.now());
    generateNewChallenge();
    clearFeedback();
    
    speak('Game starting! Look for patterns in the number sequences.');
    playSound('notification');
  };

  // Handle answer submission
  const handleSubmitAnswer = () => {
    if (gameState !== 'playing' || !currentSequence || !userAnswer.trim()) return;

    const isCorrect = validateAnswer(currentSequence, parseInt(userAnswer));
    
    if (isCorrect) {
      const points = calculateScore(level, showHint, currentQuestion);
      setScore(prev => prev + points);
      setCorrectAnswers(prev => prev + 1);
      
      playSound('success');
      speak('Correct! Well done!');
      
      // Move to next question
      setTimeout(() => {
        if (currentQuestion >= totalQuestions) {
          // Level complete
          setLevel(prev => prev + 1);
          setCurrentQuestion(1);
          speak(`Level ${level} complete! Moving to level ${level + 1}`);
        } else {
          setCurrentQuestion(prev => prev + 1);
        }
        generateNewChallenge();
      }, 1500);
    } else {
      setLives(prev => prev - 1);
      
      playSound('error');
      speak(`Incorrect. The answer was ${currentSequence.answer}.`);
      
      if (lives <= 1) {
        endGame();
        return;
      }
      
      // Show correct answer briefly, then move to next question
      setTimeout(() => {
        if (currentQuestion >= totalQuestions) {
          endGame();
        } else {
          setCurrentQuestion(prev => prev + 1);
          generateNewChallenge();
        }
      }, 2000);
    }
  };

  // Handle hint request
  const showHintHandler = () => {
    if (!currentSequence || showHint) return;
    
    setShowHint(true);
    setHintsUsed(prev => prev + 1);
    playSound('notification');
    speak(`Hint: ${currentSequence.hint}`);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and negative sign
    if (value === '' || /^-?\d+$/.test(value)) {
      setUserAnswer(value);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmitAnswer();
    }
  };

  // End game
  const endGame = async () => {
    setGameState('finished');
    const timeSpent = (Date.now() - gameStartTime) / 1000;
    const accuracy = totalQuestions > 0 ? correctAnswers / (currentQuestion - 1) : 0;

    try {
      await recordGameScore({
        score,
        level,
        accuracy,
        timeSpent,
        difficulty: 'medium',
        metadata: {
          correctAnswers,
          totalQuestions: currentQuestion - 1,
          hintsUsed,
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
      <div className="sequence-sense">
        <div className="game-header">
          <h1>🔢 Sequence Sense</h1>
          <p>Discover patterns and predict what comes next!</p>
        </div>
        
        <div className="game-intro">
          <div className="intro-content">
            <h2>How to Play</h2>
            <ul>
              <li>Look at the sequence of numbers</li>
              <li>Find the pattern or rule</li>
              <li>Enter what number comes next</li>
              <li>Use hints if you get stuck</li>
            </ul>
            
            <div className="difficulty-info">
              <h3>Skills You'll Practice:</h3>
              <div className="skills-grid">
                <div className="skill-item">
                  <span className="skill-icon">🧩</span>
                  <span>Pattern Recognition</span>
                </div>
                <div className="skill-item">
                  <span className="skill-icon">🎯</span>
                  <span>Logical Thinking</span>
                </div>
                <div className="skill-item">
                  <span className="skill-icon">🧠</span>
                  <span>Problem Solving</span>
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
            <p>Example sequence:</p>
            <div className="example-sequence">2, 4, 6, 8, ?</div>
            <p>Pattern: Add 2 each time</p>
            <p>Answer: <strong>10</strong></p>
          </div>
          
          <div className="tips">
            <h3>Tips:</h3>
            <ul>
              <li>Look for addition, subtraction, multiplication patterns</li>
              <li>Sometimes patterns can be more complex</li>
              <li>Use hints if you need help</li>
              <li>Take your time to think</li>
            </ul>
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

  if (gameState === 'playing' || gameState === 'paused') {
    return (
      <div className="sequence-sense">
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
              <span className="stat-label">Question</span>
              <span className="stat-value">{currentQuestion}/{totalQuestions}</span>
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
          {currentSequence && gameState === 'playing' && (
            <>
              <div className="sequence-display">
                <p className="sequence-instruction">What number comes next?</p>
                <div className="sequence-container">
                  {currentSequence.sequence.map((num, index) => (
                    <div key={index} className="sequence-number">
                      {num}
                    </div>
                  ))}
                  <div className="sequence-question">?</div>
                </div>
              </div>

              <div className="answer-section">
                <div className="input-group">
                  <label htmlFor="answer-input" className="input-label">
                    Your Answer:
                  </label>
                  <input
                    id="answer-input"
                    type="text"
                    value={userAnswer}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    className="answer-input"
                    placeholder="Enter a number"
                    aria-label="Enter your answer for the sequence"
                    autoFocus
                  />
                </div>

                <div className="action-buttons">
                  <button
                    className="btn-accessible btn-primary"
                    onClick={handleSubmitAnswer}
                    disabled={!userAnswer.trim()}
                    aria-label="Submit your answer"
                  >
                    Submit Answer
                  </button>
                  
                  <button
                    className="btn-accessible btn-secondary"
                    onClick={showHintHandler}
                    disabled={showHint}
                    aria-label="Get a hint for this sequence"
                  >
                    💡 Hint
                  </button>
                </div>

                {showHint && (
                  <div className="hint-display">
                    <h4>💡 Hint:</h4>
                    <p>{currentSequence.hint}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    const accuracy = currentQuestion > 1 ? Math.round((correctAnswers / (currentQuestion - 1)) * 100) : 0;
    
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
              <span className="result-label">Accuracy</span>
              <span className="result-value">{accuracy}%</span>
            </div>
            <div className="result-item">
              <span className="result-label">Level Reached</span>
              <span className="result-value">{level}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Hints Used</span>
              <span className="result-value">{hintsUsed}</span>
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
