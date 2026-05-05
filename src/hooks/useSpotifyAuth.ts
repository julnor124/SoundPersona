import { useMemo, useState } from "react";
import {
  clearSession,
  getStoredAccessToken,
  loginWithSpotify,
} from "../lib/spotifyAuth";

export function useSpotifyAuth() {
  const [accessToken, setAccessToken] = useState<string | null>(
    getStoredAccessToken()
  );

  const isAuthenticated = useMemo(() => Boolean(accessToken), [accessToken]);

  return {
    accessToken,
    isAuthenticated,
    setAccessToken,
    login: loginWithSpotify,
    logout: () => {
      clearSession();
      setAccessToken(null);
    },
  };
}
