import { useEffect, useRef } from "react";

type SpotifyEmbedPlayerProps = {
  trackId: string;
  onPlaybackChange?: (isPlaying: boolean) => void;
};

type SpotifyPlaybackUpdateEvent = {
  data: {
    isPaused: boolean;
  };
};

type SpotifyEmbedController = {
  loadUri: (uri: string) => void;
  addListener: (
    event: "playback_update",
    callback: (event: SpotifyPlaybackUpdateEvent) => void
  ) => void;
  destroy: () => void;
};

type SpotifyIFrameApi = {
  createController: (
    element: HTMLElement,
    options: { uri: string; width: string; height: string },
    callback: (controller: SpotifyEmbedController) => void
  ) => void;
};

declare global {
  interface Window {
    SpotifyIframeApi?: SpotifyIFrameApi;
    onSpotifyIframeApiReady?: (api: SpotifyIFrameApi) => void;
  }
}

const SPOTIFY_IFRAME_SCRIPT_ID = "spotify-iframe-api";
const SPOTIFY_IFRAME_SCRIPT_SRC = "https://open.spotify.com/embed/iframe-api/v1";

export default function SpotifyEmbedPlayer({
  trackId,
  onPlaybackChange,
}: SpotifyEmbedPlayerProps) {
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<SpotifyEmbedController | null>(null);

  useEffect(() => {
    const container = playerContainerRef.current;
    if (!container) return;

    let disposed = false;

    const setupController = (api: SpotifyIFrameApi) => {
      if (disposed) return;

      if (controllerRef.current) {
        controllerRef.current.loadUri(`spotify:track:${trackId}`);
        onPlaybackChange?.(false);
        return;
      }

      api.createController(
        container,
        {
          uri: `spotify:track:${trackId}`,
          width: "100%",
          height: "80",
        },
        (controller) => {
          if (disposed) {
            controller.destroy();
            return;
          }

          controllerRef.current = controller;
          controller.addListener("playback_update", (event) => {
            onPlaybackChange?.(!event.data.isPaused);
          });
        }
      );
    };

    if (window.SpotifyIframeApi) {
      setupController(window.SpotifyIframeApi);
    } else {
      window.onSpotifyIframeApiReady = (api) => {
        window.SpotifyIframeApi = api;
        setupController(api);
      };

      if (!document.getElementById(SPOTIFY_IFRAME_SCRIPT_ID)) {
        const script = document.createElement("script");
        script.id = SPOTIFY_IFRAME_SCRIPT_ID;
        script.src = SPOTIFY_IFRAME_SCRIPT_SRC;
        script.async = true;
        document.body.appendChild(script);
      }
    }

    return () => {
      disposed = true;
    };
  }, [trackId, onPlaybackChange]);

  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.destroy();
        controllerRef.current = null;
      }
      onPlaybackChange?.(false);
    };
  }, [onPlaybackChange]);

  return <div ref={playerContainerRef} className="spotify-embed-root" />;
}
