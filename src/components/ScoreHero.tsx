import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import type { SpotifyTrack, ViralScoreResult } from "../lib/types";
import ScoreBreakdown from "./ScoreBreakdown";
import SpotifyEmbedPlayer from "./SpotifyEmbedPlayer";

type ScoreHeroProps = {
  track: SpotifyTrack;
  scoreResult: ViralScoreResult;
  recommendations: SpotifyTrack[];
};

export default function ScoreHero({
  track,
  scoreResult,
  recommendations,
}: ScoreHeroProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [isTrackPlaying, setIsTrackPlaying] = useState(false);
  const snapshotRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const durationMs = 900;
    const targetScore = scoreResult.score;
    let frameId = 0;
    const start = performance.now();

    function animate(now: number) {
      const progress = Math.min((now - start) / durationMs, 1);
      const nextValue = Math.round(targetScore * (1 - (1 - progress) ** 3));
      setDisplayScore(nextValue);
      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    }

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [scoreResult.score, track.id]);

  async function handleShareSnapshot() {
    if (!snapshotRef.current || isExporting) return;

    try {
      setIsExporting(true);
      const canvas = await html2canvas(snapshotRef.current, {
        backgroundColor: "#090c14",
        useCORS: true,
        scale: 3,
        onclone: (clonedDocument) => {
          const exportRoot = clonedDocument.querySelector(
            "[data-snapshot-root='true']",
          ) as HTMLElement | null;
          if (exportRoot) {
            exportRoot.style.padding = "28px";
            exportRoot.style.borderRadius = "24px";
            exportRoot.style.background = "#090c14";
          }
        },
      });
      const url = canvas.toDataURL("image/png");
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${track.name.replace(/\s+/g, "-").toLowerCase()}-viral-score.png`;
      anchor.click();
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <section
      className="score-layout"
      ref={snapshotRef}
      data-snapshot-root="true"
    >
      {isTrackPlaying && (
        <div className="dance-gif-corner" aria-hidden="true">
          <img src="/svampbob.gif" alt="" className="dancer svampbob" />
        </div>
      )}
      <div className="score-visual">
        <img
          src={track.album.images[0]?.url}
          alt={`${track.album.name} cover`}
          className="album-art"
        />
        {isTrackPlaying && (
          <img
            src="/squidward.gif"
            alt=""
            aria-hidden="true"
            className="under-album-dancer"
          />
        )}
      </div>

      <div className="score-content">
        <p className="eyebrow">Viral Potential Score</p>
        <div className="score-line">
          <span className="score-value">{displayScore}</span>
          <span className="score-label">{scoreResult.label}</span>
        </div>
        <p className="insight">{scoreResult.insight}</p>
        <div className="hero-actions">
          <button
            className="share-button"
            onClick={handleShareSnapshot}
            disabled={isExporting}
          >
            {isExporting ? "Preparing..." : "Share Snapshot"}
          </button>
        </div>

        <ScoreBreakdown
          items={[
            {
              label: "Track Popularity",
              value: scoreResult.breakdown.trackPopularity,
            },
            {
              label: "Artist Popularity",
              value: scoreResult.breakdown.artistPopularity,
            },
            {
              label: "Mainstream Similarity",
              value: scoreResult.breakdown.similarityBoost,
            },
            { label: "Recency", value: scoreResult.breakdown.recency },
          ]}
        />

        <div className="embedded-player">
          <h3>Play selected track</h3>
          <SpotifyEmbedPlayer
            trackId={track.id}
            onPlaybackChange={setIsTrackPlaying}
          />
        </div>

        {recommendations.length > 0 && (
          <div className="recommendations">
            <h3>Similar tracks</h3>
            <ul>
              {recommendations.map((recommendation) => (
                <li key={recommendation.id}>
                  {recommendation.name} -{" "}
                  {recommendation.artists
                    .map((artist) => artist.name)
                    .join(", ")}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
