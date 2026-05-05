import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { exchangeCodeForToken } from "../lib/spotifyAuth";

export default function CallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const hasHandledCallback = useRef(false);

  useEffect(() => {
    if (hasHandledCallback.current) return;
    hasHandledCallback.current = true;

    async function handleCallback() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const authError = params.get("error");

      if (authError) {
        setError(`Spotify login failed: ${authError}`);
        return;
      }

      if (!code) {
        setError("Spotify did not return an authorization code.");
        return;
      }

      try {
        await exchangeCodeForToken(code);
        navigate("/");
      } catch (tokenError) {
        setError(
          tokenError instanceof Error
            ? tokenError.message
            : "Could not complete Spotify login."
        );
      }
    }

    handleCallback();
  }, [navigate]);

  return (
    <main className="callback-page">
      <h1>Finalizing login...</h1>
      {error && <p className="state-error">{error}</p>}
    </main>
  );
}
