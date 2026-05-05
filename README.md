# Viral Music Predictor

Viral Music Predictor is a React + TypeScript + Vite web app that lets a user search Spotify tracks and estimate a **Viral Potential Score**.

The app focuses on market and trend signals (not audio-features), and presents the result in a visual score view with breakdown bars, insight text, embedded Spotify player, and snapshot export.

## What has been built

- Spotify OAuth login flow (Authorization Code + PKCE)
- Track search (`/v1/search`) with top 5 results
- Track analysis flow using:
  - track popularity
  - artist popularity
  - release recency
  - recommendation similarity
- Viral score calculation + label + insight text
- Score UI with:
  - animated score reveal
  - metric breakdown bars
  - embedded Spotify track player
  - one-click PNG snapshot export
- Loading skeleton states for search/analysis
- TypeScript setup + ESLint + Vitest tests

## Scoring logic

The app calculates a score from 0-100 using:

```txt
score =
  trackPopularity * 0.5 +
  artistPopularity * 0.25 +
  recencyScore * 0.15 +
  similarityBoost * 0.1
```

### Inputs

- **trackPopularity**: Spotify `track.popularity`
- **artistPopularity**: Spotify `artist.popularity`
- **recencyScore**: derived from `release_date` (newer tracks score higher)
- **similarityBoost**: average popularity of recommendation results (or neutral fallback when unavailable)

### Label thresholds

- `80+` -> **High Viral Potential**
- `60-79` -> **Moderate**
- `<60` -> **Low**

## Main API endpoints used

- `GET /v1/search?type=track&q=...`
- `GET /v1/tracks/{id}`
- `GET /v1/artists/{id}`
- `GET /v1/recommendations?seed_tracks=...`

## Project structure

```txt
src/
  components/   UI components
  hooks/        stateful logic (auth, analysis)
  lib/          API clients, scoring logic, shared types
  pages/        routed pages
```

## Local setup

1. Install dependencies:
   - `npm install`
2. Create `.env` with:
   - `VITE_SPOTIFY_CLIENT_ID=...`
   - `VITE_REDIRECT_URI=http://localhost:5173/callback`
3. Start dev server:
   - `npm run dev -- --host`

## Scripts

- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run lint` - lint checks
- `npm test` - unit tests (Vitest)

## Deployment notes

- Set production env vars in hosting platform:
  - `VITE_SPOTIFY_CLIENT_ID`
  - `VITE_REDIRECT_URI=https://your-domain/callback`
- Add the same redirect URI in Spotify app settings.
- Do not expose Spotify client secret in frontend env.
