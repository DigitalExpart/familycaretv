@echo off
title FamilyCare Mobile App (Expo)
cd /d "%~dp0apps\mobile"
echo ===================================================
echo   FamilyCare Mobile App - Expo Development Server
echo ===================================================
echo.
echo Backend API Endpoint:
echo https://carefree-endurance-production-7621.up.railway.app
echo.
echo Starting Expo... Scan the QR code below using Expo Go on iOS/Android:
echo.
call npx expo start
pause
