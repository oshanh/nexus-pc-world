# Nexus PC World - Setup Guide

## Prerequisites
- Node.js (LTS recommended)
- npm
- Git

## Installation & Setup Steps

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/nexus-pc-world.git
cd nexus-pc-world
```

### 2. Install Dependencies
This repo has two apps:
- `npw-backend` (Express)
- `npw-frontend` (Vite + React)

You can install and run everything with one command:

**Windows (recommended):**
```bat
run-dev.cmd
```

**PowerShell:**
```powershell
./run-dev.ps1
```

**macOS/Linux:**
```bash
./run-dev.sh
```

Or install dependencies manually:
```bash
cd npw-backend && npm install
cd ../npw-frontend && npm install
```

### 3. Environment Configuration
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Build the Project
```bash
cd npw-frontend && npm run build
```

### 5. Start the Development Server
```bash
run-dev.cmd
```

### 6. Access the Application
- Frontend (Vite): `http://localhost:5173`
- Backend: check backend console output for the configured port

## Additional Commands

### Run Tests
```bash
npm test
```

### Production Build
```bash
npm run build:prod
npm start
```

### View Logs
```bash
npm run logs
```

## Troubleshooting
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `npm cache clean --force`
