# 🚀 NeuroAid Quick Start Guide

## 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install

# Go back to root
cd ..
```

## 2. Start MongoDB

**Windows:**
```bash
net start MongoDB
```

**macOS/Linux:**
```bash
# macOS with Homebrew
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

## 3. Run the Application

**Option 1: Use the batch file (Windows)**
```bash
start.bat
```

**Option 2: Manual start**
```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend  
cd client
npm start
```

## 4. Access the Application

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Health Check: http://localhost:5000/health

## 5. Test the Features

1. Click "Start Training" on home page
2. Try the games from the Games page
3. Check Settings for accessibility options

## Troubleshooting

- **MongoDB Error**: Make sure MongoDB is running
- **Port in use**: Kill processes on ports 3000/5000
- **Dependencies**: Run `npm install` in root, client, and server folders

The app will work even without Grok API - it uses fallback responses!
