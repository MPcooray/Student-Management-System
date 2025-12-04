# Student Management System

Small full-stack demo app for student registration: .NET Web API backend and Vite + React frontend.

## Prerequisites
- .NET 9 SDK
- Node.js (18+ recommended) and npm

## Backend (API)
Location: `backend/StudentMgmtApi`

Run:
```bash
cd backend/StudentMgmtApi
dotnet build
dotnet run
```

The API listens on `http://localhost:5269` by default (development). Note: the development startup re-creates the database so data will be reset each run.

Available endpoints (examples):
- `GET /api/students`
- `POST /api/students`
- `POST /api/students/{id}/enroll` (payload: array of course ids)
- `GET /api/courses`
- `POST /api/courses`

## Frontend
Location: `frontend`

Run locally:
```bash
cd frontend
npm install
npm run dev
```

Ensure the frontend has the API base URL set in `frontend/.env` (or environment) as:
```
VITE_API_URL=http://localhost:5269/api
```

