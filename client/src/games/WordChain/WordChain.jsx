import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import GameLayout from '../../components/GameLayout';
import './WordChain.css';

const WordChain = () => {
  const [gameState, setGameState] = useState('idle');
  const [currentWord, setCurrentWord] = useState('');
  const [userWord, setUserWord] = useState('');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [chainLength, setChainLength] = useState(0);
  const [usedWords, setUsedWords] = useState(new Set());
  const [wordChain, setWordChain] = useState([]);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  const { startGameSession, recordGameScore, feedback: gameFeedback, clearFeedback } = useGame();
  const { speak, playSound, settings } = useAccessibility();

  const startingWords = ['apple', 'house', 'table', 'music', 'water', 'light', 'paper', 'green'];

  const startGame = () => {
    setGameState('instructions');
    speak('Welcome to Word Chain! This game will help you practice vocabulary and word association.');
  };

  const beginGame = () => {
    startGameSession('word-chain');
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setLives(3);
    setTimeLeft(60);
    setChainLength(0);
    setUsedWords(new Set());
    setWordChain([]);
    setUserWord('');
    setGameStartTime(Date.now());
    
    // Start with a random word
    const startWord = startingWords[Math.floor(Math.random() * startingWords.length)];
    setCurrentWord(startWord);
    setWordChain([startWord]);
    setUsedWords(new Set([startWord.toLowerCase()]));
    
    clearFeedback();
    
    speak(`Game starting! The first word is ${startWord}. Enter a word that starts with the last letter.`);
    playSound('notification');
  };

  const isValidWord = (word) => {
    // Basic word validation - in a real game, you'd use a dictionary API
    return word.length >= 3 && /^[a-zA-Z]+$/.test(word);
  };

  const handleWordSubmit = () => {
    if (!userWord.trim()) return;

    const word = userWord.toLowerCase().trim();
    const lastLetter = currentWord.slice(-1).toLowerCase();
    const firstLetter = word.charAt(0);

    // Check if word starts with the correct letter
    if (firstLetter !== lastLetter) {
      setLives(prev => prev - 1);
      setFeedback(`Word must start with "${lastLetter.toUpperCase()}"!`);
      setShowFeedback(true);
      playSound('error');
      speak(`Word must start with ${lastLetter}`);
      
      if (lives <= 1) {
        setTimeout(() => endGame(), 2000);
        return;
      }
    }
    // Check if word was already used
    else if (usedWords.has(word)) {
      setLives(prev => prev - 1);
      setFeedback('Word already used! Try a different word.');
      setShowFeedback(true);
      playSound('error');
      speak('Word already used');
      
      if (lives <= 1) {
        setTimeout(() => endGame(), 2000);
        return;
      }
    }
    // Check if word is valid
    else if (!isValidWord(word)) {
      setLives(prev => prev - 1);
      setFeedback('Invalid word! Use only letters, minimum 3 characters.');
      setShowFeedback(true);
      playSound('error');
      speak('Invalid word');
      
      if (lives <= 1) {
        setTimeout(() => endGame(), 2000);
        return;
      }
    }
    // Word is correct!
    else {
      const points = word.length * level;
      setScore(prev => prev + points);
      setChainLength(prev => prev + 1);
      setCurrentWord(word);
      setUsedWords(prev => new Set([...prev, word]));
      setWordChain(prev => [...prev, word]);
      
      setFeedback(`Great! +${points} points`);
      setShowFeedback(true);
      playSound('success');
      speak('Correct!');
      
      // Level up every 10 words
      if (chainLength > 0 && chainLength % 10 === 0) {
        setLevel(prev => prev + 1);
        speak(`Level up! Now level ${level + 1}`);
      }
    }

    // Clear input and feedback
    setTimeout(() => {
      setUserWord('');
      setShowFeedback(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleWordSubmit();
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

  const endGame = async () => {
    setGameState('finished');
    const timeSpent = (Date.now() - gameStartTime) / 1000;
    const accuracy = chainLength > 0 ? chainLength / (chainLength + (3 - lives)) : 0;

    try {
      await recordGameScore({
        score,
        level,
        accuracy,
        timeSpent,
        difficulty: 'medium',
        metadata: {
          chainLength,
          wordsUsed: usedWords.size,
          livesRemaining: lives
        }
      });
      
      playSound('complete');
      speak(`Game complete! You created a chain of ${chainLength} words.`);
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
      <div className="word-chain">
        <div className="game-header">
          <h1>🔗 Word Chain</h1>
          <p>Build word chains and expand your vocabulary!</p>
        </div>
        
        <div className="game-intro">
          <div className="intro-content">
            <h2>How to Play</h2>
            <ul>
              <li>Start with the given word</li>
              <li>Enter a word that starts with the last letter</li>
              <li>Don't repeat words you've already used</li>
              <li>Build the longest chain possible</li>
            </ul>
            
            <div className="difficulty-info">
              <h3>Skills You'll Practice:</h3>
              <div className="skills-grid">
                <div className="skill-item">
                  <span className="skill-icon">📚</span>
                  <span>Vocabulary</span>
                </div>
                <div className="skill-item">
                  <span className="skill-icon">🧠</span>
                  <span>Word Association</span>
                </div>
                <div className="skill-item">
                  <span className="skill-icon">⚡</span>
                  <span>Quick Thinking</span>
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
            <p>Example chain:</p>
            <div className="example-chain">
              <span className="chain-word">APPLE</span>
              <span className="chain-arrow">→</span>
              <span className="chain-word">ELEPHANT</span>
              <span className="chain-arrow">→</span>
              <span className="chain-word">TABLE</span>
            </div>
            <p>Each word starts with the last letter of the previous word!</p>
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
    const gameStats = [
      { icon: '🏆', label: 'Score', value: score },
      { icon: '📊', label: 'Level', value: level },
      { icon: '❤️', label: 'Lives', value: lives },
      { icon: '⏰', label: 'Time', value: `${timeLeft}s` },
      { icon: '🔗', label: 'Chain', value: chainLength }
    ];

    return (
      <div className="word-chain">
        <GameLayout
          gameTitle="🔗 Word Chain"
          level={level}
          onPause={togglePause}
          isPaused={gameState === 'paused'}
          stats={gameStats}
        >
          <div className="word-chain-container">
            <div className="word-display">
              <h3>Current Word:</h3>
              <div className="current-word">
                {currentWord.toUpperCase()}
              </div>
              <p className="word-hint">
                Next word must start with: <strong>{currentWord.slice(-1).toUpperCase()}</strong>
              </p>
            </div>
            
            {showFeedback && (
              <div className={`word-feedback ${feedback.includes('Great') ? 'correct' : 'incorrect'}`}>
                {feedback}
              </div>
            )}

            <div className="word-input">
              <input
                type="text"
                value={userWord}
                onChange={(e) => setUserWord(e.target.value.replace(/[^a-zA-Z]/g, ''))}
                onKeyPress={handleKeyPress}
                placeholder="Enter your word..."
                className="word-field"
                autoFocus
                disabled={showFeedback}
              />
              <button 
                className="btn-accessible btn-primary submit-btn"
                onClick={handleWordSubmit}
                disabled={showFeedback || !userWord.trim()}
              >
                Submit
              </button>
            </div>

            {wordChain.length > 1 && (
              <div className="chain-display">
                <h4>Your Chain:</h4>
                <div className="word-chain-list">
                  {wordChain.slice(-5).map((word, index) => (
                    <span key={index} className="chain-item">
                      {word.toUpperCase()}
                    </span>
                  ))}
                  {wordChain.length > 5 && <span className="chain-more">...</span>}
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
    return (
      <div className="word-chain">
        <div className="game-results">
          <h2>🎉 Great Job!</h2>
          
          <div className="results-stats">
            <div className="result-item">
              <span className="result-label">Final Score</span>
              <span className="result-value">{score}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Chain Length</span>
              <span className="result-value">{chainLength}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Level Reached</span>
              <span className="result-value">{level}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Words Used</span>
              <span className="result-value">{usedWords.size}</span>
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
