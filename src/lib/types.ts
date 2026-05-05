export type SpotifyImage = {
  url: string;
  width: number | null;
  height: number | null;
};

export type SpotifyArtist = {
  id: string;
  name: string;
  popularity: number;
  genres: string[];
};

export type SpotifyAlbum = {
  id: string;
  name: string;
  release_date: string;
  images: SpotifyImage[];
};

export type SpotifyTrack = {
  id: string;
  name: string;
  popularity: number;
  preview_url: string | null;
  external_urls?: {
    spotify?: string;
  };
  artists: Pick<SpotifyArtist, "id" | "name">[];
  album: SpotifyAlbum;
};

export type SpotifySearchResponse = {
  tracks: {
    items: SpotifyTrack[];
  };
};

export type ViralScoreBreakdown = {
  trackPopularity: number;
  artistPopularity: number;
  recency: number;
  similarityBoost: number;
};

export type ViralScoreResult = {
  score: number;
  label: "High Viral Potential" | "Moderate" | "Low";
  insight: string;
  breakdown: ViralScoreBreakdown;
};
