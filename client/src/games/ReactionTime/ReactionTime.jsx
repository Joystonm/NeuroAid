import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import './ReactionTime.css';

const ReactionTime = () => {
  const [gameState, setGameState] = useState('idle');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);

  const { startGameSession, recordGameScore, feedback, clearFeedback } = useGame();
  const { speak, playSound } = useAccessibility();

  const startGame = () => {
    startGameSession('reaction-time');
    setGameState('playing');
    setScore(0);
    setLevel(1);
    clearFeedback();
    
    speak('Lightning Reflex game starting! Test your reaction time.');
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
    <div className="reaction-time">
      <div className="game-header">
        <h1>⚡ Lightning Reflex</h1>
        <p>Test and improve your reaction time with quick challenges!</p>
      </div>
      
      <div className="game-area">
        {gameState === 'idle' && (
          <div className="game-intro">
            <div className="intro-content">
              <h2>How to Play</h2>
              <ul>
                <li>React quickly to visual and audio cues</li>
                <li>Click or tap as fast as you can</li>
                <li>Improve your processing speed</li>
                <li>Challenge yourself with faster levels</li>
              </ul>
              
              <div className="skills-practiced">
                <h3>Skills You'll Practice:</h3>
                <div className="skills-grid">
                  <span className="skill-tag">⚡ Reaction Time</span>
                  <span className="skill-tag">🏃 Processing Speed</span>
                  <span className="skill-tag">🎮 Motor Control</span>
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
        )}
        
        {gameState === 'playing' && (
          <div className="game-board">
            <div className="game-stats">
              <span>Score: {score}</span>
              <span>Level: {level}</span>
            </div>
            <div className="game-content">
              <p>Lightning Reflex game coming soon!</p>
              <p>This will test your reaction time with quick visual and audio challenges.</p>
            </div>
            <button onClick={endGame} className="btn-accessible btn-secondary">
              End Game
            </button>
          </div>
        )}
        
        {gameState === 'finished' && (
          <div className="game-results">
            <h3>⚡ Lightning Fast!</h3>
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

export default ReactionTime;
