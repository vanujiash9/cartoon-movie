@echo off
echo ================================
echo   QUICK ACHIEVEMENT TEST
echo ================================

echo.
echo 1. Starting backend (in background)...
cd "%~dp0BackEnd\demo"
start /B cmd /c "mvnw.cmd spring-boot:run >nul 2>&1"

echo 2. Waiting 15 seconds for backend to start...
timeout /t 15 /nobreak >nul

echo 3. Opening test page...
start "" "%~dp0FrontEnd\test_achievements_simple.html"

echo.
echo ================================
echo   Test Instructions:
echo ================================
echo 1. Wait for the test page to open
echo 2. Login with: admin / admin123
echo 3. Check achievements load correctly
echo 4. Test share and watch features
echo 5. Check console for debug info
echo.
echo Backend is running in background.
echo Press Ctrl+C to stop this script.
echo Press any key to open main index.html too...
pause >nul

start "" "%~dp0FrontEnd\index.html"

echo.
echo Both pages opened. Check achievements in both!
echo Press any key to exit...
pause >nul
