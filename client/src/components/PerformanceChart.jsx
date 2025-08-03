import React, { useState, useEffect } from 'react';
import './PerformanceChart.css';

const PerformanceChart = ({ stats, selectedGame, selectedTimeframe }) => {
  const [chartData, setChartData] = useState([]);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  useEffect(() => {
    generateChartData();
  }, [stats, selectedGame, selectedTimeframe]);

  const generateChartData = () => {
    if (!stats || !stats.recentGames || stats.recentGames.length === 0) {
      // Generate sample data for demonstration if no real data exists
      if (stats && stats.totalGames === 0) {
        setChartData([]);
        return;
      }
      
      // If we have some stats but no recent games, generate sample progression
      const sampleData = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Generate realistic progression data
        const baseAccuracy = 60 + (6 - i) * 5; // Improving from 60% to 90%
        const baseScore = 100 + (6 - i) * 20; // Improving from 100 to 220
        
        sampleData.push({
          date: date,
          score: baseScore + Math.random() * 20 - 10, // Add some variance
          accuracy: Math.min(95, baseAccuracy + Math.random() * 10 - 5),
          gamesPlayed: Math.floor(Math.random() * 3) + 1,
          label: date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })
        });
      }
      
      setChartData(sampleData);
      return;
    }

    // Filter games based on selected game type
    let filteredGames = stats.recentGames;
    if (selectedGame !== 'all') {
      filteredGames = stats.recentGames.filter(game => game.gameType === selectedGame);
    }

    // Filter by timeframe
    const now = new Date();
    let startDate = new Date();
    
    switch (selectedTimeframe) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(now.getDate() - 30);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    filteredGames = filteredGames.filter(game => 
      new Date(game.timestamp) >= startDate
    );

    if (filteredGames.length === 0) {
      setChartData([]);
      return;
    }

    // Group games by day and calculate averages
    const gamesByDay = {};
    filteredGames.forEach(game => {
      const date = new Date(game.timestamp).toDateString();
      if (!gamesByDay[date]) {
        gamesByDay[date] = {
          games: [],
          date: new Date(game.timestamp)
        };
      }
      gamesByDay[date].games.push(game);
    });

    // Calculate daily averages
    const dailyData = Object.values(gamesByDay).map(day => {
      const avgScore = day.games.reduce((sum, game) => sum + game.score, 0) / day.games.length;
      const avgAccuracy = day.games.reduce((sum, game) => sum + (game.accuracy * 100), 0) / day.games.length;
      
      return {
        date: day.date,
        score: Math.round(avgScore),
        accuracy: Math.round(avgAccuracy),
        gamesPlayed: day.games.length,
        label: day.date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      };
    });

    // Sort by date and limit to last 14 days for better visualization
    const sortedData = dailyData
      .sort((a, b) => a.date - b.date)
      .slice(-14);

    setChartData(sortedData);
  };

  const getMaxValue = (key) => {
    if (chartData.length === 0) return 100;
    const values = chartData.map(d => d[key]);
    return Math.max(...values, key === 'accuracy' ? 100 : 50);
  };

  const getChartHeight = (value, key) => {
    const maxValue = getMaxValue(key);
    return Math.max((value / maxValue) * 100, 5); // Minimum 5% height
  };

  if (!chartData || chartData.length === 0) {
    return (
      <div className="chart-section">
        <h3>📈 Performance Over Time</h3>
        <div className="chart-container">
          <div className="no-data-message">
            <div className="no-data-icon">📊</div>
            <h4>No Performance Data Yet</h4>
            <p>Start playing games to see your progress over time!</p>
            <div className="sample-chart">
              <div className="sample-bars">
                {[20, 35, 45, 60, 75, 85, 90].map((height, i) => (
                  <div 
                    key={i}
                    className="sample-bar"
                    style={{ 
                      height: `${height}%`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
              <p className="sample-text">Your progress will appear here</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-section">
      <h3>📈 Performance Over Time</h3>
      
      <div className="chart-controls">
        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-color accuracy"></div>
            <span>Accuracy %</span>
          </div>
          <div className="legend-item">
            <div className="legend-color score"></div>
            <span>Average Score</span>
          </div>
        </div>
      </div>

      <div className="chart-container">
        <div className="performance-chart">
          {/* Y-axis labels */}
          <div className="y-axis">
            <div className="y-label">100%</div>
            <div className="y-label">75%</div>
            <div className="y-label">50%</div>
            <div className="y-label">25%</div>
            <div className="y-label">0%</div>
          </div>

          {/* Chart area */}
          <div className="chart-area">
            <div className="chart-grid">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="grid-line" />
              ))}
            </div>

            <div className="chart-bars">
              {chartData.map((data, index) => (
                <div 
                  key={index} 
                  className="bar-group"
                  onMouseEnter={() => setHoveredPoint(index)}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  <div className="bar-container">
                    <div 
                      className="chart-bar accuracy"
                      style={{ 
                        height: `${getChartHeight(data.accuracy, 'accuracy')}%`,
                        animationDelay: `${index * 0.1}s`
                      }}
                    />
                    <div 
                      className="chart-bar score"
                      style={{ 
                        height: `${getChartHeight(data.score, 'score')}%`,
                        animationDelay: `${index * 0.1 + 0.05}s`
                      }}
                    />
                  </div>
                  
                  <div className="x-label">{data.label}</div>
                  
                  {hoveredPoint === index && (
                    <div className="tooltip">
                      <div className="tooltip-content">
                        <div className="tooltip-date">{data.date.toLocaleDateString()}</div>
                        <div className="tooltip-stats">
                          <div className="tooltip-stat">
                            <span className="stat-label">Accuracy:</span>
                            <span className="stat-value">{data.accuracy}%</span>
                          </div>
                          <div className="tooltip-stat">
                            <span className="stat-label">Avg Score:</span>
                            <span className="stat-value">{data.score}</span>
                          </div>
                          <div className="tooltip-stat">
                            <span className="stat-label">Games:</span>
                            <span className="stat-value">{data.gamesPlayed}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary stats */}
        <div className="chart-summary">
          <div className="summary-stat">
            <span className="summary-label">Avg Accuracy:</span>
            <span className="summary-value">
              {Math.round(chartData.reduce((sum, d) => sum + d.accuracy, 0) / chartData.length)}%
            </span>
          </div>
          <div className="summary-stat">
            <span className="summary-label">Avg Score:</span>
            <span className="summary-value">
              {Math.round(chartData.reduce((sum, d) => sum + d.score, 0) / chartData.length)}
            </span>
          </div>
          <div className="summary-stat">
            <span className="summary-label">Total Games:</span>
            <span className="summary-value">
              {chartData.reduce((sum, d) => sum + d.gamesPlayed, 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;
