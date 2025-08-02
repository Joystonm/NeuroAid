import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { generateStartWord, validateWordConnection, calculateScore, getWordCategories } from './logic';
import './WordChain.css';

const WordChain = () => {
  const [gameState, setGameState] = useState('idle'); // idle, instructions, playing, paused, finished
  const [currentWord, setCurrentWord] = useState('');
  const [wordChain, setWordChain] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [streak, setStreak] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [correctWords, setCorrectWords] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [hint, setHint] = useState('');

  const { startGameSession, recordGameScore, feedback, clearFeedback } = useGame();
  const { speak, playSound, settings } = useAccessibility();

  // Generate new starting word
  const generateNewWord = useCallback(() => {
    const startWord = generateStartWord(level);
    setCurrentWord(startWord);
    setWordChain([startWord]);
    setHint('');
    
    if (settings.autoRead) {
      speak(`New word: ${startWord}. Find a word that connects to it!`);
    }
  }, [level, settings.autoRead, speak]);

  // Start game
  const startGame = () => {
    setGameState('instructions');
    speak('Welcome to Word Chain! This game will help you practice vocabulary and word associations.');
  };

  const beginGame = () => {
    startGameSession('word-chain');
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setLives(3);
    setTimeLeft(60);
    setStreak(0);
    setCorrectWords(0);
    setTotalAttempts(0);
    setGameStartTime(Date.now());
    generateNewWord();
    clearFeedback();
    
    speak('Word Chain starting! Create connections between words to build your chain.');
    playSound('notification');
  };

  // Handle word submission
  const handleSubmitWord = () => {
    if (gameState !== 'playing' || !userInput.trim()) return;

    const inputWord = userInput.trim().toLowerCase();
    setTotalAttempts(prev => prev + 1);

    const validation = validateWordConnection(currentWord, inputWord, wordChain);
    
    if (validation.isValid) {
      const points = calculateScore(level, streak, timeLeft, wordChain.length);
      setScore(prev => prev + points);
      setCorrectWords(prev => prev + 1);
      setStreak(prev => prev + 1);
      
      // Add word to chain
      const newChain = [...wordChain, inputWord];
      setWordChain(newChain);
      setCurrentWord(inputWord);
      setUserInput('');
      setHint('');
      
      playSound('success');
      speak(`Correct! ${inputWord} connects to ${currentWord}. ${validation.connection}`);
      
      // Level up every 10 correct words
      if ((correctWords + 1) % 10 === 0) {
        setLevel(prev => prev + 1);
        speak(`Level up! Now on level ${level + 1}`);
      }
    } else {
      setLives(prev => prev - 1);
      setStreak(0);
      
      playSound('error');
      speak(`${inputWord} doesn't connect well to ${currentWord}. ${validation.reason}`);
      
      if (lives <= 1) {
        endGame();
        return;
      }
      
      setUserInput('');
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmitWord();
    }
  };

  // Get hint
  const getHint = () => {
    const categories = getWordCategories(currentWord);
    const hintText = `Try words related to: ${categories.join(', ')}`;
    setHint(hintText);
    speak(hintText);
    playSound('notification');
  };

  // Skip word
  const skipWord = () => {
    generateNewWord();
    setUserInput('');
    speak('Skipped to a new word');
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
    const accuracy = totalAttempts > 0 ? correctWords / totalAttempts : 0;

    try {
      await recordGameScore({
        score,
        level,
        accuracy,
        timeSpent,
        difficulty: 'medium',
        metadata: {
          correctWords,
          totalAttempts,
          chainLength: wordChain.length,
          longestStreak: streak,
          livesRemaining: lives
        }
      });
      
      playSound('complete');
      speak(`Game complete! You created a word chain of ${wordChain.length} words with ${Math.round(accuracy * 100)}% accuracy.`);
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
      <div className="word-chain">
        <div className="game-header">
          <h1>🔗 Word Chain</h1>
          <p>Build vocabulary and verbal fluency with word associations!</p>
        </div>
        
        <div className="game-intro">
          <div className="intro-content">
            <h2>How to Play</h2>
            <ul>
              <li>Connect words by meaning, category, or association</li>
              <li>Each new word must relate to the previous one</li>
              <li>Build longer chains for higher scores</li>
              <li>Use hints if you get stuck</li>
            </ul>
            
            <div className="difficulty-info">
              <h3>Skills You'll Practice:</h3>
              <div className="skills-grid">
                <div className="skill-item">
                  <span className="skill-icon">🗣️</span>
                  <span>Verbal Fluency</span>
                </div>
                <div className="skill-item">
                  <span className="skill-icon">📚</span>
                  <span>Vocabulary</span>
                </div>
                <div className="skill-item">
                  <span className="skill-icon">💭</span>
                  <span>Creative Thinking</span>
                </div>
              </div>
            </div>
            
            <button 
              className="btn-accessible btn-primary start-btn"
              onClick={startGame}
              aria-label="Start Word Chain game"
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
      <div className="word-chain">
        <div className="instructions-screen">
          <h2>🎯 Get Ready!</h2>
          <div className="instruction-example">
            <p>Example word chain:</p>
            <div className="example-chain">
              <span className="chain-word">Cat</span>
              <span className="chain-arrow">→</span>
              <span className="chain-word">Pet</span>
              <span className="chain-arrow">→</span>
              <span className="chain-word">Dog</span>
              <span className="chain-arrow">→</span>
              <span className="chain-word">Bark</span>
            </div>
            <p>Each word connects to the next through meaning or association!</p>
          </div>
          
          <div className="tips">
            <h3>Tips:</h3>
            <ul>
              <li>Think of synonyms, categories, or related concepts</li>
              <li>Use the hint button if you're stuck</li>
              <li>Skip words that are too difficult</li>
              <li>Build longer chains for bonus points</li>
            </ul>
          </div>
          
          <div className="ready-controls">
            <button 
              className="btn-accessible btn-primary"
              onClick={beginGame}
              aria-label="Begin playing Word Chain"
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
      <div className="word-chain">
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
              <span className="stat-label">Chain</span>
              <span className="stat-value">{wordChain.length}</span>
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
            <>
              {/* Word Chain Display */}
              <div className="chain-display">
                <h3>Your Word Chain:</h3>
                <div className="word-chain-container">
                  {wordChain.map((word, index) => (
                    <React.Fragment key={index}>
                      <span 
                        className={`chain-word ${index === wordChain.length - 1 ? 'current' : ''}`}
                      >
                        {word}
                      </span>
                      {index < wordChain.length - 1 && (
                        <span className="chain-arrow">→</span>
                      )}
                    </React.Fragment>
                  ))}
                  <span className="chain-arrow">→</span>
                  <span className="chain-placeholder">?</span>
                </div>
              </div>

              {/* Current Word */}
              <div className="current-word-section">
                <h3>Connect a word to:</h3>
                <div className="current-word-display">
                  {currentWord}
                </div>
              </div>

              {/* Input Section */}
              <div className="input-section">
                <div className="input-group">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter your word..."
                    className="word-input"
                    aria-label="Enter a word that connects to the current word"
                    autoFocus
                  />
                  <button
                    className="btn-accessible btn-primary submit-btn"
                    onClick={handleSubmitWord}
                    disabled={!userInput.trim()}
                    aria-label="Submit your word"
                  >
                    Submit
                  </button>
                </div>

                <div className="action-buttons">
                  <button
                    className="btn-accessible btn-secondary"
                    onClick={getHint}
                    aria-label="Get a hint"
                  >
                    💡 Hint
                  </button>
                  <button
                    className="btn-accessible btn-secondary"
                    onClick={skipWord}
                    aria-label="Skip to a new word"
                  >
                    ⏭️ Skip
                  </button>
                </div>

                {hint && (
                  <div className="hint-display">
                    <h4>💡 Hint:</h4>
                    <p>{hint}</p>
                  </div>
                )}
              </div>

              {/* Progress Info */}
              <div className="progress-info">
                <p>Streak: {streak} | Words: {correctWords} | Accuracy: {totalAttempts > 0 ? Math.round((correctWords / totalAttempts) * 100) : 0}%</p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    const accuracy = totalAttempts > 0 ? Math.round((correctWords / totalAttempts) * 100) : 0;
    
    return (
      <div className="word-chain">
        <div className="game-results">
          <h2>🎉 Great Word Chain!</h2>
          
          <div className="final-chain">
            <h3>Your Final Chain:</h3>
            <div className="word-chain-container">
              {wordChain.map((word, index) => (
                <React.Fragment key={index}>
                  <span className="chain-word final">{word}</span>
                  {index < wordChain.length - 1 && (
                    <span className="chain-arrow">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          
          <div className="results-stats">
            <div className="result-item">
              <span className="result-label">Final Score</span>
              <span className="result-value">{score}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Chain Length</span>
              <span className="result-value">{wordChain.length}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Accuracy</span>
              <span className="result-value">{accuracy}%</span>
            </div>
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
              aria-label="Play Word Chain again"
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

export default WordChain;
