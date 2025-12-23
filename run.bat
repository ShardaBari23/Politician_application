@echo off
cd Server
echo Installing dependencies...
call npm install
echo Starting server...
call npm start
pause
