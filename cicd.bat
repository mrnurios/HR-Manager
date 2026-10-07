@echo off
SETLOCAL Enabledelayedexpansion

:: ==========================================
:: CONFIGURATION
:: ==========================================
SET "LOG_FILE=.\cicd_pipeline.log"
SET "BACKEND_DIR=.\backend"
SET "FRONTEND_DIR=.\frontend"

:: PM2 App Name or Ecosystem Config File (e.g., "my-api" or "ecosystem.config.js")
SET "PM2_APP_NAME=new-hrmo-portal"

echo ============================================ >> %LOG_FILE%
echo FULLSTACK CI/CD PIPELINE WITH PM2 STARTED AT %DATE% %TIME% >> %LOG_FILE%
echo ============================================ >> %LOG_FILE%

echo Starting Local Fullstack CI/CD Pipeline...

:: ==========================================
:: STAGE 1: FETCH LATEST CODE
:: ==========================================
echo [1/4] Fetching latest changes from Git...
git fetch origin >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    SET "FAILED_STAGE=Git Fetch"
    goto :PIPELINE_FAILED
)

git switch prod >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    SET "FAILED_STAGE=Git Switch"
    goto :PIPELINE_FAILED
)

git pull origin prod >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    SET "FAILED_STAGE=Git Pull"
    goto :PIPELINE_FAILED
)

:: ==========================================
:: STAGE 2: BACKEND DEPENDENCIES
:: ==========================================
echo [2/4] Processing BACKEND...
cd "%BACKEND_DIR%"

call npm install >> ..\%LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (SET "FAILED_STAGE=Backend Install" & goto :PIPELINE_FAILED)

:: If your backend uses TypeScript/Build step, uncomment the next two lines:
:: call npm run build >> ..\%LOG_FILE% 2>&1
:: if %ERRORLEVEL% NEQ 0 (SET "FAILED_STAGE=Backend Build" & goto :PIPELINE_FAILED)

cd ..


:: ==========================================
:: STAGE 3: FRONTEND BUILD (Direct to dist)
:: ==========================================
echo [3/4] Processing FRONTEND (Building directly into dist)...
cd "%FRONTEND_DIR%"

call npm install >> ..\%LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (SET "FAILED_STAGE=Frontend Install" & goto :PIPELINE_FAILED)

call npm run build >> ..\%LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (SET "FAILED_STAGE=Frontend Build" & goto :PIPELINE_FAILED)

cd ..


:: ==========================================
:: STAGE 4: PM2 RELOAD / RESTART
:: ==========================================
echo [4/4] Restarting backend process with PM2...

:: Option A: If your PM2 process is already running, 'reload' achieves zero-downtime
call pm2 reload %PM2_APP_NAME% >> %LOG_FILE% 2>&1

:: Option B: If reload fails (e.g. process wasn't active), fall back to standard start/restart
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️ PM2 reload failed or process not found. Attempting standard restart/start...
    call pm2 restart %PM2_APP_NAME% >> %LOG_FILE% 2>&1
)

if %ERRORLEVEL% NEQ 0 (SET "FAILED_STAGE=PM2 Process Restart" & goto :PIPELINE_FAILED)


:: ==========================================
:: SUCCESS
:: ==========================================
echo [✓] Fullstack CI/CD Pipeline completed successfully!
echo [✓] Frontend built into direct-serve dist folder.
echo [✓] PM2 backend application reloaded.
echo Pipeline Success: %DATE% %TIME% >> %LOG_FILE%
exit /b 0

:: ==========================================
:: ERROR HANDLING
:: ==========================================
:PIPELINE_FAILED
echo [X] CI/CD Pipeline FAILED at stage: %FAILED_STAGE%
echo See %LOG_FILE% for detailed errors.
echo Pipeline Failure: %FAILED_STAGE% at %DATE% %TIME% >> %LOG_FILE%
exit /b 1
