const STORAGE_KEY_YOUTUBE = 'cyber_youtube_api_key';

export function getStoredYoutubeKey(): string {
  const customKey = localStorage.getItem(STORAGE_KEY_YOUTUBE);
  if (customKey && customKey.trim().length > 0) return customKey.trim();
  const envKey = import.meta.env.VITE_YOUTUBE_API_KEY;
  if (envKey && envKey.trim().length > 0) return envKey.trim();
  return '';
}

export function setStoredYoutubeKey(key: string): void {
  localStorage.setItem(STORAGE_KEY_YOUTUBE, key.trim());
}

async function searchYoutubeVideoId(query: string, apiKey: string): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      part: 'snippet',
      type: 'video',
      maxResults: '1',
      q: query,
      key: apiKey,
    });
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.items?.[0]?.id?.videoId || null;
  } catch {
    return null;
  }
}

/**
 * Looks for background audio for a movie, in order of preference:
 * 1. Its classic theme/soundtrack (YouTube search, requires a configured YouTube API key).
 * 2. A classic scene from the movie (YouTube search, same key).
 * Returns a YouTube video id, or null if no key is configured or nothing was found —
 * callers should fall back to the movie's trailer in that case.
 */
export async function findThemeOrSceneVideoId(title: string, year: string): Promise<string | null> {
  const apiKey = getStoredYoutubeKey();
  if (!apiKey) return null;

  const themeQuery = `${title} ${year} tema principal soundtrack banda sonora`;
  const themeResult = await searchYoutubeVideoId(themeQuery, apiKey);
  if (themeResult) return themeResult;

  const sceneQuery = `${title} ${year} escena clásica`;
  return await searchYoutubeVideoId(sceneQuery, apiKey);
}
