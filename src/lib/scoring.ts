import type {
  SpotifyArtist,
  SpotifyTrack,
  ViralScoreResult,
} from "./types";

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

export function getRecencyScore(releaseDate: string) {
  const release = new Date(releaseDate);
  if (Number.isNaN(release.getTime())) {
    return 50;
  }

  const ageInDays = (Date.now() - release.getTime()) / (1000 * 60 * 60 * 24);
  const ageInYears = ageInDays / 365;
  const recency = 100 - ageInYears * 20;
  return clamp(Math.round(recency));
}

function getScoreLabel(score: number): ViralScoreResult["label"] {
  if (score >= 80) return "High Viral Potential";
  if (score >= 60) return "Moderate";
  return "Low";
}

function buildInsight(
  score: number,
  trackPopularity: number,
  artistPopularity: number,
  recencyScore: number,
  similarityBoost: number
) {
  if (similarityBoost >= 75) {
    return "Strong mainstream similarity suggests algorithmic push potential.";
  }
  if (artistPopularity >= 75) {
    return "This track is gaining traction through strong artist momentum.";
  }
  if (recencyScore >= 75) {
    return "Recent release timing increases short-term viral likelihood.";
  }
  if (trackPopularity < 45) {
    return "Lower track popularity may limit immediate reach, but this can still be a breakout sleeper.";
  }
  if (score >= 80) {
    return "High aggregate market and trend signals indicate strong viral upside.";
  }
  return "Market signals are mixed; stronger distribution and creator adoption could lift this track.";
}

export function calculateViralScore(
  track: SpotifyTrack,
  artist: SpotifyArtist,
  recommendations: SpotifyTrack[]
): ViralScoreResult {
  const recencyScore = getRecencyScore(track.album.release_date);
  const similarityBoost =
    recommendations.length > 0
      ? Math.round(
          recommendations.reduce((sum, recommendation) => sum + recommendation.popularity, 0) /
            recommendations.length
        )
      : 50;

  const score =
    track.popularity * 0.5 +
    artist.popularity * 0.25 +
    recencyScore * 0.15 +
    similarityBoost * 0.1;

  const roundedScore = Math.round(clamp(score));
  return {
    score: roundedScore,
    label: getScoreLabel(roundedScore),
    insight: buildInsight(
      roundedScore,
      track.popularity,
      artist.popularity,
      recencyScore,
      similarityBoost
    ),
    breakdown: {
      trackPopularity: track.popularity,
      artistPopularity: artist.popularity,
      recency: recencyScore,
      similarityBoost,
    },
  };
}
