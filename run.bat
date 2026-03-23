@echo off
TITLE Jayanth Portfolio Server
echo ===================================================
echo   Starting local web server for your Portfolio...
echo ===================================================
echo.
echo Opening your default web browser to http://localhost:8000 ...
start http://localhost:8000
echo.
echo The server is now running! 
echo Keep this window open while you view your portfolio.
echo Press Ctrl+C in this window to stop the server when you are done.
echo.
python -m http.server 8000
pause
