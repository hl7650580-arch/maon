@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   מערכת מעון - מעקב דיירים
echo ========================================
echo.
cd /d "%~dp0"

if not exist "node_modules" (
  echo מתקין חבילות - רק בפעם הראשונה, אנא המתן...
  call npm install
  echo.
)

set NODE_NO_WARNINGS=1
echo מפעיל את המערכת...
echo.
echo פתח את הדפדפן בכתובת: http://localhost:3000
echo.
echo לסגירה: לחץ Ctrl+C
echo.
call npm run dev
