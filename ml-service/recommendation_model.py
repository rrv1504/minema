"""Content-based movie recommender used alongside Minema's explainable score."""

from pathlib import Path
from typing import Any

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class ContentBasedMovieRecommender:
    """Fits a TF-IDF movie-feature model to the live catalog for each request."""

    fallback_name = "Catalog TF-IDF content-based cosine similarity"
    trained_name = "TMDB 5000 TF-IDF content-based cosine similarity"
    name = fallback_name
    model_path = Path(__file__).parent / "models" / "tmdb_content_vectorizer.joblib"
    genre_aliases = {"Sci-Fi": "Science Fiction", "Superhero": "Action Adventure", "Animation": "Animation Family"}

    def movie_document(self, movie: dict[str, Any]) -> str:
        genre = self.genre_aliases.get(movie.get("genre", ""), movie.get("genre", ""))
        return f"{genre} {genre} {movie.get('title', '')}"

    def score_movies(self, movies: list[dict[str, Any]], user_booking_genres: list[str]) -> dict[str, float]:
        if not movies:
            return {}
        if not user_booking_genres:
            return {str(movie["id"]): 50.0 for movie in movies}

        # Genre is repeated to ensure it remains the primary learned feature;
        # title terms allow the model to distinguish catalog items of one genre.
        documents = [self.movie_document(movie) for movie in movies]
        if self.model_path.exists():
            vectorizer = joblib.load(self.model_path)["vectorizer"]
            self.name = self.trained_name
            movie_vectors = vectorizer.transform(documents)
        else:
            vectorizer = TfidfVectorizer(token_pattern=r"(?u)\b[\w-]+\b", ngram_range=(1, 2), lowercase=True)
            movie_vectors = vectorizer.fit_transform(documents)
            self.name = self.fallback_name
        profile = " ".join(self.genre_aliases.get(genre, genre) for genre in user_booking_genres)
        similarities = cosine_similarity(vectorizer.transform([profile]), movie_vectors).flatten()
        return {str(movie["id"]): round(float(score) * 100, 2) for movie, score in zip(movies, similarities)}
