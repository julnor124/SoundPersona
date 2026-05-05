import { describe, expect, it } from "vitest";
import { calculateViralScore, getRecencyScore } from "./scoring";
import type { SpotifyArtist, SpotifyTrack } from "./types";

function createTrack(overrides: Partial<SpotifyTrack> = {}): SpotifyTrack {
  return {
    id: "track-1",
    name: "Track",
    popularity: 80,
    artists: [{ id: "artist-1", name: "Artist" }],
    album: {
      id: "album-1",
      name: "Album",
      release_date: "2025-01-01",
      images: [],
    },
    ...overrides,
  };
}

function createArtist(overrides: Partial<SpotifyArtist> = {}): SpotifyArtist {
  return {
    id: "artist-1",
    name: "Artist",
    popularity: 70,
    genres: [],
    ...overrides,
  };
}

describe("getRecencyScore", () => {
  it("returns neutral score for invalid dates", () => {
    expect(getRecencyScore("not-a-date")).toBe(50);
  });

  it("gives higher scores to newer releases", () => {
    const newer = getRecencyScore("2025-01-01");
    const older = getRecencyScore("2018-01-01");
    expect(newer).toBeGreaterThan(older);
  });
});

describe("calculateViralScore", () => {
  it("uses weighted formula with recommendation similarity", () => {
    const track = createTrack({ popularity: 80 });
    const artist = createArtist({ popularity: 70 });
    const recommendations = [
      createTrack({ popularity: 90, id: "r1" }),
      createTrack({ popularity: 70, id: "r2" }),
    ];

    const result = calculateViralScore(track, artist, recommendations);
    // Similarity boost is average of recommendations -> 80.
    const expected =
      80 * 0.5 +
      70 * 0.25 +
      getRecencyScore(track.album.release_date) * 0.15 +
      80 * 0.1;

    expect(result.score).toBe(Math.round(expected));
    expect(result.breakdown.similarityBoost).toBe(80);
  });

  it("falls back to neutral similarity when recommendations are missing", () => {
    const result = calculateViralScore(createTrack(), createArtist(), []);
    expect(result.breakdown.similarityBoost).toBe(50);
  });

  it("assigns High Viral Potential label for high scores", () => {
    const track = createTrack({ popularity: 98 });
    const artist = createArtist({ popularity: 96 });
    const recommendations = [createTrack({ popularity: 95, id: "r1" })];
    const result = calculateViralScore(track, artist, recommendations);
    expect(result.label).toBe("High Viral Potential");
  });
});
