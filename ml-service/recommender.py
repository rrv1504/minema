from collections import Counter
from typing import Any
from risk import compute_cancellation_risk
from recommendation_model import ContentBasedMovieRecommender

MOOD_GENRES = {
    "pumped": ["Action", "Thriller", "Adventure"], "romantic": ["Romance", "Drama"],
    "mysterious": ["Mystery", "Thriller", "Sci-Fi"], "adventurous": ["Adventure", "Fantasy", "Sci-Fi"],
    "chill": ["Comedy", "Romance", "Drama"], "epic": ["Fantasy", "Sci-Fi", "Action"],
}
GENRE_ADJACENCY = {
    "Action": ["Thriller", "Adventure"], "Thriller": ["Action", "Mystery"], "Adventure": ["Fantasy", "Action"],
    "Fantasy": ["Sci-Fi", "Adventure"], "Sci-Fi": ["Fantasy", "Mystery"], "Mystery": ["Thriller", "Sci-Fi"],
    "Romance": ["Drama"], "Drama": ["Romance", "Comedy"], "Comedy": ["Romance"],
}


def mood_match_score(genre: str, mood: str) -> int:
    genres = MOOD_GENRES[mood]
    if genre in genres: return 40
    adjacent = {item for mood_genre in genres for item in GENRE_ADJACENCY.get(mood_genre, [])}
    return 18 if genre in adjacent else 0


def rating_bonus(rating: str) -> int:
    return {"U": 8, "UA": 5, "A": 0}.get(rating.upper(), 0)


def build_recommendations(user_id: str, group_size: int, mood_distribution: dict[str, int], movies: list[dict[str, Any]], user_booking_genres: list[str]) -> dict[str, Any]:
    valid_moods = {mood: max(0, int(mood_distribution.get(mood, 0))) for mood in MOOD_GENRES}
    total_votes = sum(valid_moods.values())
    if not movies:
        return {"recommendations": [], "dominantMood": "pumped", "consensusPercent": 0, "cancellationRisk": compute_cancellation_risk(0, 0, group_size)}
    dominant_mood = max(MOOD_GENRES, key=lambda mood: valid_moods[mood])
    consensus_percent = round(valid_moods[dominant_mood] * 100 / total_votes) if total_votes else 0
    genre_freq = Counter(user_booking_genres)
    top_genre = genre_freq.most_common(1)[0][0] if genre_freq else None
    content_model = ContentBasedMovieRecommender()
    model_scores = content_model.score_movies(movies, user_booking_genres)
    counts = [int(movie.get("totalBookings", 0)) for movie in movies]
    min_bookings, max_bookings = min(counts), max(counts)
    recommendations = []
    for movie in movies:
        genre = movie["genre"]
        dominant_score = mood_match_score(genre, dominant_mood)
        weighted_score = sum(mood_match_score(genre, mood) * count for mood, count in valid_moods.items()) / total_votes if total_votes else 0
        mood_score = round(0.7 * dominant_score + 0.3 * weighted_score, 2)
        if genre == top_genre: personal_score = 30
        elif genre in genre_freq: personal_score = 20
        elif not user_booking_genres: personal_score = 15
        else: personal_score = 5
        popularity_score = round((int(movie.get("totalBookings", 0)) - min_bookings) / (max_bookings - min_bookings + 1e-9) * 20)
        bonus = rating_bonus(movie.get("rating", ""))
        total_score = min(99, round(mood_score + personal_score + popularity_score + bonus + 12))
        model_score = model_scores[str(movie["id"])]
        reasons = []
        if dominant_score == 40: reasons.append("Direct match for the group's " + dominant_mood + " mood")
        elif dominant_score == 18: reasons.append("A genre adjacent to the group's " + dominant_mood + " mood")
        if personal_score == 30: reasons.append("Matches your most-booked genre: " + genre)
        elif personal_score == 20: reasons.append("Fits a genre your group has booked before: " + genre)
        elif personal_score == 15: reasons.append("A balanced pick while your preferences are still new")
        if popularity_score >= 15: reasons.append("One of Minema's most-booked movies")
        if bonus: reasons.append(str(movie.get("rating")) + " rating bonus applied")
        if user_booking_genres and model_score >= 50:
            reasons.append("Content-based model found a strong match with your booking history")
        recommendations.append({"movieId": str(movie["id"]), "totalScore": total_score, "moodScore": mood_score, "personalScore": personal_score, "popularityScore": popularity_score, "modelScore": model_score, "reasons": reasons})
    # The requested explainable score remains primary; the trained content model
    # resolves equal scores using a user's full genre profile.
    recommendations.sort(key=lambda item: (-item["totalScore"], -item["modelScore"], -item["moodScore"], item["movieId"]))
    return {"recommendations": recommendations, "dominantMood": dominant_mood, "consensusPercent": consensus_percent, "recommendationModel": content_model.name, "cancellationRisk": compute_cancellation_risk(recommendations[0]["totalScore"], consensus_percent, group_size)}
