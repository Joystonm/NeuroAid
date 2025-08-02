import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessibility } from '../contexts/AccessibilityContext';
import Header from '../components/Header';
import Button from '../components/Button';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { speak, playSound } = useAccessibility();

  const handleStartTraining = () => {
    playSound('click');
    speak('Navigating to games');
    navigate('/games');
  };

  const handleLearnMore = () => {
    playSound('click');
    speak('Navigating to progress tracking');
    navigate('/progress');
  };

  return (
    <div className="home">
      <Header 
        title="NeuroAid" 
        subtitle="Enhance your cognitive abilities through engaging brain training games"
      />
      
      <main className="home-content">
        <section className="hero-section">
          <div className="hero-text">
            <h2>Train Your Brain, Improve Your Life</h2>
            <p>
              NeuroAid offers scientifically-designed cognitive training games 
              that help improve memory, attention, and mental agility.
            </p>
            <div className="cta-buttons">
              <Button 
                variant="primary" 
                onClick={handleStartTraining}
                aria-label="Start brain training games"
              >
                Start Training
              </Button>
              <Button 
                variant="secondary" 
                onClick={handleLearnMore}
                aria-label="View your progress and achievements"
              >
                View Progress
              </Button>
            </div>
          </div>
        </section>

        <section className="features-section">
          <h3>Why Choose NeuroAid?</h3>
          <div className="features-grid">
            <div className="feature-card">
              <h4>🧠 Science-Based</h4>
              <p>Games designed based on cognitive research and neuroscience principles</p>
            </div>
            <div className="feature-card">
              <h4>📊 Track Progress</h4>
              <p>Monitor your improvement with detailed analytics and progress reports</p>
            </div>
            <div className="feature-card">
              <h4>🎯 Personalized</h4>
              <p>Adaptive difficulty that adjusts to your skill level and learning pace</p>
            </div>
            <div className="feature-card">
              <h4>🤖 AI Insights</h4>
              <p>Get personalized feedback and recommendations powered by AI</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
