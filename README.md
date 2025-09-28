CrisisWatch Final – Render-ready

This repo contains frontend (React + Vite) and backend (Node + Express) with Excel persistence.

Local quick test:
1. Backend
   cd backend
   npm install
   node server.js
2. Frontend
   cd frontend
   npm install
   npm run dev
3. Open frontend (Vite URL) and it will call backend at http://localhost:8080 by default.

Enable Twitter fetcher (with your token):
TWITTER_BEARER_TOKEN=YOUR_TOKEN BACKEND=http://localhost:8080 node backend/twitter_fetcher.js

Render deployment:
- Use render.yaml provided to deploy as monorepo (backend web service, frontend static site, worker)
- Add env vars on Render for TWITTER_BEARER_TOKEN

API endpoints:
- POST /api/posts -> append posts (accepts array or single object)
- GET  /api/posts -> list posts (reads Excel)
- GET  /api/report -> aggregation
- GET  /api/download-excel -> download posts.xlsx
