# NeuroAid - Cognitive Training Platform

NeuroAid is a comprehensive cognitive training platform that combines engaging brain training games with AI-powered personalized feedback to help users improve their cognitive abilities.

## 🧠 Features

- **Interactive Brain Games**: Multiple cognitive training games targeting different mental skills
- **Progress Tracking**: Detailed analytics and performance monitoring
- **Adaptive Difficulty**: Games adjust to user skill level

## 🛠 Tech Stack

### Frontend
- React.js
- CSS3 with modern styling
- Responsive design

### Backend
- Node.js with Express
- MongoDB with Mongoose


## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Joystonm/neuroaid.git
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
