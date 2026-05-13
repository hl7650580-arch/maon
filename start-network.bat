@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   מערכת מעון - גישה מרשת
echo ========================================
echo.
cd /d "%~dp0"

if not exist "node_modules" (
  echo מתקין חבילות...
  call npm install
  echo.
)

echo מחפש כתובת IP...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /R "IPv4"') do (
  set IP=%%a
  goto :found
)
:found
set IP=%IP: =%

echo.
echo =============================================
echo  המחשב האחר יכנס לכתובת:
echo  http://%IP%:3000
echo =============================================
echo.
echo לסגירה: לחץ Ctrl+C
echo.

set NODE_NO_WARNINGS=1
npx next dev --hostname 0.0.0.0 --port 3000
