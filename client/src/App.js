import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { GameProvider } from './contexts/GameContext';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Games from './pages/Games';
import Progress from './pages/Progress';
import Settings from './pages/Settings';
import FocusFlip from './games/FocusFlip/FocusFlip';
import DotDash from './games/DotDash/DotDash';
import ColorTrap from './games/ColorTrap/ColorTrap';
import SequenceSense from './games/SequenceSense/SequenceSense';
import ShapeSorter from './games/ShapeSorter/ShapeSorter';
import WordChain from './games/WordChain/WordChain';
import ReactionTime from './games/ReactionTime/ReactionTime';
import MathMaster from './games/MathMaster/MathMaster';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <h2>Loading NeuroAid...</h2>
        <p>Preparing your cognitive training experience</p>
      </div>
    );
  }

  return (
    <AccessibilityProvider>
      <GameProvider>
        <Router>
          <div className="App">
            <Navigation />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/games" element={<Games />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/games/focus-flip" element={<FocusFlip />} />
                <Route path="/games/dot-dash" element={<DotDash />} />
                <Route path="/games/color-trap" element={<ColorTrap />} />
                <Route path="/games/sequence-sense" element={<SequenceSense />} />
                <Route path="/games/shape-sorter" element={<ShapeSorter />} />
                <Route path="/games/word-chain" element={<WordChain />} />
                <Route path="/games/reaction-time" element={<ReactionTime />} />
                <Route path="/games/math-master" element={<MathMaster />} />
              </Routes>
            </main>
          </div>
        </Router>
      </GameProvider>
    </AccessibilityProvider>
  );
}

export default App;
