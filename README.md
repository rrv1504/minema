# Minema: Group Movie-Hall Booking

Minema is a full-stack group movie-hall booking system. Users book entire halls for groups, and the application recommends movies from group moods, booking history, catalog metadata, and popularity.

## Architecture

React + Vite frontend -> Express + MongoDB API -> FastAPI ML service

- Frontend: http://127.0.0.1:5173
- API: http://127.0.0.1:5000
- ML service: http://127.0.0.1:8000

The frontend calls Express. Express authenticates users, reads MongoDB data, and calls the internal Python recommendation service.

## Prerequisites

- Node.js and npm
- Python 3.12 or later
- MongoDB running locally, or a MongoDB Atlas connection string

## First-Time Setup

### 1. Configure the backend

~~~powershell
cd backend
Copy-Item .env.example .env
~~~

Open backend/.env and configure:

~~~env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/minema
JWT_SECRET=use-a-long-random-secret
JWT_REFRESH_SECRET=use-a-different-long-random-secret
ML_SERVICE_URL=http://127.0.0.1:8000
~~~

Install backend dependencies:

~~~powershell
npm install
~~~

### 2. Set up the ML service

Open another PowerShell terminal:

~~~powershell
cd "C:\Users\Roshni\Desktop\Sem-7\AML\Group-Based Movie Booking UI\ml-service"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python train_tmdb_content_model.py
python train_cancellation_model.py
~~~

The TMDB training script downloads TMDB 5000 movies and credits if needed, then trains and saves the TF-IDF recommendation vectorizer. Generated dataset files are ignored by Git.

### 3. Seed the database

From the backend directory:

~~~powershell
npm run seed
~~~

This creates 10 Indian movies, 4 halls, 8 snacks, 10 bookings, operating hours, an admin, and demo users.

Warning: npm run seed clears Minema collections before recreating them. Do not run it if you need to preserve current local bookings.

## Run the Application

Keep MongoDB running, then use three terminals.

### Terminal 1: ML service

~~~powershell
cd "C:\Users\Roshni\Desktop\Sem-7\AML\Group-Based Movie Booking UI\ml-service"
.\.venv\Scripts\Activate.ps1
uvicorn main:app --reload --port 8000
~~~

### Terminal 2: Express backend

~~~powershell
cd "C:\Users\Roshni\Desktop\Sem-7\AML\Group-Based Movie Booking UI\backend"
npm run dev
~~~

### Terminal 3: React frontend

~~~powershell
cd "C:\Users\Roshni\Desktop\Sem-7\AML\Group-Based Movie Booking UI"
npm install
npm run dev
~~~

Open http://127.0.0.1:5173 in your browser.

## Demo Credentials

Email: admin@minema.local

Password: Minema123!

Use the admin login for this account. Regular users can be created through the signup screen.

## Health Checks

- Frontend: http://127.0.0.1:5173
- API: http://127.0.0.1:5000/api/health
- ML service: http://127.0.0.1:8000/health

## AI Recommendation System

The recommendation service is a hybrid design:

- TF-IDF plus cosine similarity, trained from TMDB 5000 movie metadata, creates a content-based modelScore from user booking history.
- Explainable scoring ranks candidates using group mood, historical genre preference, popularity, and rating.
- RandomForestClassifier predicts cancellation risk from group size, consensus, match score, time-slot hour, and day of week.

The frontend calls POST /api/recommendations; it never calls FastAPI directly.

More backend API details are available in backend/README.md, and AML viva material is in AML_VIVA_GUIDE.md.
