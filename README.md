# NeuroAid - Cognitive Training Platform

NeuroAid is a comprehensive cognitive training platform that combines engaging brain training games with AI-powered personalized feedback to help users improve their cognitive abilities.

## 🧠 Features

- **Interactive Brain Games**: Multiple cognitive training games targeting different mental skills
- **AI-Powered Feedback**: Personalized insights and recommendations using Grok LLM
- **Progress Tracking**: Detailed analytics and performance monitoring
- **Adaptive Difficulty**: Games adjust to user skill level
- **Journal Integration**: Reflection tools with AI-powered summaries

## 🎮 Available Games

- **Focus Flip**: Memory and attention training through card matching
- **Dot Dash**: Pattern recognition with morse code sequences
- **Number Sequence**: Working memory challenges
- **Color Match**: Processing speed training

## 🛠 Tech Stack

### Frontend
- React.js
- CSS3 with modern styling
- Responsive design

### Backend
- Node.js with Express
- MongoDB with Mongoose
- Grok AI integration

### AI Integration
- Grok LLM for personalized feedback
- Performance analysis and recommendations
- Journal summarization

## 📁 Project Structure

```
├── client/                       # React frontend
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── assets/              # Images, sounds, styles
│       ├── components/          # Reusable UI components
│       ├── games/               # Individual game components
│       ├── pages/               # Main views/pages
│       ├── services/            # API calls to backend
│       ├── utils/               # Helper functions
│       ├── App.js
│       └── index.js
│
├── server/                      # Node.js + Express backend
│   ├── config/                  # MongoDB connection, env config
│   ├── controllers/             # Request handlers
│   ├── routes/                  # API route definitions
│   ├── models/                  # Mongoose schemas
│   ├── llm/                     # Grok API integration
│   ├── middleware/              # Error handlers, auth
│   └── server.js               # Main Express server
│
├── .env                         # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Grok API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/neuroaid.git
   cd neuroaid
   ```

2. **Install dependencies**
   ```bash
   npm run install-deps
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```
   MONGODB_URI=mongodb://localhost:27017/neuroaid
   GROK_API_KEY=your_grok_api_key_here
   PORT=5000
   CLIENT_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**
   ```bash
   npm run dev
   ```

   This will start both the frontend (http://localhost:3000) and backend (http://localhost:5000).

### Individual Commands

- **Frontend only**: `npm run client`
- **Backend only**: `npm run server`
- **Build for production**: `npm run build`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `CLIENT_URL` | Frontend URL | `http://localhost:3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/neuroaid` |
| `GROK_API_KEY` | Grok API key for AI features | Required |
| `JWT_SECRET` | JWT secret for authentication | Optional |

## 📊 API Endpoints

### Games API
- `POST /api/games/score` - Save game score
- `GET /api/games/scores/:gameType` - Get scores for game type
- `GET /api/games/stats/:userId` - Get user statistics
- `GET /api/games/leaderboard/:gameType` - Get leaderboard

### LLM API
- `POST /api/llm/feedback` - Generate personalized feedback
- `POST /api/llm/recommendations` - Get recommendations
- `POST /api/llm/analyze-trends` - Analyze performance trends
- `POST /api/llm/journal-summary` - Summarize journal entries

## 🎯 Game Development

### Adding New Games

1. Create game component in `client/src/games/YourGame/`
2. Implement game logic in `logic.js`
3. Add styles in `YourGame.css`
4. Update game routes and navigation

### Game Structure
```javascript
// Example game component structure
const YourGame = () => {
  const [gameState, setGameState] = useState('idle');
  const [score, setScore] = useState(0);
  
  // Game logic here
  
  return (
    <div className="your-game">
      {/* Game UI */}
    </div>
  );
};
```

## 🤖 AI Integration

The platform uses Grok LLM for:
- **Personalized Feedback**: Analysis of game performance
- **Recommendations**: Tailored training suggestions
- **Progress Analysis**: Trend identification and insights
- **Journal Summaries**: Reflection and pattern recognition

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run specific test suites
npm run test:client
npm run test:server
```

## 📈 Performance Monitoring

- Game performance metrics
- User engagement analytics
- AI feedback effectiveness
- System performance monitoring

## 🔒 Security

- Input validation and sanitization
- Rate limiting on API endpoints
- Secure environment variable handling
- MongoDB injection prevention

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Setup
- Set `NODE_ENV=production`
- Configure production MongoDB URI
- Set up proper CORS origins
- Configure logging and monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Cognitive science research community
- Open source contributors
- Grok AI team for LLM capabilities

## 📞 Support

For support, email support@neuroaid.com or create an issue in the GitHub repository.

---

**NeuroAid** - Enhancing cognitive abilities through intelligent training 🧠✨
