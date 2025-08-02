// Game API Service

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class GameService {
  async saveGameScore(gameData) {
    try {
      const response = await fetch(`${API_BASE_URL}/games/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameData),
      });

      if (!response.ok) {
        throw new Error('Failed to save game score');
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving game score:', error);
      throw error;
    }
  }

  async getGameScores(gameType, limit = 10) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/games/scores/${gameType}?limit=${limit}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch game scores');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching game scores:', error);
      throw error;
    }
  }

  async getUserStats(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/games/stats/${userId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch user stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  async getLeaderboard(gameType, limit = 10) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/games/leaderboard/${gameType}?limit=${limit}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }
}

const gameService = new GameService();
export default gameService;
