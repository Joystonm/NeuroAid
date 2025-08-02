import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAccessibility } from '../contexts/AccessibilityContext';
import './Navigation.css';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { speak, playSound } = useAccessibility();

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠', description: 'Go to home page' },
    { path: '/games', label: 'Games', icon: '🎮', description: 'Play brain training games' },
    { path: '/progress', label: 'Progress', icon: '📈', description: 'Track your improvement' },
    { path: '/settings', label: 'Settings', icon: '⚙️', description: 'Adjust your preferences' }
  ];

  const handleNavClick = (item) => {
    playSound('click');
    speak(`Navigating to ${item.label}`);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    playSound('click');
    speak(isMenuOpen ? 'Menu closed' : 'Menu opened');
  };

  return (
    <nav className="navigation" role="navigation" aria-label="Main navigation">
      <div className="nav-container">
        {/* Logo */}
        <Link 
          to="/" 
          className="nav-logo"
          onClick={() => handleNavClick({ label: 'Home' })}
          aria-label="NeuroAid - Go to home page"
        >
          <span className="logo-icon">🧠</span>
          <span className="logo-text">NeuroAid</span>
        </Link>

        {/* Desktop Navigation */}
        <ul className="nav-menu desktop-menu" role="menubar">
          {navItems.map((item) => (
            <li key={item.path} role="none">
              <Link
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => handleNavClick(item)}
                role="menuitem"
                aria-label={item.description}
                aria-current={location.pathname === item.path ? 'page' : undefined}
              >
                <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-button"
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        {/* Mobile Navigation */}
        <div 
          id="mobile-menu"
          className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}
          role="menu"
          aria-hidden={!isMenuOpen}
        >
          <ul className="mobile-nav-list">
            {navItems.map((item) => (
              <li key={item.path} role="none">
                <Link
                  to={item.path}
                  className={`mobile-nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => handleNavClick(item)}
                  role="menuitem"
                  aria-label={item.description}
                  tabIndex={isMenuOpen ? 0 : -1}
                >
                  <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div 
            className="mobile-menu-overlay"
            onClick={toggleMenu}
            aria-hidden="true"
          ></div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
