import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import './MathMaster.css';

const MathMaster = () => {
  const [gameState, setGameState] = useState('idle'); // idle, instructions, playing, paused, finished
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [streak, setStreak] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalProblems, setTotalProblems] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [problemStartTime, setProblemStartTime] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  const { startGameSession, recordGameScore, feedback: aiFeedback, clearFeedback } = useGame();
  const { speak, playSound, settings } = useAccessibility();

  // Generate math problems based on level
  const generateProblem = useCallback(() => {
    let num1, num2, operation, answer, question;
    
    switch (level) {
      case 1:
        // Simple addition and subtraction (1-20)
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
        operation = Math.random() < 0.5 ? '+' : '-';
        if (operation === '-' && num2 > num1) {
          [num1, num2] = [num2, num1]; // Ensure positive results
        }
        answer = operation === '+' ? num1 + num2 : num1 - num2;
        question = `${num1} ${operation} ${num2}`;
        break;
        
      case 2:
        // Addition, subtraction, simple multiplication (1-50)
        if (Math.random() < 0.3) {
          // Multiplication
          num1 = Math.floor(Math.random() * 10) + 1;
          num2 = Math.floor(Math.random() * 10) + 1;
          operation = '×';
          answer = num1 * num2;
          question = `${num1} × ${num2}`;
        } else {
          // Addition/Subtraction
          num1 = Math.floor(Math.random() * 50) + 1;
          num2 = Math.floor(Math.random() * 50) + 1;
          operation = Math.random() < 0.5 ? '+' : '-';
          if (operation === '-' && num2 > num1) {
            [num1, num2] = [num2, num1];
          }
          answer = operation === '+' ? num1 + num2 : num1 - num2;
          question = `${num1} ${operation} ${num2}`;
        }
        break;
        
      case 3:
        // All operations including division (1-100)
        const operations = ['+', '-', '×', '÷'];
        operation = operations[Math.floor(Math.random() * operations.length)];
        
        if (operation === '÷') {
          // Ensure clean division
          answer = Math.floor(Math.random() * 20) + 1;
          num2 = Math.floor(Math.random() * 10) + 1;
          num1 = answer * num2;
          question = `${num1} ÷ ${num2}`;
        } else if (operation === '×') {
          num1 = Math.floor(Math.random() * 15) + 1;
          num2 = Math.floor(Math.random() * 15) + 1;
          answer = num1 * num2;
          question = `${num1} × ${num2}`;
        } else {
          num1 = Math.floor(Math.random() * 100) + 1;
          num2 = Math.floor(Math.random() * 100) + 1;
          if (operation === '-' && num2 > num1) {
            [num1, num2] = [num2, num1];
          }
          answer = operation === '+' ? num1 + num2 : num1 - num2;
          question = `${num1} ${operation} ${num2}`;
        }
        break;
        
      default:
        // Advanced problems (level 4+)
        const advancedOps = ['+', '-', '×', '÷'];
        operation = advancedOps[Math.floor(Math.random() * advancedOps.length)];
        
        if (operation === '÷') {
          answer = Math.floor(Math.random() * 50) + 1;
          num2 = Math.floor(Math.random() * 20) + 1;
          num1 = answer * num2;
          question = `${num1} ÷ ${num2}`;
        } else if (operation === '×') {
          num1 = Math.floor(Math.random() * 25) + 1;
          num2 = Math.floor(Math.random() * 25) + 1;
          answer = num1 * num2;
          question = `${num1} × ${num2}`;
        } else {
          num1 = Math.floor(Math.random() * 200) + 1;
          num2 = Math.floor(Math.random() * 200) + 1;
          if (operation === '-' && num2 > num1) {
            [num1, num2] = [num2, num1];
          }
          answer = operation === '+' ? num1 + num2 : num1 - num2;
          question = `${num1} ${operation} ${num2}`;
        }
    }
    
    return { question, answer };
  }, [level]);

  const startNewProblem = useCallback(() => {
    const problem = generateProblem();
    setCurrentProblem(problem);
    setUserAnswer('');
    setProblemStartTime(Date.now());
    setShowFeedback(false);
    
    if (settings.autoRead) {
      speak(`What is ${problem.question}?`);
    }
  }, [generateProblem, settings.autoRead, speak]);

  const startGame = () => {
    setGameState('instructions');
    speak('Welcome to Math Master! Sharpen your numerical skills with mental math challenges.');
  };

  const beginGame = () => {
    startGameSession('math-master');
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setLives(3);
    setTimeLeft(60);
    setStreak(0);
    setCorrectAnswers(0);
    setTotalProblems(0);
    setGameStartTime(Date.now());
    clearFeedback();
    
    speak('Math Master starting! Solve problems as quickly and accurately as possible.');
    playSound('notification');
    
    startNewProblem();
  };

  const checkAnswer = () => {
    if (!currentProblem || userAnswer === '') return;
    
    const userNum = parseInt(userAnswer);
    const isCorrect = userNum === currentProblem.answer;
    const responseTime = Date.now() - problemStartTime;
    
    setTotalProblems(prev => prev + 1);
    
    if (isCorrect) {
      // Calculate score based on speed and level
      let points = 100;
      if (responseTime < 3000) points += 50; // Speed bonus
      if (responseTime < 2000) points += 50; // Extra speed bonus
      points += (level - 1) * 25; // Level bonus
      points += streak * 10; // Streak bonus
      
      setScore(prev => prev + points);
      setCorrectAnswers(prev => prev + 1);
      setStreak(prev => prev + 1);
      
      setFeedback(`Correct! +${points} points`);
      playSound('success');
      speak('Correct!');
      
      // Level up every 10 correct answers
      if ((correctAnswers + 1) % 10 === 0) {
        setLevel(prev => prev + 1);
        speak(`Level up! Now on level ${level + 1}`);
      }
    } else {
      const newLives = Math.max(0, lives - 1);
      setLives(newLives);
      setStreak(0);
      setFeedback(`Wrong! The answer was ${currentProblem.answer}`);
      playSound('error');
      speak(`Incorrect. The answer was ${currentProblem.answer}`);
      
      if (newLives <= 0) {
        setTimeout(() => endGame(), 2000);
        return;
      }
    }
    
    setShowFeedback(true);
    setTimeout(() => {
      startNewProblem();
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && gameState === 'playing') {
      checkAnswer();
    }
  };

  const skipProblem = () => {
    const newLives = Math.max(0, lives - 1);
    setLives(newLives);
    setStreak(0);
    setTotalProblems(prev => prev + 1);
    setFeedback(`Skipped! The answer was ${currentProblem.answer}`);
    speak(`Skipped. The answer was ${currentProblem.answer}`);
    
    if (newLives <= 0) {
      setTimeout(() => endGame(), 2000);
      return;
    }
    
    setShowFeedback(true);
    setTimeout(() => {
      startNewProblem();
    }, 1500);
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
    const accuracy = totalProblems > 0 ? correctAnswers / totalProblems : 0;

    try {
      await recordGameScore({
        score,
        level,
        accuracy,
        timeSpent,
        difficulty: 'hard',
        metadata: {
          correctAnswers,
          totalProblems,
          longestStreak: streak,
          livesRemaining: Math.max(0, lives),
          averageTimePerProblem: timeSpent / Math.max(totalProblems, 1)
        }
      });
      
      playSound('complete');
      speak(`Game complete! You solved ${correctAnswers} problems correctly with ${Math.round(accuracy * 100)}% accuracy.`);
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
      <div className="math-master">
        <div className="game-header">
          <h1>🧮 Math Master</h1>
          <p>Sharpen your numerical skills with mental math challenges!</p>
        </div>
        
        <div className="game-intro">
          <div className="intro-content">
            <h2>How to Play</h2>
            <ul>
              <li>Solve mental math problems as quickly as possible</li>
              <li>Start with simple addition and subtraction</li>
              <li>Progress to multiplication and division</li>
              <li>Build streaks for bonus points</li>
            </ul>
            
            <div className="difficulty-info">
              <h3>Skills You'll Practice:</h3>
              <div className="skills-grid">
                <div className="skill-item">
                  <span className="skill-icon">🔢</span>
                  <span>Numerical Processing</span>
                </div>
                <div className="skill-item">
                  <span className="skill-icon">🧠</span>
                  <span>Mental Math</span>
                </div>
                <div className="skill-item">
                  <span className="skill-icon">🎯</span>
                  <span>Problem Solving</span>
                </div>
              </div>
            </div>
            
            <button 
              className="btn-accessible btn-primary start-btn"
              onClick={startGame}
              aria-label="Start Math Master game"
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
      <div className="math-master">
        <div className="instructions-screen">
          <h2>🎯 Get Ready!</h2>
          <div className="instruction-details">
            <div className="instruction-item">
              <h3>🔢 Level 1</h3>
              <p>Simple addition and subtraction with numbers 1-20</p>
            </div>
            <div className="instruction-item">
              <h3>⚡ Level 2</h3>
              <p>Addition, subtraction, and basic multiplication up to 50</p>
            </div>
            <div className="instruction-item">
              <h3>🚀 Level 3+</h3>
              <p>All operations including division with larger numbers</p>
            </div>
          </div>
          
          <div className="tips">
            <h3>Tips:</h3>
            <ul>
              <li>Answer quickly for speed bonuses</li>
              <li>Build streaks for extra points</li>
              <li>Skip difficult problems if needed</li>
              <li>Level up every 10 correct answers</li>
            </ul>
          </div>
          
          <div className="ready-controls">
            <button 
              className="btn-accessible btn-primary"
              onClick={beginGame}
              aria-label="Begin playing Math Master"
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
      <div className="math-master">
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
              <span className="stat-value">{'❤️'.repeat(Math.max(0, lives))}</span>
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
          {gameState === 'playing' && currentProblem && (
            <>
              <div className="problem-display">
                <h2 className="problem-text">{currentProblem.question} = ?</h2>
              </div>

              <div className="answer-section">
                <input
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Your answer..."
                  className="answer-input"
                  aria-label="Enter your answer"
                  autoFocus
                />
                <div className="action-buttons">
                  <button
                    className="btn-accessible btn-primary submit-btn"
                    onClick={checkAnswer}
                    disabled={userAnswer === ''}
                    aria-label="Submit your answer"
                  >
                    Submit
                  </button>
                  <button
                    className="btn-accessible btn-secondary"
                    onClick={skipProblem}
                    aria-label="Skip this problem"
                  >
                    Skip
                  </button>
                </div>
              </div>

              {showFeedback && (
                <div className={`feedback-display ${feedback.includes('Correct') ? 'correct' : 'incorrect'}`}>
                  <p>{feedback}</p>
                </div>
              )}

              <div className="progress-info">
                <p>Problems: {correctAnswers}/{totalProblems} | Accuracy: {totalProblems > 0 ? Math.round((correctAnswers / totalProblems) * 100) : 0}%</p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    const accuracy = totalProblems > 0 ? Math.round((correctAnswers / totalProblems) * 100) : 0;
    
    return (
      <div className="math-master">
        <div className="game-results">
          <h2>🧮 Math Master Complete!</h2>
          
          <div className="results-stats">
            <div className="result-item">
              <span className="result-label">Final Score</span>
              <span className="result-value">{score}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Problems Solved</span>
              <span className="result-value">{correctAnswers}/{totalProblems}</span>
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

          {aiFeedback && (
            <div className="ai-feedback">
              <h3>🤖 Your Personal Coach Says:</h3>
              <p>{aiFeedback.text}</p>
            </div>
          )}

          <div className="result-actions">
            <button 
              className="btn-accessible btn-primary"
              onClick={beginGame}
              aria-label="Play Math Master again"
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

export default MathMaster;
