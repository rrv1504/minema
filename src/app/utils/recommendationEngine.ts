export type Mood = 'pumped' | 'romantic' | 'mysterious' | 'adventurous' | 'chill' | 'epic';

export interface MoodConfig {
  label: string;
  gradient: string;
  borderClass: string;
  bgClass: string;
  textClass: string;
  glowColor: string;
  genres: string[];
  description: string;
  tagline: string;
}

export const MOOD_CONFIG: Record<Mood, MoodConfig> = {
  pumped: {
    label: 'Pumped Up',
    gradient: 'from-red-500 to-orange-500',
    borderClass: 'border-red-500/50',
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-400',
    glowColor: 'rgba(239,68,68,0.35)',
    genres: ['Action', 'Thriller', 'Adventure'],
    description: 'Ready for adrenaline-packed thrills',
    tagline: "Let's go wild!",
  },
  romantic: {
    label: 'Romantic',
    gradient: 'from-pink-500 to-rose-400',
    borderClass: 'border-pink-500/50',
    bgClass: 'bg-pink-500/10',
    textClass: 'text-pink-400',
    glowColor: 'rgba(236,72,153,0.35)',
    genres: ['Romance', 'Drama'],
    description: 'In the mood for love and deep emotion',
    tagline: 'Feel all the feels',
  },
  mysterious: {
    label: 'Mysterious',
    gradient: 'from-purple-600 to-indigo-500',
    borderClass: 'border-purple-500/50',
    bgClass: 'bg-purple-500/10',
    textClass: 'text-purple-400',
    glowColor: 'rgba(168,85,247,0.35)',
    genres: ['Mystery', 'Thriller', 'Sci-Fi'],
    description: 'Craving suspense and the unknown',
    tagline: 'Who did it?',
  },
  adventurous: {
    label: 'Adventurous',
    gradient: 'from-amber-500 to-yellow-400',
    borderClass: 'border-amber-500/50',
    bgClass: 'bg-amber-500/10',
    textClass: 'text-amber-400',
    glowColor: 'rgba(245,158,11,0.35)',
    genres: ['Adventure', 'Fantasy', 'Sci-Fi'],
    description: 'Ready to explore new worlds',
    tagline: 'Onward!',
  },
  chill: {
    label: 'Chill Vibes',
    gradient: 'from-blue-500 to-cyan-400',
    borderClass: 'border-blue-500/50',
    bgClass: 'bg-blue-500/10',
    textClass: 'text-blue-400',
    glowColor: 'rgba(59,130,246,0.35)',
    genres: ['Comedy', 'Romance', 'Drama'],
    description: 'Just want to relax and enjoy',
    tagline: 'Low-key night out',
  },
  epic: {
    label: 'Epic Mode',
    gradient: 'from-emerald-500 to-teal-400',
    borderClass: 'border-emerald-500/50',
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-400',
    glowColor: 'rgba(16,185,129,0.35)',
    genres: ['Fantasy', 'Sci-Fi', 'Action'],
    description: 'Ready for an epic cinematic experience',
    tagline: 'Legends only',
  },
};

// Related genre adjacency for partial-match scoring
const GENRE_ADJACENCY: Record<string, string[]> = {
  Action: ['Thriller', 'Adventure'],
  Thriller: ['Action', 'Mystery'],
  Adventure: ['Fantasy', 'Action'],
  Fantasy: ['Sci-Fi', 'Adventure'],
  'Sci-Fi': ['Fantasy', 'Mystery'],
  Mystery: ['Thriller', 'Sci-Fi'],
  Romance: ['Drama'],
  Drama: ['Romance', 'Comedy'],
  Comedy: ['Romance'],
};

export interface ScoreBreakdown {
  total: number;
  moodScore: number;
  personalScore: number;
  popularityScore: number;
  reasons: string[];
}

