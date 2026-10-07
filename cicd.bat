@echo off
SETLOCAL Enabledelayedexpansion

:: ==========================================
:: CONFIGURATION
:: ==========================================
SET "LOG_FILE=.\cicd_pipeline.log"
SET "BACKEND_DIR=.\backend"
SET "FRONTEND_DIR=.\frontend"

echo ============================================ >> %LOG_FILE%
echo FULLSTACK CI/CD PIPELINE STARTED AT %DATE% %TIME% >> %LOG_FILE%
echo ============================================ >> %LOG_FILE%

echo 🚀 Starting Local Fullstack CI/CD Pipeline...

:: ==========================================
:: STAGE 1: FETCH LATEST CODE
:: ==========================================
echo 📂 [1/3] Fetching latest changes from Git...
git fetch origin main >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (SET "FAILED_STAGE=Git Fetch" & goto :PIPELINE_FAILED)

git pull origin main >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (SET "FAILED_STAGE=Git Pull" & goto :PIPELINE_FAILED)


:: ==========================================
:: STAGE 2: BACKEND (CI/CD)
:: ==========================================
echo ⚙️ [2/3] Processing BACKEND...
cd "%BACKEND_DIR%"

call npm install >> ..\%LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (SET "FAILED_STAGE=Backend Install" & goto :PIPELINE_FAILED)

:: If your backend has a build step (like TypeScript), uncomment the next two lines:
:: call npm run build >> ..\%LOG_FILE% 2>&1
:: if %ERRORLEVEL% NEQ 0 (SET "FAILED_STAGE=Backend Build" & goto :PIPELINE_FAILED)

cd ..


:: ==========================================
:: STAGE 3: FRONTEND (CI/CD)
:: ==========================================
echo 💻 [3/3] Processing FRONTEND (Building directly into dist)...
cd "%FRONTEND_DIR%"

call npm install >> ..\%LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (SET "FAILED_STAGE=Frontend Install" & goto :PIPELINE_FAILED)

:: This generates the fresh files directly in your live \dist folder
call npm run build >> ..\%LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (SET "FAILED_STAGE=Frontend Build" & goto :PIPELINE_FAILED)

cd ..


:: ==========================================
:: SUCCESS
:: ==========================================
echo ✅ Fullstack CI/CD Pipeline completed successfully!
echo ✅ Frontend built into direct-serve dist folder.
echo Pipeline Success: %DATE% %TIME% >> %LOG_FILE%
exit /b 0

:: ==========================================
:: ERROR HANDLING
:: ==========================================
:PIPELINE_FAILED
echo ❌ CI/CD Pipeline FAILED at stage: %FAILED_STAGE%
echo See %LOG_FILE% for detailed errors.
echo Pipeline Failure: %FAILED_STAGE% at %DATE% %TIME% >> %LOG_FILE%
exit /b 1
