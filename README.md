# Pothole Tracker

This repository contains a starter MERN stack project for a Pothole Tracker application. It features a React frontend and an Express/MongoDB backend with OTP-based authentication.

## Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)

## Setup
1. Install dependencies for both frontend and backend:
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```
2. Copy `backend/.env.example` to `backend/.env` and fill in the values.
3. Start the backend server:
   ```bash
   npm run dev
   ```
4. In another terminal, start the React app:
   ```bash
   npm start --prefix ../frontend
   ```

The React app will be available at `http://localhost:3000` and the API at `http://localhost:5000`.

## Testing
There are currently no automated tests. Running `npm test` in either project will execute the default React/Node test scripts if added in the future.
