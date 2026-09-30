from typing import Any
from fastapi import FastAPI
from pydantic import BaseModel, Field
from recommender import build_recommendations

class RecommendRequest(BaseModel):
    user_id: str = Field(alias="userId")
    group_size: int = Field(alias="groupSize", ge=1)
    mood_distribution: dict[str, int] = Field(alias="moodDistribution")
    movies: list[dict[str, Any]]
    user_booking_genres: list[str] = Field(alias="userBookingGenres")
    model_config = {"populate_by_name": True}

app = FastAPI(title="Minema Recommendation Service")

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}

@app.post("/recommend")
def recommend(payload: RecommendRequest) -> dict[str, Any]:
    return build_recommendations(payload.user_id, payload.group_size, payload.mood_distribution, payload.movies, payload.user_booking_genres)
