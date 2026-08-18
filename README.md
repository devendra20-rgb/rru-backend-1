# Ride Round Up

## Project Architecture

This repository uses a monorepo-style structure intended for future expansion.

- `backend/` - Node.js + Express + TypeScript + MongoDB backend (currently active)
- `frontend/` - Placeholder for future React/Next.js frontend application
- `docs/` - Documentation

## Backend Setup

1. **Navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment variables:**
   Copy `.env.example` to `.env` and fill in the values.
   ```bash
   cp .env.example .env
   ```
   Ensure you have a MongoDB instance running.

   For CI-driven E2E testing (GitHub Actions), add the following repository secret:

   - `MONGODB_URI` — your MongoDB connection string (e.g., mongodb+srv://...)

   The workflow `.github/workflows/e2e.yml` will use this secret to seed the database
   and run the automated E2E script.

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Run tests:**
   ```bash
   npm test
   ```

6. **Build:**
   ```bash
   npm run build
   ```

7. **API Documentation:**
   Swagger UI is available at `http://localhost:5000/api/docs` (when running).

## Tech Stack
- Node.js
- TypeScript
- Express
- MongoDB / Mongoose
- Zod (Validation)
- Pino (Logging)
- Vitest (Testing)
