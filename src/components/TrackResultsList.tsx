import type { SpotifyTrack } from "../lib/types";

type TrackResultsListProps = {
  tracks: SpotifyTrack[];
  selectedTrackId?: string;
  onSelectTrack: (track: SpotifyTrack) => void;
};

export default function TrackResultsList({
  tracks,
  selectedTrackId,
  onSelectTrack,
}: TrackResultsListProps) {
  return (
    <ul className="track-results">
      {tracks.map((track) => (
        <li key={track.id}>
          <div className={`track-row ${selectedTrackId === track.id ? "selected" : ""}`}>
            <button className="track-main-button" onClick={() => onSelectTrack(track)}>
              <img
                src={track.album.images[0]?.url}
                alt={`${track.album.name} cover`}
                className="track-cover"
              />
              <span className="track-meta">
                <strong>{track.name}</strong>
                <span>{track.artists.map((artist) => artist.name).join(", ")}</span>
              </span>
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
