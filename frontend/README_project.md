# Student Registration Frontend

This frontend is a Vite + React 18 application for the Student Registration practical test. It connects to a .NET backend exposing REST endpoints under `/api`.

Quick start
1. cd into the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create an environment file (`.env.local`) with the backend base URL (example):
   ```bash
   VITE_API_URL=http://localhost:5269/api
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```

Build for production:
```
npm run build
```

Run tests:
```
npm run test
```

Notes
- TailwindCSS is configured in `tailwind.config.cjs` and used in `src/index.css`.
- API calls use `src/services/apiClient.js` (axios instance) and services in `src/services`.
- Forms use `react-hook-form` + `zod` for validation.

If the backend is not running you can still run the frontend — it will show empty lists and friendly error messages. To demo without backend you can use a simple JSON mock or MSW.
