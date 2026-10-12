import { readJson, writeJson } from './storage';
import { mediaKey } from './tmdb';
import type { MediaType } from './tmdb';

// "Mi lista": titles the user wants to watch later. Same shape and storage
// approach as the watched list, newest first.

export interface WatchlistItem {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average?: number;
  media_type?: MediaType;
  dateAdded: string;
}

const WATCHLIST_STORAGE_KEY = 'cyber_movie_roulette_watchlist_v1';

export function getWatchlist(): WatchlistItem[] {
  return readJson<WatchlistItem[]>(WATCHLIST_STORAGE_KEY, []);
}

export function saveWatchlist(list: WatchlistItem[]): void {
  writeJson(WATCHLIST_STORAGE_KEY, list);
}

export function toggleWatchlist(movie: {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average?: number;
  media_type?: MediaType;
}): { isNowInList: boolean; updatedList: WatchlistItem[] } {
  const list = getWatchlist();
  const key = mediaKey(movie);
  const index = list.findIndex((m) => mediaKey(m) === key);

  if (index >= 0) {
    list.splice(index, 1);
    saveWatchlist(list);
    return { isNowInList: false, updatedList: list };
  }

  list.unshift({
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path,
    release_date: movie.release_date || '',
    vote_average: movie.vote_average,
    ...(movie.media_type === 'tv' ? { media_type: 'tv' as const } : {}),
    dateAdded: new Date().toISOString(),
  });
  saveWatchlist(list);
  return { isNowInList: true, updatedList: list };
}
