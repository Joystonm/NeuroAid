import React, { createContext, useContext, useState, useEffect } from 'react';
import gameService from '../services/gameService';
import llmService from '../services/llmService';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Initialize user session
  useEffect(() => {
    const initializeUser = () => {
      let user = localStorage.getItem('neuroaid-user');
      if (!user) {
        // Create anonymous user
        user = {
          id: `user_${Date.now()}`,
          name: 'Young Learner',
          createdAt: new Date().toISOString(),
          preferences: {
            difficulty: 'medium',
            favoriteGames: [],
            goals: []
          }
        };
        localStorage.setItem('neuroaid-user', JSON.stringify(user));
      } else {
        user = JSON.parse(user);
      }
      setCurrentUser(user);
      loadGameHistory(user.id);
    };

    initializeUser();
  }, []);

  const loadGameHistory = async (userId) => {
    try {
      setIsLoading(true);
      const history = localStorage.getItem(`neuroaid-history-${userId}`);
      if (history) {
        setGameHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Error loading game history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startGameSession = (gameType) => {
    const session = {
      id: `session_${Date.now()}`,
      gameType,
      startTime: new Date(),
      userId: currentUser?.id,
      scores: [],
      attempts: 0,
      completed: false
    };
    
    setCurrentSession(session);
    return session;
  };

  const recordGameScore = async (scoreData) => {
    if (!currentSession) return;

    try {
      setIsLoading(true);
      
      const gameResult = {
        ...scoreData,
        sessionId: currentSession.id,
        userId: currentUser.id,
        timestamp: new Date().toISOString(),
        gameType: currentSession.gameType
      };

      // Update current session
      const updatedSession = {
        ...currentSession,
        scores: [...currentSession.scores, gameResult],
        attempts: currentSession.attempts + 1,
        lastScore: scoreData.score,
        completed: true,
        endTime: new Date()
      };
      
      setCurrentSession(updatedSession);

      // Add to game history
      const newHistory = [...gameHistory, gameResult];
      setGameHistory(newHistory);
      
      // Save to localStorage
      localStorage.setItem(
        `neuroaid-history-${currentUser.id}`, 
        JSON.stringify(newHistory)
      );

      // Try to save to backend (optional)
      try {
        await gameService.saveGameScore(gameResult);
      } catch (error) {
        console.log('Backend save failed, using local storage only');
      }

      // Generate AI feedback
      await generateFeedback(gameResult, newHistory);

      return gameResult;
    } catch (error) {
      console.error('Error recording game score:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const generateFeedback = async (currentGame, history) => {
    try {
      const recentGames = history
        .filter(game => game.gameType === currentGame.gameType)
        .slice(-5); // Last 5 games of same type

      const sessionData = {
        gameType: currentGame.gameType,
        score: currentGame.score,
        accuracy: currentGame.accuracy,
        timeSpent: currentGame.timeSpent,
        level: currentGame.level || 1,
        difficulty: currentGame.difficulty || 'medium',
        previousScores: recentGames.map(game => ({
          score: game.score,
          accuracy: game.accuracy,
          timestamp: game.timestamp
        })),
        userProfile: {
          age: 'child', // Assuming child user
          preferences: currentUser.preferences
        }
      };

      try {
        const response = await llmService.generateFeedback(sessionData);
        setFeedback({
          text: response.data.feedback,
          gameType: currentGame.gameType,
          timestamp: new Date().toISOString(),
          positive: true // Assume positive feedback for children
        });
      } catch (error) {
        // Fallback to encouraging local feedback
        setFeedback({
          text: generateLocalFeedback(currentGame, recentGames),
          gameType: currentGame.gameType,
          timestamp: new Date().toISOString(),
          positive: true
        });
      }
    } catch (error) {
      console.error('Error generating feedback:', error);
    }
  };

  const generateLocalFeedback = (currentGame, recentGames) => {
    const { score, accuracy, gameType } = currentGame;
    const accuracyPercent = Math.round(accuracy * 100);
    
    const encouragingMessages = [
      `Great job! You scored ${score} points with ${accuracyPercent}% accuracy!`,
      `Wonderful work on ${gameType}! Your focus is getting stronger!`,
      `Amazing effort! You're building important brain skills!`,
      `Fantastic! Keep practicing and you'll see even more improvement!`,
      `Super work! Your concentration is improving with each game!`
    ];

    let message = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];

    // Add improvement message if applicable
    if (recentGames.length > 0) {
      const lastScore = recentGames[recentGames.length - 1].score;
      if (score > lastScore) {
        message += ` You improved from your last score of ${lastScore}!`;
      }
    }

    // Add specific skill feedback based on game type
    const skillMessages = {
      'focus-flip': 'Your memory skills are developing nicely!',
      'dot-dash': 'Your reaction time is getting faster!',
      'color-trap': 'Great impulse control practice!',
      'sequence-sense': 'Excellent pattern recognition!',
      'shape-sorter': 'Your visual coordination is improving!'
    };

    if (skillMessages[gameType]) {
      message += ` ${skillMessages[gameType]}`;
    }

    return message;
  };

  const getGameStats = (gameType) => {
    const gameScores = gameHistory.filter(game => game.gameType === gameType);
    
    if (gameScores.length === 0) {
      return {
        gamesPlayed: 0,
        bestScore: 0,
        averageScore: 0,
        averageAccuracy: 0,
        improvement: 0
      };
    }

    const scores = gameScores.map(game => game.score);
    const accuracies = gameScores.map(game => game.accuracy);
    
    const bestScore = Math.max(...scores);
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const averageAccuracy = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
    
    // Calculate improvement (last 3 vs first 3 games)
    let improvement = 0;
    if (gameScores.length >= 6) {
      const firstThree = scores.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
      const lastThree = scores.slice(-3).reduce((a, b) => a + b, 0) / 3;
      improvement = ((lastThree - firstThree) / firstThree) * 100;
    }

    return {
      gamesPlayed: gameScores.length,
      bestScore: Math.round(bestScore),
      averageScore: Math.round(averageScore),
      averageAccuracy: Math.round(averageAccuracy * 100),
      improvement: Math.round(improvement)
    };
  };

  const getAllStats = () => {
    const totalGames = gameHistory.length;
    const gameTypes = ['focus-flip', 'dot-dash', 'color-trap', 'sequence-sense', 'shape-sorter'];
    
    const statsByGame = {};
    gameTypes.forEach(gameType => {
      statsByGame[gameType] = getGameStats(gameType);
    });

    const totalScore = gameHistory.reduce((sum, game) => sum + game.score, 0);
    const averageAccuracy = gameHistory.length > 0 
      ? gameHistory.reduce((sum, game) => sum + game.accuracy, 0) / gameHistory.length
      : 0;

    return {
      totalGames,
      totalScore,
      averageAccuracy: Math.round(averageAccuracy * 100),
      statsByGame,
      recentGames: gameHistory.slice(-10).reverse()
    };
  };

  const clearFeedback = () => {
    setFeedback(null);
  };

  const endSession = () => {
    setCurrentSession(null);
  };

  const value = {
    currentUser,
    gameHistory,
    currentSession,
    isLoading,
    feedback,
    startGameSession,
    recordGameScore,
    getGameStats,
    getAllStats,
    clearFeedback,
    endSession,
    setCurrentUser
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
