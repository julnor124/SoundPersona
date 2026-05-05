const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID?.trim() ?? "";
const redirectUri = import.meta.env.VITE_REDIRECT_URI?.trim() ?? "";
const scope = "user-read-private";

const ACCESS_TOKEN_KEY = "spotify_access_token";
const CODE_VERIFIER_KEY = "spotify_code_verifier";

function assertAuthConfig() {
  if (!clientId || !redirectUri) {
    throw new Error("Missing VITE_SPOTIFY_CLIENT_ID or VITE_REDIRECT_URI.");
  }
}

function generateRandomString(length: number) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let text = "";
  for (let index = 0; index < length; index += 1) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text;
}

async function sha256(plain: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest("SHA-256", data);
}

function base64UrlEncode(input: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export async function loginWithSpotify() {
  assertAuthConfig();

  const codeVerifier = generateRandomString(64);
  localStorage.setItem(CODE_VERIFIER_KEY, codeVerifier);

  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64UrlEncode(hashed);

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
    scope,
  });

  window.location.href =
    "https://accounts.spotify.com/authorize?" + params.toString();
}

export async function exchangeCodeForToken(code: string) {
  assertAuthConfig();

  const codeVerifier = localStorage.getItem(CODE_VERIFIER_KEY);
  if (!codeVerifier) {
    throw new Error("Missing PKCE code verifier. Please connect again.");
  }

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = (await response.json()) as {
    access_token?: string;
    error_description?: string;
  };

  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description ?? "Failed to get access token.");
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
  return data.access_token;
}

export function getStoredAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(CODE_VERIFIER_KEY);
}
