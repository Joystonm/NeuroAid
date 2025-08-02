import React, { useState } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useGame } from '../contexts/GameContext';
import './Settings.css';

const Settings = () => {
  const { settings, updateSetting, resetSettings, speak, playSound } = useAccessibility();
  const { currentUser, setCurrentUser } = useGame();
  const [activeTab, setActiveTab] = useState('accessibility');

  const handleSettingChange = (key, value) => {
    updateSetting(key, value);
    playSound('click');
    
    // Provide audio feedback for important settings
    if (key === 'speechEnabled') {
      if (value) {
        setTimeout(() => speak('Text to speech is now enabled'), 100);
      }
    } else if (key === 'soundEnabled') {
      if (value) {
        setTimeout(() => playSound('success'), 100);
      }
    }
  };

  const handleUserUpdate = (field, value) => {
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        [field]: value
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('neuroaid-user', JSON.stringify(updatedUser));
      speak(`${field} updated`);
    }
  };

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      resetSettings();
      speak('Settings reset to default');
      playSound('notification');
    }
  };

  const tabs = [
    { id: 'accessibility', name: 'Accessibility', icon: '♿' },
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'games', name: 'Games', icon: '🎮' },
    { id: 'about', name: 'About', icon: 'ℹ️' }
  ];

  return (
    <div className="settings">
      <div className="settings-header">
        <h1>⚙️ Settings</h1>
        <p>Customize your NeuroAid experience</p>
      </div>

      {/* Tab Navigation */}
      <div className="settings-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab.id);
              speak(`${tab.name} settings`);
              playSound('click');
            }}
            aria-label={`${tab.name} settings tab`}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-name">{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="settings-content">
        {activeTab === 'accessibility' && (
          <div className="settings-section">
            <h2>♿ Accessibility Settings</h2>
            <p>Customize the interface to meet your needs</p>

            <div className="settings-grid">
              {/* Visual Settings */}
              <div className="setting-group">
                <h3>👁️ Visual</h3>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <label htmlFor="high-contrast">High Contrast Mode</label>
                    <p>Increases contrast for better visibility</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      id="high-contrast"
                      type="checkbox"
                      checked={settings.highContrast}
                      onChange={(e) => handleSettingChange('highContrast', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <label htmlFor="large-text">Large Text</label>
                    <p>Increases text size throughout the app</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      id="large-text"
                      type="checkbox"
                      checked={settings.largeText}
                      onChange={(e) => handleSettingChange('largeText', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <label htmlFor="reduced-motion">Reduce Motion</label>
                    <p>Minimizes animations and transitions</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      id="reduced-motion"
                      type="checkbox"
                      checked={settings.reducedMotion}
                      onChange={(e) => handleSettingChange('reducedMotion', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <label htmlFor="color-blind-friendly">Color Blind Friendly</label>
                    <p>Adjusts colors for better accessibility</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      id="color-blind-friendly"
                      type="checkbox"
                      checked={settings.colorBlindFriendly}
                      onChange={(e) => handleSettingChange('colorBlindFriendly', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              {/* Audio Settings */}
              <div className="setting-group">
                <h3>🔊 Audio</h3>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <label htmlFor="sound-enabled">Sound Effects</label>
                    <p>Play sounds for game feedback</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      id="sound-enabled"
                      type="checkbox"
                      checked={settings.soundEnabled}
                      onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <label htmlFor="speech-enabled">Text-to-Speech</label>
                    <p>Read instructions and feedback aloud</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      id="speech-enabled"
                      type="checkbox"
                      checked={settings.speechEnabled}
                      onChange={(e) => handleSettingChange('speechEnabled', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <label htmlFor="auto-read">Auto-Read Instructions</label>
                    <p>Automatically read game instructions</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      id="auto-read"
                      type="checkbox"
                      checked={settings.autoRead}
                      onChange={(e) => handleSettingChange('autoRead', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              {/* Interaction Settings */}
              <div className="setting-group">
                <h3>🖱️ Interaction</h3>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <label htmlFor="focus-indicators">Enhanced Focus Indicators</label>
                    <p>Show clear focus outlines for navigation</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      id="focus-indicators"
                      type="checkbox"
                      checked={settings.focusIndicators}
                      onChange={(e) => handleSettingChange('focusIndicators', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <div className="settings-actions">
              <button 
                className="btn-accessible btn-secondary"
                onClick={handleResetSettings}
                aria-label="Reset all accessibility settings to default"
              >
                Reset to Default
              </button>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="settings-section">
            <h2>👤 Profile Settings</h2>
            <p>Manage your personal information</p>

            <div className="profile-form">
              <div className="form-group">
                <label htmlFor="user-name">Display Name</label>
                <input
                  id="user-name"
                  type="text"
                  value={currentUser?.name || ''}
                  onChange={(e) => handleUserUpdate('name', e.target.value)}
                  placeholder="Enter your name"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="user-age">Age Range</label>
                <select
                  id="user-age"
                  value={currentUser?.ageRange || ''}
                  onChange={(e) => handleUserUpdate('ageRange', e.target.value)}
                  className="form-select"
                >
                  <option value="">Select age range</option>
                  <option value="5-8">5-8 years</option>
                  <option value="9-12">9-12 years</option>
                  <option value="13-16">13-16 years</option>
                  <option value="17+">17+ years</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="learning-goals">Learning Goals</label>
                <textarea
                  id="learning-goals"
                  value={currentUser?.goals || ''}
                  onChange={(e) => handleUserUpdate('goals', e.target.value)}
                  placeholder="What would you like to improve? (e.g., focus, memory, reaction time)"
                  className="form-textarea"
                  rows="3"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'games' && (
          <div className="settings-section">
            <h2>🎮 Game Settings</h2>
            <p>Customize your gaming experience</p>

            <div className="settings-grid">
              <div className="setting-group">
                <h3>🎯 Difficulty</h3>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <label htmlFor="default-difficulty">Default Difficulty</label>
                    <p>Starting difficulty for new games</p>
                  </div>
                  <select
                    id="default-difficulty"
                    value={currentUser?.preferences?.difficulty || 'medium'}
                    onChange={(e) => handleUserUpdate('preferences', {
                      ...currentUser?.preferences,
                      difficulty: e.target.value
                    })}
                    className="form-select"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="adaptive">Adaptive</option>
                  </select>
                </div>
              </div>

              <div className="setting-group">
                <h3>📊 Progress</h3>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Game Statistics</label>
                    <p>Your overall gaming progress</p>
                  </div>
                  <div className="stats-summary">
                    <div className="stat-item">
                      <span className="stat-value">0</span>
                      <span className="stat-label">Games Played</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">0</span>
                      <span className="stat-label">Total Score</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="settings-section">
            <h2>ℹ️ About NeuroAid</h2>
            <p>Information about this cognitive training platform</p>

            <div className="about-content">
              <div className="about-card">
                <h3>🧠 Our Mission</h3>
                <p>
                  NeuroAid is designed to help neurodivergent youth improve their cognitive abilities 
                  through engaging, accessible brain training games. We believe every child deserves 
                  tools that support their unique learning journey.
                </p>
              </div>

              <div className="about-card">
                <h3>🎯 Key Features</h3>
                <ul>
                  <li>Five specialized cognitive training games</li>
                  <li>AI-powered personalized feedback</li>
                  <li>Comprehensive accessibility features</li>
                  <li>Progress tracking and insights</li>
                  <li>Neurodivergent-friendly design</li>
                </ul>
              </div>

              <div className="about-card">
                <h3>🔬 Research-Based</h3>
                <p>
                  Our games are based on cognitive science research and designed specifically 
                  for children with ADHD, autism, and learning challenges. Each activity targets 
                  specific cognitive skills while maintaining engagement and reducing overwhelm.
                </p>
              </div>

              <div className="about-card">
                <h3>🤖 AI Integration</h3>
                <p>
                  NeuroAid uses Grok AI to provide personalized feedback, analyze performance trends, 
                  and offer tailored recommendations to support each user's cognitive development journey.
                </p>
              </div>

              <div className="about-card">
                <h3>📞 Support</h3>
                <p>
                  Need help or have feedback? We're here to support you on your cognitive training journey.
                </p>
                <div className="support-links">
                  <button className="btn-accessible btn-secondary">
                    📧 Contact Support
                  </button>
                  <button className="btn-accessible btn-secondary">
                    📚 User Guide
                  </button>
                </div>
              </div>

              <div className="version-info">
                <p><strong>Version:</strong> 1.0.0</p>
                <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
