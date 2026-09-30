"""Train Minema's content recommender on the TMDB 5000 Movies Dataset."""

import csv
import json
from pathlib import Path
from urllib.request import urlretrieve

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer

ROOT = Path(__file__).parent
DATA_DIR = ROOT / "data"
MODEL_PATH = ROOT / "models" / "tmdb_content_vectorizer.joblib"
MOVIES_URL = "https://raw.githubusercontent.com/vamshi121/TMDB-5000-Movie-Dataset/main/tmdb_5000_movies.csv"
CREDITS_URL = "https://raw.githubusercontent.com/harshitcodes/tmdb_movie_data_analysis/master/tmdb-5000-movie-dataset/tmdb_5000_credits.csv"


def names(value: str, limit: int | None = None) -> str:
    try:
        items = json.loads(value or "[]")
    except json.JSONDecodeError:
        return ""
    selected = [item.get("name", "") for item in items if item.get("name")]
    return " ".join(selected[:limit] if limit else selected)


def director(value: str) -> str:
    try:
        crew = json.loads(value or "[]")
    except json.JSONDecodeError:
        return ""
    return " ".join(item.get("name", "") for item in crew if item.get("job") == "Director")


def ensure_dataset() -> tuple[Path, Path]:
    DATA_DIR.mkdir(exist_ok=True)
    movies_path = DATA_DIR / "tmdb_5000_movies.csv"
    credits_path = DATA_DIR / "tmdb_5000_credits.csv"
    if not movies_path.exists():
        print("Downloading TMDB 5000 movie metadata...")
        urlretrieve(MOVIES_URL, movies_path)
    if not credits_path.exists():
        print("Downloading TMDB 5000 credits...")
        urlretrieve(CREDITS_URL, credits_path)
    return movies_path, credits_path


def build_documents(movies_path: Path, credits_path: Path) -> list[str]:
    credits: dict[str, dict[str, str]] = {}
    with credits_path.open(encoding="utf-8") as file:
        for row in csv.DictReader(file):
            credits[row["movie_id"]] = row
    documents: list[str] = []
    with movies_path.open(encoding="utf-8") as file:
        for movie in csv.DictReader(file):
            credit = credits.get(movie["id"], {})
            # Repeating important semantic fields makes genres and keywords
            # more influential than incidental words in plot overviews.
            genres = names(movie.get("genres", ""))
            keywords = names(movie.get("keywords", ""))
            cast = names(credit.get("cast", ""), limit=3)
            director_name = director(credit.get("crew", ""))
            document = " ".join([
                movie.get("title", ""),
                genres, genres, genres,
                keywords, keywords,
                movie.get("overview", ""),
                cast,
                director_name,
            ]).strip()
            if document:
                documents.append(document)
    return documents


if __name__ == "__main__":
    movies_file, credits_file = ensure_dataset()
    corpus = build_documents(movies_file, credits_file)
    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),
        max_features=50_000,
        token_pattern=r"(?u)\b[\w-]+\b",
    )
    vectorizer.fit(corpus)
    MODEL_PATH.parent.mkdir(exist_ok=True)
    joblib.dump({"vectorizer": vectorizer, "movie_count": len(corpus), "dataset": "TMDB 5000"}, MODEL_PATH)
    print(f"Trained TF-IDF model on {len(corpus)} TMDB movies and saved {MODEL_PATH}")
