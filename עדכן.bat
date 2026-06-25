@echo off
chcp 65001 >nul
set UPD=\\ezrasrv\Bait-Lachaim\שושי\תוכנה\עדכון
set DEST=%~dp0

echo מעדכן תוכנה...

robocopy "%UPD%\app"        "%DEST%app"        /E /XD node_modules .next
robocopy "%UPD%\lib"        "%DEST%lib"        /E
robocopy "%UPD%\components" "%DEST%components" /E
copy /Y "%UPD%\package.json"       "%DEST%package.json"
copy /Y "%UPD%\next.config.mjs"    "%DEST%next.config.mjs"
copy /Y "%UPD%\tailwind.config.ts" "%DEST%tailwind.config.ts"
copy /Y "%UPD%\tsconfig.json"      "%DEST%tsconfig.json"
copy /Y "%UPD%\start.bat"          "%DEST%start.bat"

echo.
echo העדכון הושלם!
echo סגרי את חלון התוכנה השחור ופתחי שוב את start.bat
pause