export function computeMovieScore(
  movieGenre: string,
  movieRating: string,
  selectedMood: Mood,
  userBookedGenres: string[],
  totalBookingsForMovie: number
): ScoreBreakdown {
  const moodGenres = MOOD_CONFIG[selectedMood].genres;
  const reasons: string[] = [];

  // Mood match (0–40)
  let moodScore = 0;
  if (moodGenres.includes(movieGenre)) {
    moodScore = 40;
    reasons.push(`Perfect genre match for your ${MOOD_CONFIG[selectedMood].label} mood`);
  } else {
    const adjacent = GENRE_ADJACENCY[movieGenre] || [];
    if (adjacent.some(g => moodGenres.includes(g))) {
      moodScore = 18;
      reasons.push(`Related genre for ${MOOD_CONFIG[selectedMood].label} mood`);
    }
  }

  // Personalization from user booking history (0–30)
  const genreFreq: Record<string, number> = {};
  userBookedGenres.forEach(g => { genreFreq[g] = (genreFreq[g] || 0) + 1; });
  const topGenre = Object.entries(genreFreq).sort((a, b) => b[1] - a[1])[0]?.[0];

  let personalScore = 0;
  if (movieGenre === topGenre) {
    personalScore = 30;
    reasons.push("Matches your favourite genre from past bookings");
  } else if (userBookedGenres.includes(movieGenre)) {
    personalScore = 20;
    reasons.push("You've enjoyed this genre before");
  } else if (userBookedGenres.length === 0) {
    personalScore = 15;
    reasons.push("Great pick for first-time viewers");
  }

  // Popularity (0–20) — capped proportionally to booking count
  const popularityScore = Math.min(20, totalBookingsForMovie * 4);
  if (popularityScore >= 12) reasons.push("Trending with groups");
  else if (popularityScore >= 6) reasons.push("Popular choice");

  // Rating bonus (0–8) — family/group friendly
  const ratingBonus = movieRating === 'U' ? 8 : movieRating === 'UA' ? 5 : 0;
  if (ratingBonus > 0) reasons.push("Group-friendly rating");

  const total = Math.min(99, moodScore + personalScore + popularityScore + ratingBonus + 12);

  return { total, moodScore, personalScore, popularityScore, reasons };
}

export interface RiskResult {
  risk: number;
  level: 'low' | 'medium' | 'high';
  factors: Array<{ label: string; impact: number }>;
  suggestion: string;
}

export function computeCancellationRisk(
  matchScore: number,
  consensusPercent: number,
  groupSize: number
): RiskResult {
  let risk = 35;
  const factors: Array<{ label: string; impact: number }> = [];

  if (matchScore >= 80) {
    risk -= 18;
    factors.push({ label: 'High group match score', impact: -18 });
  } else if (matchScore < 50) {
    risk += 20;
    factors.push({ label: 'Low group match score', impact: +20 });
  } else {
    risk -= 5;
    factors.push({ label: 'Moderate match score', impact: -5 });
  }

  if (consensusPercent >= 75) {
    risk -= 12;
    factors.push({ label: 'Strong mood consensus in group', impact: -12 });
  } else if (consensusPercent < 50) {
    risk += 15;
    factors.push({ label: 'Mixed mood preferences', impact: +15 });
  }

  if (groupSize >= 20) {
    risk -= 8;
    factors.push({ label: 'Large, committed group', impact: -8 });
  } else if (groupSize < 10) {
    risk += 10;
    factors.push({ label: 'Small group — higher dropout risk', impact: +10 });
  }

  risk = Math.max(5, Math.min(88, risk));
  const level = risk < 30 ? 'low' : risk < 55 ? 'medium' : 'high';

  const suggestion =
    level === 'high'
      ? "Consider an earlier time slot and confirm attendance 24 h in advance."
      : level === 'medium'
      ? "Send a quick group poll to lock in attendance before booking."
      : "Great plan! Low risk of cancellation — go ahead and book.";

  return { risk, level, factors, suggestion };
}

// Simulated group members (friends in the group)
export interface GroupMember {
  name: string;
  initials: string;
  mood: Mood;
  avatarGradient: string;
}

export const SIMULATED_GROUP_MEMBERS: GroupMember[] = [
  { name: 'Arjun', initials: 'AR', mood: 'pumped', avatarGradient: 'from-orange-500 to-red-500' },
  { name: 'Priya', initials: 'PR', mood: 'romantic', avatarGradient: 'from-pink-500 to-rose-500' },
  { name: 'Rahul', initials: 'RH', mood: 'pumped', avatarGradient: 'from-blue-500 to-indigo-500' },
  { name: 'Sneha', initials: 'SN', mood: 'mysterious', avatarGradient: 'from-purple-500 to-violet-500' },
];

export function computeMoodConsensus(members: GroupMember[]): {
  moodCounts: Record<Mood, number>;
  dominant: Mood;
  dominantCount: number;
  percent: number;
} {
  const moodCounts: Record<Mood, number> = {
    pumped: 0, romantic: 0, mysterious: 0, adventurous: 0, chill: 0, epic: 0,
  };
  members.forEach(m => { moodCounts[m.mood]++; });

  const [dominant, dominantCount] = Object.entries(moodCounts)
    .sort((a, b) => b[1] - a[1])[0] as [Mood, number];

  return {
    moodCounts,
    dominant,
    dominantCount,
    percent: Math.round((dominantCount / members.length) * 100),
  };
}
