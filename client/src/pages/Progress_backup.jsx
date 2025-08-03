import React, { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import './Progress.css';

const Progress = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [selectedGame, setSelectedGame] = useState('all');
  const { getAllStats, getGameStats } = useGame();
  const { speak } = useAccessibility();

  const [stats, setStats] = useState(null);

  useEffect(() => {
    const allStats = getAllStats();
    setStats(allStats);
  }, [getAllStats]);

  const gameTypes = [
    { id: 'all', name: 'All Games', icon: '🎮' },
    { id: 'focus-flip', name: 'Focus Flip', icon: '🃏' },
    { id: 'dot-dash', name: 'Dot Dash', icon: '📡' },
    { id: 'color-trap', name: 'Color Trap', icon: '🎨' },
    { id: 'sequence-sense', name: 'Sequence Sense', icon: '🔢' },
    { id: 'shape-sorter', name: 'Shape Sorter', icon: '🔷' },
    { id: 'word-chain', name: 'Word Chain', icon: '🔗' },
    { id: 'reaction-time', name: 'Lightning Reflex', icon: '⚡' },
    { id: 'math-master', name: 'Math Master', icon: '🧮' }
  ];

  const timeframes = [
    { id: 'week', name: 'This Week' },
    { id: 'month', name: 'This Month' },
    { id: 'all', name: 'All Time' }
  ];

  const handleGameChange = (gameId) => {
    setSelectedGame(gameId);
    const gameName = gameTypes.find(g => g.id === gameId)?.name || 'All Games';
    speak(`Viewing progress for ${gameName}`);
  };

  const handleTimeframeChange = (timeframe) => {
    setSelectedTimeframe(timeframe);
    const timeframeName = timeframes.find(t => t.id === timeframe)?.name || timeframe;
    speak(`Viewing ${timeframeName} progress`);
  };

  const getSelectedGameStats = () => {
    if (!stats) return null;
    
    if (selectedGame === 'all') {
      return {
        gamesPlayed: stats.totalGames,
        averageScore: Math.round(stats.totalScore / Math.max(stats.totalGames, 1)),
        averageAccuracy: stats.averageAccuracy,
        improvement: 0 // Calculate overall improvement
      };
    }
    
    return stats.statsByGame[selectedGame] || {
      gamesPlayed: 0,
      bestScore: 0,
      averageScore: 0,
      averageAccuracy: 0,
      improvement: 0
    };
  };

  const getProgressMessage = (gameStats) => {
    if (!gameStats || gameStats.gamesPlayed === 0) {
      return "Start playing games to see your progress!";
    }

    const messages = [];
    
    if (gameStats.improvement > 10) {
      messages.push("🎉 Amazing improvement!");
    } else if (gameStats.improvement > 0) {
      messages.push("📈 You're getting better!");
    }
    
    if (gameStats.averageAccuracy >= 90) {
      messages.push("🎯 Excellent accuracy!");
    } else if (gameStats.averageAccuracy >= 75) {
      messages.push("👍 Good accuracy!");
    }
    
    if (gameStats.gamesPlayed >= 10) {
      messages.push("💪 Great consistency!");
    }
    
    return messages.length > 0 ? messages.join(' ') : "Keep up the great work!";
  };

  const getSkillInsights = () => {
    if (!stats || stats.totalGames === 0) return [];

    const insights = [];
    const gameStats = stats.statsByGame;

    // Analyze strongest skills
    const gameScores = Object.entries(gameStats)
      .filter(([_, data]) => data.gamesPlayed > 0)
      .map(([game, data]) => ({ game, score: data.averageScore, accuracy: data.averageAccuracy }))
      .sort((a, b) => b.accuracy - a.accuracy);

    if (gameScores.length > 0) {
      const bestGame = gameScores[0];
      const gameInfo = gameTypes.find(g => g.id === bestGame.game);
      if (gameInfo) {
        insights.push({
          type: 'strength',
          title: 'Your Strongest Skill',
          description: `You excel at ${gameInfo.name} with ${bestGame.accuracy}% accuracy!`,
          icon: gameInfo.icon
        });
      }
    }

    // Analyze improvement areas
    if (gameScores.length > 1) {
      const needsWork = gameScores[gameScores.length - 1];
      const gameInfo = gameTypes.find(g => g.id === needsWork.game);
      if (gameInfo && needsWork.accuracy < 70) {
        insights.push({
          type: 'improvement',
          title: 'Growth Opportunity',
          description: `Practice ${gameInfo.name} more to improve your ${needsWork.accuracy}% accuracy.`,
          icon: gameInfo.icon
        });
      }
    }

    // Overall progress insight
    if (stats.totalGames >= 5) {
      insights.push({
        type: 'progress',
        title: 'Overall Progress',
        description: `You've played ${stats.totalGames} games with an average accuracy of ${stats.averageAccuracy}%!`,
        icon: '📊'
      });
    }

    return insights;
  };

  if (!stats) {
    return (
      <div className="progress">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your progress...</p>
        </div>
      </div>
    );
  }

  const selectedGameStats = getSelectedGameStats();
  const skillInsights = getSkillInsights();

  return (
    <div className="progress">
      <div className="progress-header">
        <h1>📈 Your Progress</h1>
        <p>Track your cognitive training journey</p>
      </div>

      {/* Filter Controls */}
      <div className="progress-filters">
        <div className="filter-group">
          <label htmlFor="game-select">Game:</label>
          <select
            id="game-select"
            value={selectedGame}
            onChange={(e) => handleGameChange(e.target.value)}
            className="filter-select"
          >
            {gameTypes.map(game => (
              <option key={game.id} value={game.id}>
                {game.icon} {game.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="timeframe-select">Timeframe:</label>
          <select
            id="timeframe-select"
            value={selectedTimeframe}
            onChange={(e) => handleTimeframeChange(e.target.value)}
            className="filter-select"
          >
            {timeframes.map(timeframe => (
              <option key={timeframe.id} value={timeframe.id}>
                {timeframe.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="progress-overview">
        <div className="overview-card">
          <div className="card-icon">🎮</div>
          <div className="card-content">
            <h3>Games Played</h3>
            <div className="card-value">{selectedGameStats?.gamesPlayed || 0}</div>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon">⭐</div>
          <div className="card-content">
            <h3>Average Score</h3>
            <div className="card-value">{selectedGameStats?.averageScore || 0}</div>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon">🎯</div>
          <div className="card-content">
            <h3>Accuracy</h3>
            <div className="card-value">{selectedGameStats?.averageAccuracy || 0}%</div>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon">📈</div>
          <div className="card-content">
            <h3>Improvement</h3>
            <div className="card-value">
              {selectedGameStats?.improvement > 0 ? '+' : ''}{selectedGameStats?.improvement || 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Progress Message */}
      <div className="progress-message">
        <h2>{getProgressMessage(selectedGameStats)}</h2>
      </div>

      {/* Chart Placeholder */}
      <div className="chart-section">
        <h3>Performance Over Time</h3>
        <div className="chart-container">
          <div className="chart-placeholder">
            <div className="chart-bars">
              {[...Array(7)].map((_, i) => (
                <div 
                  key={i} 
                  className="chart-bar" 
                  style={{ 
                    height: `${Math.random() * 80 + 20}%`,
                    animationDelay: `${i * 0.1}s`
                  }}
                ></div>
              ))}
            </div>
            <p>Interactive charts coming soon!</p>
          </div>
        </div>
      </div>

      {/* Skill Insights */}
      {skillInsights.length > 0 && (
        <div className="skill-insights">
          <h3>🧠 Skill Insights</h3>
          <div className="insights-grid">
            {skillInsights.map((insight, index) => (
              <div key={index} className={`insight-card ${insight.type}`}>
                <div className="insight-icon">{insight.icon}</div>
                <div className="insight-content">
                  <h4>{insight.title}</h4>
                  <p>{insight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Games */}
      {stats.recentGames && stats.recentGames.length > 0 && (
        <div className="recent-games">
          <h3>🕒 Recent Games</h3>
          <div className="games-list">
            {stats.recentGames.slice(0, 5).map((game, index) => {
              const gameInfo = gameTypes.find(g => g.id === game.gameType);
              return (
                <div key={index} className="game-item">
                  <div className="game-info">
                    <span className="game-icon">{gameInfo?.icon || '🎮'}</span>
                    <div className="game-details">
                      <span className="game-name">{gameInfo?.name || game.gameType}</span>
                      <span className="game-date">
                        {new Date(game.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="game-stats">
                    <span className="game-score">{game.score} pts</span>
                    <span className="game-accuracy">{Math.round(game.accuracy * 100)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Progress;
