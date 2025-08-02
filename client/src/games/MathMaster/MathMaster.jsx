import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import GameLayout from '../../components/GameLayout';
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

  const { startGameSession, recordGameScore, feedback: gameFeedback, clearFeedback } = useGame();
  const { speak, playSound, settings } = useAccessibility();

  // Generate math problem based on level
  const generateProblem = useCallback(() => {
    const operations = ['+', '-', '*'];
    let num1, num2, operation, answer;

    switch (level) {
      case 1:
        // Simple addition/subtraction (1-20)
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
        operation = Math.random() < 0.5 ? '+' : '-';
        if (operation === '-' && num2 > num1) [num1, num2] = [num2, num1];
        break;
      case 2:
        // Addition/subtraction with larger numbers (1-50)
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        operation = Math.random() < 0.5 ? '+' : '-';
        if (operation === '-' && num2 > num1) [num1, num2] = [num2, num1];
        break;
      case 3:
        // Include multiplication (1-12)
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        operation = operations[Math.floor(Math.random() * operations.length)];
        if (operation === '-' && num2 > num1) [num1, num2] = [num2, num1];
        break;
      default:
        // Advanced problems
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
        operation = operations[Math.floor(Math.random() * operations.length)];
        if (operation === '-' && num2 > num1) [num1, num2] = [num2, num1];
    }

    switch (operation) {
      case '+':
        answer = num1 + num2;
        break;
      case '-':
        answer = num1 - num2;
        break;
      case '*':
        answer = num1 * num2;
        break;
      default:
        answer = num1 + num2;
    }

    const problem = {
      question: `${num1} ${operation} ${num2}`,
      answer: answer,
      num1,
      num2,
      operation
    };

    setCurrentProblem(problem);
    setProblemStartTime(Date.now());
    setTotalProblems(prev => prev + 1);

    if (settings.autoRead) {
      speak(`What is ${num1} ${operation === '*' ? 'times' : operation === '+' ? 'plus' : 'minus'} ${num2}?`);
    }
  }, [level, settings.autoRead, speak]);

  // Start game
  const startGame = () => {
    setGameState('instructions');
    speak('Welcome to Math Master! This game will help you practice mental math.');
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
    setUserAnswer('');
    setGameStartTime(Date.now());
    generateProblem();
    clearFeedback();
    
    speak('Game starting! Solve the math problems as quickly as possible.');
    playSound('notification');
  };

  // Handle answer submission
  const handleSubmit = () => {
    if (!currentProblem || userAnswer === '') return;

    const userNum = parseInt(userAnswer);
    const isCorrect = userNum === currentProblem.answer;
    
    if (isCorrect) {
      const timeBonus = Math.max(0, 10 - Math.floor((Date.now() - problemStartTime) / 1000));
      const points = (level * 10) + timeBonus + (streak * 2);
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
      setCorrectAnswers(prev => prev + 1);
      
      setFeedback(`Correct! +${points} points`);
      setShowFeedback(true);
      playSound('success');
      speak('Correct!');
      
      // Check for level up
      if (streak > 0 && streak % 5 === 0) {
        setLevel(prev => prev + 1);
        speak(`Level up! Now level ${level + 1}`);
      }
      
    } else {
      setLives(prev => prev - 1);
      setStreak(0);
      
      setFeedback(`Wrong! The answer was ${currentProblem.answer}`);
      setShowFeedback(true);
      playSound('error');
      speak(`Wrong! The answer was ${currentProblem.answer}`);
      
      if (lives <= 1) {
        setTimeout(() => endGame(), 2000);
        return;
      }
    }

    // Clear feedback and generate new problem
    setTimeout(() => {
      setShowFeedback(false);
      setUserAnswer('');
      generateProblem();
    }, 1500);
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
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
    const accuracy = totalProblems > 0 ? correctAnswers / totalProblems : 0;

    try {
      await recordGameScore({
        score,
        level,
        accuracy,
        timeSpent,
        difficulty: 'medium',
        metadata: {
          totalProblems,
          correctAnswers,
          maxStreak: streak,
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
      <div className="math-master">
        <div className="game-header">
          <h1>🧮 Math Master</h1>
          <p>Sharpen your math skills with timed challenges!</p>
        </div>
        
        <div className="game-intro">
          <div className="intro-content">
            <h2>How to Play</h2>
            <ul>
              <li>Solve math problems as quickly as possible</li>
              <li>Build streaks for bonus points</li>
              <li>Advance levels to face harder challenges</li>
              <li>Beat the clock to maximize your score</li>
            </ul>
            
            <div className="difficulty-info">
              <h3>Skills You'll Practice:</h3>
              <div className="skills-grid">
                <div className="skill-item">
                  <span className="skill-icon">🧠</span>
                  <span>Mental Math</span>
                </div>
                <div className="skill-item">
                  <span className="skill-icon">⚡</span>
                  <span>Quick Thinking</span>
                </div>
                <div className="skill-item">
                  <span className="skill-icon">🎯</span>
                  <span>Accuracy</span>
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
          <div className="instruction-example">
            <p>You'll see problems like:</p>
            <div className="example-problem">
              <span className="problem-text">15 + 7 = ?</span>
            </div>
            <p>Type your answer and press Enter or click Submit!</p>
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
    const gameStats = [
      { icon: '🏆', label: 'Score', value: score },
      { icon: '📊', label: 'Level', value: level },
      { icon: '❤️', label: 'Lives', value: lives },
      { icon: '⏰', label: 'Time', value: `${timeLeft}s` },
      { icon: '🔥', label: 'Streak', value: streak }
    ];

    return (
      <div className="math-master">
        <GameLayout
          gameTitle="🧮 Math Master"
          level={level}
          onPause={togglePause}
          isPaused={gameState === 'paused'}
          stats={gameStats}
        >
          {currentProblem && gameState === 'playing' && (
            <div className="math-container">
              <div className="problem-display">
                <h3>Solve this problem:</h3>
                <div className="math-problem">
                  {currentProblem.question} = ?
                </div>
                {showFeedback && (
                  <div className={`feedback ${feedback.includes('Correct') ? 'correct' : 'incorrect'}`}>
                    {feedback}
                  </div>
                )}
              </div>
              
              <div className="answer-input">
                <input
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Your answer..."
                  className="answer-field"
                  autoFocus
                  disabled={showFeedback}
                />
                <button 
                  className="btn-accessible btn-primary submit-btn"
                  onClick={handleSubmit}
                  disabled={showFeedback || userAnswer === ''}
                >
                  Submit
                </button>
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
    const accuracy = totalProblems > 0 ? Math.round((correctAnswers / totalProblems) * 100) : 0;
    
    return (
      <div className="math-master">
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
              <span className="result-label">Problems Solved</span>
              <span className="result-value">{correctAnswers}</span>
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
