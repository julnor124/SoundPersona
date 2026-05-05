import { useState } from "react";
import {
  fetchArtist,
  fetchRecommendations,
  fetchTrack,
} from "../lib/spotifyApi";
import { calculateViralScore } from "../lib/scoring";
import type { SpotifyTrack, ViralScoreResult } from "../lib/types";

type AnalysisState = {
  isLoading: boolean;
  error: string | null;
  selectedTrack: SpotifyTrack | null;
  scoreResult: ViralScoreResult | null;
  recommendations: SpotifyTrack[];
};

const initialState: AnalysisState = {
  isLoading: false,
  error: null,
  selectedTrack: null,
  scoreResult: null,
  recommendations: [],
};

export function useTrackAnalysis(accessToken: string | null) {
  const [state, setState] = useState<AnalysisState>(initialState);

  async function analyzeTrack(track: SpotifyTrack) {
    if (!accessToken) return;

    setState((previous) => ({
      ...previous,
      isLoading: true,
      error: null,
      selectedTrack: track,
      scoreResult: null,
    }));

    try {
      const [trackDetails, artist, recommendations] = await Promise.all([
        fetchTrack(track.id, accessToken),
        fetchArtist(track.artists[0].id, accessToken),
        fetchRecommendations(track.id, accessToken),
      ]);

      const scoreResult: ViralScoreResult = calculateViralScore(
        trackDetails,
        artist,
        recommendations
      );

      setState({
        isLoading: false,
        error: null,
        selectedTrack: trackDetails,
        scoreResult,
        recommendations,
      });
    } catch (error) {
      setState((previous) => ({
        ...previous,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to analyze this track.",
      }));
    }
  }

  return { ...state, analyzeTrack };
}
