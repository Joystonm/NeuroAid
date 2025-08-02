import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import './MathMaster.css';

const MathMaster = () => {
  const [gameState, setGameState] = useState('idle');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);

  const { startGameSession, recordGameScore, feedback, clearFeedback } = useGame();
  const { speak, playSound } = useAccessibility();

  const startGame = () => {
    startGameSession('math-master');
    setGameState('playing');
    setScore(0);
    setLevel(1);
    clearFeedback();
    
    speak('Math Master game starting! Sharpen your numerical skills.');
    playSound('notification');
  };

  const endGame = () => {
    setGameState('finished');
    speak(`Game complete! You scored ${score} points.`);
    playSound('complete');
  };

  const resetGame = () => {
    setGameState('idle');
    clearFeedback();
  };

  return (
    <div className="math-master">
      <div className="game-header">
        <h1>🧮 Math Master</h1>
        <p>Sharpen your numerical skills with mental math challenges!</p>
      </div>
      
      <div className="game-area">
        {gameState === 'idle' && (
          <div className="game-intro">
            <div className="intro-content">
              <h2>How to Play</h2>
              <ul>
                <li>Solve mental math problems quickly</li>
                <li>Practice addition, subtraction, multiplication</li>
                <li>Improve your numerical processing speed</li>
                <li>Challenge yourself with harder problems</li>
              </ul>
              
              <div className="skills-practiced">
                <h3>Skills You'll Practice:</h3>
                <div className="skills-grid">
                  <span className="skill-tag">🔢 Numerical Processing</span>
                  <span className="skill-tag">🧠 Mental Math</span>
                  <span className="skill-tag">🎯 Problem Solving</span>
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
        )}
        
        {gameState === 'playing' && (
          <div className="game-board">
            <div className="game-stats">
              <span>Score: {score}</span>
              <span>Level: {level}</span>
            </div>
            <div className="game-content">
              <p>Math Master game coming soon!</p>
              <p>This will challenge your mental math skills with various arithmetic problems.</p>
            </div>
            <button onClick={endGame} className="btn-accessible btn-secondary">
              End Game
            </button>
          </div>
        )}
        
        {gameState === 'finished' && (
          <div className="game-results">
            <h3>🧮 Math Genius!</h3>
            <p>Final Score: {score}</p>
            {feedback && (
              <div className="ai-feedback">
                <h4>🤖 Your Personal Coach Says:</h4>
                <p>{feedback.text}</p>
              </div>
            )}
            <div className="result-actions">
              <button onClick={startGame} className="btn-accessible btn-primary">
                Play Again
              </button>
              <button onClick={resetGame} className="btn-accessible btn-secondary">
                Main Menu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MathMaster;
