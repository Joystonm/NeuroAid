import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Your Dashboard</h1>
        <p>Track your cognitive training progress</p>
      </div>
      
      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Games Played</h3>
            <div className="stat-value">0</div>
          </div>
          <div className="stat-card">
            <h3>Total Score</h3>
            <div className="stat-value">0</div>
          </div>
          <div className="stat-card">
            <h3>Average Performance</h3>
            <div className="stat-value">--</div>
          </div>
          <div className="stat-card">
            <h3>Streak</h3>
            <div className="stat-value">0 days</div>
          </div>
        </div>

        <div className="dashboard-sections">
          <section className="recent-activity">
            <h2>Recent Activity</h2>
            <div className="activity-list">
              <p>No recent activity. Start playing games to see your progress!</p>
            </div>
          </section>

          <section className="progress-chart">
            <h2>Progress Over Time</h2>
            <div className="chart-placeholder">
              <p>Progress chart will appear here</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
