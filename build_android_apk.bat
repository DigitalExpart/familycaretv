@echo off
title Build FamilyCare Android APK (EAS)
cd /d "%~dp0apps\mobile"
echo =======================================================
echo   FamilyCare Mobile - Build Standalone Android (.apk)
echo =======================================================
echo.
echo Step 1: Logging in to your Expo account...
echo If a browser window opens, click "Log In" or "Authorize" to connect.
echo.
call npx eas login
echo.
echo =======================================================
echo Step 2: Starting EAS Cloud Build for Android APK...
echo =======================================================
echo.
call npx eas build -p android --profile preview
echo.
echo =======================================================
echo Build process initiated! 
echo Check the link above to monitor progress and download the .apk.
echo =======================================================
pause
