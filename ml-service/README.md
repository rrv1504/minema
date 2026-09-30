# Minema ML Service

FastAPI hosts Minema's recommendation and cancellation-risk inference.

## Setup

~~~powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python train_tmdb_content_model.py
python train_cancellation_model.py
~~~

## Run

~~~powershell
uvicorn main:app --reload --port 8000
~~~

Check http://127.0.0.1:8000/health.

## Models

- train_tmdb_content_model.py downloads TMDB 5000 movie metadata and credits, then trains a persisted TF-IDF vectorizer from title, genres, keywords, overview, cast, and director.
- recommendation_model.py uses the TMDB-trained vectorizer and cosine similarity to calculate personalized modelScore values for Minema catalog movies.
- train_cancellation_model.py trains a Random Forest cancellation classifier from reproducible bootstrap samples until enough real cancellation labels exist.

Run tests with:

~~~powershell
.\.venv\Scripts\python.exe -m unittest test_recommender.py
~~~

The ML service is internal. The frontend must call the Express endpoint POST /api/recommendations, not POST /recommend directly.
