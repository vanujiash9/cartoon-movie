@echo off
echo ================================
echo   Test Achievements Integration
echo ================================
echo.

echo 1. Starting backend server...
cd /d "c:\Users\Admin\Desktop\Cartoon-movie\BackEnd\demo"
start "Backend Server" cmd /k "mvn spring-boot:run"

echo.
echo 2. Waiting for backend to start...
timeout /t 10 /nobreak >nul

echo.
echo 3. Opening test page in browser...
start "Test Page" "http://localhost:8080/"

echo.
echo ================================
echo   Test Instructions:
echo ================================
echo.
echo A. Test WITHOUT login:
echo    1. Scroll to "Thanh tuu cua ban" section
echo    2. Should see login prompt
echo    3. Click "Dang nhap ngay" button
echo.
echo B. Test WITH login:
echo    1. Login with test account
echo    2. Go back to homepage
echo    3. Scroll to achievements section
echo    4. Should see progress overview + cards
echo    5. Click "Thu chia se phim" to test
echo.
echo C. Test Navigation:
echo    1. Click "Thanh tuu" in navbar
echo    2. Should smooth scroll to section
echo.
echo ================================
echo Press any key to close...
pause >nul
