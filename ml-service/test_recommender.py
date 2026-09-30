import unittest
from recommender import build_recommendations

class RecommendationTests(unittest.TestCase):
    def test_direct_mood_match_outranks_unrelated_movie(self):
        result = build_recommendations("user-1", 20, {"pumped": 8, "romantic": 0, "mysterious": 0, "adventurous": 0, "chill": 0, "epic": 0}, [{"id": "action", "title": "Action", "genre": "Action", "rating": "UA", "totalBookings": 10}, {"id": "romance", "title": "Romance", "genre": "Romance", "rating": "UA", "totalBookings": 10}], [])
        self.assertEqual(result["dominantMood"], "pumped")
        self.assertEqual(result["recommendations"][0]["movieId"], "action")
        self.assertEqual(result["recommendations"][0]["moodScore"], 40)
        self.assertEqual(result["cancellationRisk"]["level"], "low")

    def test_content_model_scores_a_booked_genre_higher(self):
        result = build_recommendations(
            "user-2", 10,
            {"romantic": 10, "pumped": 0, "mysterious": 0, "adventurous": 0, "chill": 0, "epic": 0},
            [{"id": "romance", "title": "Paris Love", "genre": "Romance", "rating": "UA", "totalBookings": 5},
             {"id": "action", "title": "Fast Mission", "genre": "Action", "rating": "UA", "totalBookings": 5}],
            ["Romance"]
        )
        scores = {item["movieId"]: item["modelScore"] for item in result["recommendations"]}
        self.assertGreater(scores["romance"], scores["action"])
        self.assertIn("TF-IDF content-based cosine similarity", result["recommendationModel"])

    def test_strong_romantic_consensus_outranks_booked_drama(self):
        result = build_recommendations(
            "user-3", 8,
            {"romantic": 8, "pumped": 0, "mysterious": 0, "adventurous": 0, "chill": 0, "epic": 0},
            [{"id": "romance", "title": "The Lunchbox", "genre": "Romance", "rating": "UA", "totalBookings": 0},
             {"id": "drama", "title": "Gully Boy", "genre": "Drama", "rating": "UA", "totalBookings": 10}],
            ["Drama"]
        )
        self.assertEqual(result["recommendations"][0]["movieId"], "romance")

if __name__ == "__main__":
    unittest.main()
