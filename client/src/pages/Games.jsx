import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessibility } from '../contexts/AccessibilityContext';
import './Games.css';

const Games = () => {
  const navigate = useNavigate();
  const { speak, playSound } = useAccessibility();

  const games = [
    {
      id: 'focus-flip',
      title: 'Focus Flip',
      description: 'Test your memory and attention with card matching challenges',
      difficulty: 'Easy',
      category: 'Memory',
      icon: '🃏',
      path: '/games/focus-flip',
      skills: ['Working Memory', 'Visual Attention', 'Concentration']
    },
    {
      id: 'dot-dash',
      title: 'Dot Dash',
      description: 'Improve pattern recognition with morse code sequences',
      difficulty: 'Medium',
      category: 'Pattern Recognition',
      icon: '📡',
      path: '/games/dot-dash',
      skills: ['Sequential Memory', 'Pattern Recognition', 'Reaction Time']
    },
    {
      id: 'color-trap',
      title: 'Color Trap',
      description: 'Test impulse control with the Stroop effect challenge',
      difficulty: 'Medium',
      category: 'Impulse Control',
      icon: '🎨',
      path: '/games/color-trap',
      skills: ['Impulse Control', 'Visual Processing', 'Quick Thinking']
    },
    {
      id: 'sequence-sense',
      title: 'Sequence Sense',
      description: 'Challenge working memory with number sequences',
      difficulty: 'Hard',
      category: 'Working Memory',
      icon: '🔢',
      path: '/games/sequence-sense',
      skills: ['Pattern Recognition', 'Logical Thinking', 'Problem Solving']
    },
    {
      id: 'shape-sorter',
      title: 'Shape Sorter',
      description: 'Practice visual coordination with shape matching',
      difficulty: 'Easy',
      category: 'Visual Processing',
      icon: '🔷',
      path: '/games/shape-sorter',
      skills: ['Visual Processing', 'Hand-Eye Coordination', 'Pattern Matching']
    },
    {
      id: 'word-chain',
      title: 'Word Chain',
      description: 'Build vocabulary and verbal fluency with word associations',
      difficulty: 'Medium',
      category: 'Language',
      icon: '🔗',
      path: '/games/word-chain',
      skills: ['Verbal Fluency', 'Vocabulary', 'Creative Thinking']
    },
    {
      id: 'reaction-time',
      title: 'Lightning Reflex',
      description: 'Test and improve reaction time with quick challenges',
      difficulty: 'Easy',
      category: 'Speed',
      icon: '⚡',
      path: '/games/reaction-time',
      skills: ['Reaction Time', 'Processing Speed', 'Motor Control']
    },
    {
      id: 'math-master',
      title: 'Math Master',
      description: 'Sharpen numerical skills with mental math challenges',
      difficulty: 'Hard',
      category: 'Numerical',
      icon: '🧮',
      path: '/games/math-master',
      skills: ['Numerical Processing', 'Mental Math', 'Problem Solving']
    }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '#10b981';
      case 'Medium': return '#f59e0b';
      case 'Hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Memory': '#667eea',
      'Pattern Recognition': '#764ba2',
      'Impulse Control': '#f093fb',
      'Working Memory': '#4facfe',
      'Visual Processing': '#43e97b',
      'Language': '#fa709a',
      'Speed': '#ffecd2',
      'Numerical': '#a8edea'
    };
    return colors[category] || '#6b7280';
  };

  const handlePlayGame = (game) => {
    playSound('click');
    speak(`Starting ${game.title}`);
    navigate(game.path);
  };

  return (
    <div className="games">
      <div className="games-header">
        <h1>🎮 Brain Training Games</h1>
        <p>Choose from {games.length} different games to train various cognitive skills</p>
        <div className="games-stats">
          <div className="stat-badge">
            <span className="stat-number">{games.length}</span>
            <span className="stat-label">Games Available</span>
          </div>
          <div className="stat-badge">
            <span className="stat-number">5</span>
            <span className="stat-label">Skill Categories</span>
          </div>
        </div>
      </div>
      
      <div className="games-grid">
        {games.map(game => (
          <div key={game.id} className="game-card">
            <div className="game-card-header">
              <div className="game-icon">{game.icon}</div>
              <div className="game-badges">
                <span 
                  className="difficulty-badge"
                  style={{ backgroundColor: getDifficultyColor(game.difficulty) }}
                >
                  {game.difficulty}
                </span>
              </div>
            </div>
            
            <div className="game-info">
              <h3>{game.title}</h3>
              <p className="game-description">{game.description}</p>
              
              <div className="game-category">
                <span 
                  className="category-badge"
                  style={{ backgroundColor: getCategoryColor(game.category) }}
                >
                  {game.category}
                </span>
              </div>
            </div>
            
            <button 
              className="play-button"
              onClick={() => handlePlayGame(game)}
              aria-label={`Play ${game.title} game`}
            >
              <span className="play-icon">▶️</span>
              Play Now
            </button>
          </div>
        ))}
      </div>

      <div className="games-footer">
        <div className="training-tips">
          <h3>💡 Training Tips</h3>
          <ul>
            <li><strong>Start Easy:</strong> Begin with games marked as "Easy" to build confidence</li>
            <li><strong>Mix Categories:</strong> Try different skill categories to train various cognitive abilities</li>
            <li><strong>Daily Practice:</strong> Play for 10-15 minutes daily for optimal results</li>
            <li><strong>Track Progress:</strong> Monitor your improvements on the progress page</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Games;
