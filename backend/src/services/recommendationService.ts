export interface RecommendPayload {
  userId: string;
  groupSize: number;
  moodDistribution: Record<string, number>;
  movies: Array<{ id: string; title: string; genre: string; rating: string; totalBookings: number }>;
  userBookingGenres: string[];
}

export async function getRecommendations(payload: RecommendPayload) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch(process.env.ML_SERVICE_URL + "/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    if (!response.ok) throw new Error("Recommendation service responded " + response.status);
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}
