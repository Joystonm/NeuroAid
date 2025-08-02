import React from 'react';
import './GameLayout.css';

const GameLayout = ({ 
  gameTitle, 
  level, 
  onPause, 
  isPaused, 
  stats = [], 
  children,
  className = ""
}) => {
  return (
    <div className={`game-layout ${className}`}>
      {/* Top Header with Pause Button */}
      <div className="game-top-header">
        <h2 className="game-title">
          {gameTitle} {level && `- Level ${level}`}
        </h2>
        <button 
          className="btn-accessible btn-secondary pause-btn"
          onClick={onPause}
          aria-label={isPaused ? 'Resume game' : 'Pause game'}
        >
          {isPaused ? '▶️ Resume' : '⏸️ Pause'}
        </button>
      </div>

      <div className="game-main-content">
        {/* Left Sidebar with Stats */}
        <div className="game-sidebar">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-info">
                <span className="stat-label">{stat.label}</span>
                <span className="stat-value">{stat.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Main Game Area */}
        <div className="game-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default GameLayout;
