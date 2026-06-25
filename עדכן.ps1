$upd  = "\\ezrasrv\Bait-Lachaim\שושי\תוכנה\עדכון"
$dest = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "מעדכן תוכנה..." -ForegroundColor Cyan

robocopy "$upd\app"        "$dest\app"        /E /XD node_modules .next /NFL /NDL /NJH /NJS | Out-Null
robocopy "$upd\lib"        "$dest\lib"        /E /NFL /NDL /NJH /NJS | Out-Null
robocopy "$upd\components" "$dest\components" /E /NFL /NDL /NJH /NJS | Out-Null

Copy-Item "$upd\package.json"       "$dest\package.json"       -Force
Copy-Item "$upd\next.config.mjs"    "$dest\next.config.mjs"    -Force
Copy-Item "$upd\tailwind.config.ts" "$dest\tailwind.config.ts" -Force
Copy-Item "$upd\tsconfig.json"      "$dest\tsconfig.json"      -Force
Copy-Item "$upd\start.bat"          "$dest\start.bat"          -Force

Write-Host "העדכון הושלם!" -ForegroundColor Green
Write-Host "סגרי את החלון השחור ופתחי שוב את start.bat" -ForegroundColor Yellow
