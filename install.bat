@echo off

REM Check if Node.js is already installed
node --version > nul 2>&1
if %errorlevel% equ 0 (
    echo Node.js is already installed
) else (
    echo Installing Node.js...
    REM Download the Node.js installer from the official website
    bitsadmin /transfer "NodeInstaller" https://nodejs.org/dist/v16.0.0/node-v16.0.0-x64.msi "%~dp0\node-v16.0.0-x64.msi"
    REM Install Node.js silently
    msiexec /i "%~dp0\node-v16.0.0-x64.msi" /qn
    REM Clean up the downloaded installer
    del "%~dp0\node-v16.0.0-x64.msi"
)

REM Check if project dependencies are already installed
if exist "node_modules" (
    echo Project dependencies are already installed
) else (
    echo Installing project dependencies...
    REM Install project dependencies using npm
    npm install
)

