@echo off
echo Starting NeuroAid Application...
echo.

echo Starting MongoDB...
net start MongoDB

echo.
echo Starting Backend Server...
start "NeuroAid Backend" cmd /k "cd server && npm start"

echo.
echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo Starting Frontend...
start "NeuroAid Frontend" cmd /k "cd client && npm start"

echo.
echo NeuroAid is starting up!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause
