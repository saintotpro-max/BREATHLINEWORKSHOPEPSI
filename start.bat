@echo off
echo ========================================
echo LANCEMENT BREATHE LINE
echo ========================================
echo.
echo Verification Node.js...
node --version
echo.
echo Verification npm...
npm --version
echo.
echo Demarrage du serveur Next.js...
echo.
npm run dev
pause
