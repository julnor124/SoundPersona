import { useState } from "react";
import ScoreHero from "../components/ScoreHero";
import SearchBar from "../components/SearchBar";
import TrackResultsList from "../components/TrackResultsList";
import { useSpotifyAuth } from "../hooks/useSpotifyAuth";
import { useTrackAnalysis } from "../hooks/useTrackAnalysis";
import { searchTracks } from "../lib/spotifyApi";
import type { SpotifyTrack } from "../lib/types";

export default function PredictorPage() {
  const { accessToken, isAuthenticated, login, logout } = useSpotifyAuth();
  const [query, setQuery] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SpotifyTrack[]>([]);

  const {
    selectedTrack,
    scoreResult,
    recommendations,
    error: analysisError,
    isLoading: isAnalyzing,
    analyzeTrack,
  } = useTrackAnalysis(accessToken);

  async function handleSearch() {
    if (!query.trim() || !accessToken) return;

    setSearchError(null);
    setIsSearching(true);
    try {
      const tracks = await searchTracks(query, accessToken);
      setResults(tracks);
      if (tracks.length > 0) {
        await analyzeTrack(tracks[0]);
      }
    } catch (error) {
      setSearchError(
        error instanceof Error ? error.message : "Search request failed."
      );
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <main className="predictor-page">
      <header className="hero">
        <p className="hero-kicker">Viral Music Predictor</p>
        <h1>Predict a track's viral potential before it peaks.</h1>
        <p className="hero-subcopy">
          Search any Spotify track and evaluate it using popularity, artist
          momentum, trend similarity, and release recency.
        </p>

        <div className="auth-row">
          {!isAuthenticated ? (
            <button className="auth-button" onClick={login}>
              Connect Spotify
            </button>
          ) : (
            <button className="auth-button secondary" onClick={logout}>
              Disconnect
            </button>
          )}
        </div>
      </header>

      {isAuthenticated && (
        <section className="workspace">
          <div className="left-panel">
            <SearchBar
              query={query}
              onQueryChange={setQuery}
              onSearch={handleSearch}
              disabled={isSearching || isAnalyzing}
            />
            {searchError && <p className="state-error">{searchError}</p>}
            {isSearching && (
              <div className="skeleton-list" aria-hidden="true">
                <div className="skeleton-row" />
                <div className="skeleton-row" />
                <div className="skeleton-row" />
              </div>
            )}
            {results.length > 0 && (
              <TrackResultsList
                tracks={results}
                selectedTrackId={selectedTrack?.id}
                onSelectTrack={analyzeTrack}
              />
            )}
          </div>

          <div className="right-panel">
            {(isSearching || isAnalyzing) && (
              <div className="score-skeleton" aria-hidden="true">
                <div className="score-skeleton-art" />
                <div className="score-skeleton-lines">
                  <div className="skeleton-line large" />
                  <div className="skeleton-line medium" />
                  <div className="skeleton-line medium" />
                  <div className="skeleton-line short" />
                </div>
              </div>
            )}
            {analysisError && <p className="state-error">{analysisError}</p>}
            {selectedTrack && scoreResult && (
              <ScoreHero
                key={selectedTrack.id}
                track={selectedTrack}
                scoreResult={scoreResult}
                recommendations={recommendations}
              />
            )}
            {!selectedTrack && (
              <p className="state-note">
                Search and select a track to generate a viral potential score.
              </p>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
