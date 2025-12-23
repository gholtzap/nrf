@echo off
setlocal enabledelayedexpansion

echo =========================================
echo   NRF Project Setup Script
echo =========================================
echo.

REM Check if Node.js is installed
echo Checking for Node.js...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js v18 or higher.
    echo Download from: https://nodejs.org/
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js found: %NODE_VERSION%

REM Check if npm is installed
echo Checking for npm...
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed. Please install npm.
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [OK] npm found: %NPM_VERSION%

echo.
echo =========================================
echo   Step 1: Installing Dependencies
echo =========================================
echo.

echo Running npm install...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)
echo [OK] Dependencies installed successfully

echo.
echo =========================================
echo   Step 2: Creating Configuration File
echo =========================================
echo.

REM Check if config.yaml already exists
if exist config.yaml (
    echo config.yaml already exists.
    set /p OVERWRITE="Do you want to overwrite it? (y/N): "
    if /i "!OVERWRITE!"=="y" (
        copy /y config.example.yaml config.yaml >nul
        echo [OK] config.yaml overwritten from example
    ) else (
        echo [INFO] Keeping existing config.yaml
    )
) else (
    copy config.example.yaml config.yaml >nul
    echo [OK] Created config.yaml from example
)

echo.
set /p CONFIGURE_MONGO="Would you like to configure MongoDB now? (y/N): "
if /i "!CONFIGURE_MONGO!"=="y" (
    echo.
    echo Please enter your MongoDB connection details:
    set /p MONGODB_URI="MongoDB URI (e.g., mongodb+srv://user:pass@cluster.mongodb.net/): "
    set /p MONGODB_DB="Database name (default: nrf): "
    if "!MONGODB_DB!"=="" set MONGODB_DB=nrf

    REM Update config.yaml with MongoDB settings
    powershell -Command "(Get-Content config.yaml) -replace 'type: memory', 'type: mongodb' | Set-Content config.yaml"
    powershell -Command "(Get-Content config.yaml) -replace 'uri: .*', 'uri: !MONGODB_URI!' | Set-Content config.yaml"
    powershell -Command "(Get-Content config.yaml) -replace 'name: .*', 'name: !MONGODB_DB!' | Set-Content config.yaml"
    echo [OK] MongoDB configuration updated
) else (
    echo [INFO] Skipping MongoDB configuration. Using in-memory database.
    echo [INFO] You can configure MongoDB later by editing config.yaml
)

echo.
echo =========================================
echo   Step 3: Building TypeScript Project
echo =========================================
echo.

echo Running npm run build...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to build TypeScript project
    exit /b 1
)
echo [OK] TypeScript compiled successfully

echo.
echo =========================================
echo   Setup Complete!
echo =========================================
echo.
echo [OK] NRF project is ready to use
echo.
echo Next steps:
echo   - Development mode: npm run dev
echo   - Production mode:  npm start
echo   - View setup docs:  type SETUP.md
echo.
echo [INFO] Server will run on http://127.0.0.1:8080 by default
echo [INFO] Edit config.yaml to customize settings
echo.

pause
