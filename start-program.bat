REM Run the installer batch script to install dependencies and start the server
call install.bat

REM Additional commands if needed before starting the server

REM Start the server and display output in console
echo Starting the server...
start "" /B cmd /C "npm start"

REM Pause the script to keep the console window open
pause
@echo off
