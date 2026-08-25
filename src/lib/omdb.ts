// Official shared demo key, provided by the project owner. Empty until set —
// falls back gracefully (fetchOmdbRatings returns null) when no key is configured.
export const OFFICIAL_DEMO_OMDB_KEY = '';

const STORAGE_KEY_OMDB = 'cyber_omdb_api_key';

export function getStoredOmdbKey(): string {
  const customKey = localStorage.getItem(STORAGE_KEY_OMDB);
  if (customKey && customKey.trim().length > 0) return customKey.trim();
  const envKey = import.meta.env.VITE_OMDB_API_KEY;
  if (envKey && envKey.trim().length > 0) return envKey.trim();
  return OFFICIAL_DEMO_OMDB_KEY;
}

export function setStoredOmdbKey(key: string): void {
  localStorage.setItem(STORAGE_KEY_OMDB, key.trim());
}

export interface OmdbRatings {
  imdbRating: string | null;
  metascore: string | null;
  rottenTomatoes: string | null;
}

/**
 * Fetches IMDb / Rotten Tomatoes / Metacritic ratings for a movie by IMDb id.
 * Returns null on any failure (no key, invalid key, daily limit reached, no match)
 * so the caller can just hide the extra ratings instead of breaking the UI.
 */
export async function fetchOmdbRatings(imdbId: string): Promise<OmdbRatings | null> {
  const apiKey = getStoredOmdbKey();
  if (!apiKey || !imdbId) return null;

  try {
    const response = await fetch(
      `https://www.omdbapi.com/?i=${encodeURIComponent(imdbId)}&apikey=${encodeURIComponent(apiKey)}`
    );
    if (!response.ok) return null;

    const data = await response.json();
    if (data.Response === 'False') return null;

    const rtRating = (data.Ratings || []).find(
      (r: { Source: string; Value: string }) => r.Source === 'Rotten Tomatoes'
    );

    return {
      imdbRating: data.imdbRating && data.imdbRating !== 'N/A' ? data.imdbRating : null,
      metascore: data.Metascore && data.Metascore !== 'N/A' ? data.Metascore : null,
      rottenTomatoes: rtRating?.Value || null,
    };
  } catch {
    return null;
  }
}
