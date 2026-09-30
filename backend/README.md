# Minema Backend

The backend is a TypeScript Express API backed by MongoDB. It provides JWT authentication, hall availability checks, booking management, admin catalog management, and an internal bridge to the FastAPI recommendation service.

## Configure

~~~powershell
Copy-Item .env.example .env
npm install
~~~

Required backend/.env values:

~~~env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/minema
JWT_SECRET=use-a-long-random-secret
JWT_REFRESH_SECRET=use-a-different-long-random-secret
ML_SERVICE_URL=http://127.0.0.1:8000
~~~

## Seed and Run

Ensure MongoDB and the ML service are running first.

~~~powershell
npm run seed
npm run dev
~~~

The API runs at http://127.0.0.1:5000.

Warning: npm run seed deletes and recreates Minema database collections.

## Demo Admin

Email: admin@minema.local

Password: Minema123!

## Main Endpoints

- POST /api/auth/signup, POST /api/auth/login, POST /api/auth/refresh, POST /api/auth/logout
- GET /api/movies, GET /api/halls, GET /api/snacks
- POST /api/bookings, GET /api/bookings/my, PATCH /api/bookings/:id/cancel
- GET /api/availability?hallId=id&date=YYYY-MM-DD
- GET /api/operating-hours?from=YYYY-MM-DD&to=YYYY-MM-DD
- POST /api/recommendations

Admin-only write endpoints require an access token for the seeded admin account.

## Verification

~~~powershell
npm run check
npm run build
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:5000/api/health
~~~
