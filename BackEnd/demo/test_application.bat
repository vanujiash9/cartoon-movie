@echo off
REM Cartoon Movie System - Test Script
REM Date: June 2, 2025

echo =========================================
echo   Cartoon Movie System - Testing
echo =========================================
echo.

echo Setting up environment...
cd /d "C:\Users\Admin\Desktop\Cartoon-movie\BackEnd\demo"

echo.
echo Step 1: Clean and compile project...
call mvn clean compile -q

if errorlevel 1 (
    echo ERROR: Compilation failed!
    pause
    exit /b 1
)

echo.
echo Step 2: Package application...
call mvn package -DskipTests -q

if errorlevel 1 (
    echo ERROR: Packaging failed!
    pause
    exit /b 1
)

echo.
echo Step 3: Starting Spring Boot application...
echo Navigate to: http://localhost:8080/admin/episodes-overview
echo.

echo Key URLs to test:
echo - http://localhost:8080/admin/episodes-overview
echo - http://localhost:8080/admin/episodes
echo - http://localhost:8080/admin/movies
echo.

echo Starting application...
call mvn spring-boot:run

pause
