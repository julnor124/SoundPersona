import type {
  SpotifyArtist,
  SpotifySearchResponse,
  SpotifyTrack,
} from "./types";

const API_BASE = "https://api.spotify.com/v1";

function createAuthHeader(accessToken: string) {
  if (!accessToken) {
    throw new Error("Missing access token. Please connect Spotify.");
  }
  return { Authorization: `Bearer ${accessToken}` };
}

async function fetchFromSpotify<T>(path: string, accessToken: string) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: createAuthHeader(accessToken),
  });
  const rawBody = await response.text();
  let data: unknown = null;

  if (rawBody) {
    try {
      data = JSON.parse(rawBody);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const apiMessage =
      typeof (data as { error?: { message?: unknown } })?.error?.message ===
      "string"
        ? (data as { error: { message: string } }).error.message
        : "Unknown Spotify API error.";
    throw new Error(`Spotify request failed (${response.status}): ${apiMessage}`);
  }
  return (data ?? {}) as T;
}

export async function searchTracks(query: string, accessToken: string) {
  const encodedQuery = encodeURIComponent(query.trim());
  const data = await fetchFromSpotify<SpotifySearchResponse>(
    `/search?type=track&limit=5&q=${encodedQuery}`,
    accessToken
  );
  return data.tracks.items;
}

export function fetchTrack(trackId: string, accessToken: string) {
  return fetchFromSpotify<SpotifyTrack>(`/tracks/${trackId}`, accessToken);
}

export function fetchArtist(artistId: string, accessToken: string) {
  return fetchFromSpotify<SpotifyArtist>(`/artists/${artistId}`, accessToken);
}

export async function fetchRecommendations(
  trackId: string,
  accessToken: string
) {
  try {
    const data = await fetchFromSpotify<{ tracks: SpotifyTrack[] }>(
      `/recommendations?seed_tracks=${encodeURIComponent(trackId)}&limit=3`,
      accessToken
    );
    return data.tracks;
  } catch (error) {
    if (error instanceof Error && error.message.includes("(404)")) {
      return [];
    }
    throw error;
  }
}
