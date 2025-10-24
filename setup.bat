@echo off
REM Musab Hashmi Legal Services - Backend Setup Script for Windows

echo 🚀 Setting up Musab Hashmi Legal Services Backend...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Navigate to backend directory
cd backend

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Check if .env file exists
if not exist .env (
    echo 📝 Creating .env file from template...
    copy env.example .env
    echo ⚠️  Please edit the .env file with your actual email credentials
    echo    - EMAIL_USER: Your Gmail address
    echo    - EMAIL_PASS: Your 16-digit app-specific password
    echo    - EMAIL_TO: Destination email for form submissions
) else (
    echo ✅ .env file already exists
)

echo.
echo 🎉 Backend setup complete!
echo.
echo 📋 Next steps:
echo 1. Edit backend\.env file with your email credentials
echo 2. Set up Gmail app-specific password (see README.md)
echo 3. Run 'npm run dev' to start the development server
echo 4. The server will run on http://localhost:5000
echo.
echo 📧 Email endpoints available:
echo    - POST /api/send-email/ask-free-question
echo    - POST /api/send-email/talk-to-lawyer
echo    - POST /api/send-email/lawyer-signup
echo    - POST /api/send-email/contact-lawyer
echo.
echo 🔗 Frontend forms are now configured to send data to these endpoints
echo.
pause
