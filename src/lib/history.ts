import { readJson, writeJson, removeKey, runMigrationOnce } from './storage';

export interface DrawnHistoryItem {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average?: number;
  genre_ids?: number[];
  drawnAt: string;
}

const HISTORY_STORAGE_KEY = 'cyber_movie_roulette_draw_history_v1';
const MATRIX_ID_MIGRATION_KEY = 'cyber_migration_history_matrix_id_v1';
const MAX_HISTORY_ITEMS = 100;

// Early demo builds stored The Matrix under a fake id (102); real TMDB id is 603.
function migrateLegacyMatrixId(): void {
  const list = readJson<DrawnHistoryItem[]>(HISTORY_STORAGE_KEY, []);
  let changed = false;
  for (const item of list) {
    if (item.id === 102 || item.title?.toLowerCase().includes('matrix')) {
      item.id = 603;
      changed = true;
    }
  }
  if (changed) writeJson(HISTORY_STORAGE_KEY, list);
}

export function getDrawnHistory(): DrawnHistoryItem[] {
  runMigrationOnce(MATRIX_ID_MIGRATION_KEY, migrateLegacyMatrixId);
  return readJson<DrawnHistoryItem[]>(HISTORY_STORAGE_KEY, []);
}

export function saveDrawnHistory(list: DrawnHistoryItem[]): void {
  writeJson(HISTORY_STORAGE_KEY, list);
}

export function addMovieToHistory(movie: {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average?: number;
  genre_ids?: number[];
}): DrawnHistoryItem[] {
  const list = getDrawnHistory();

  const newItem: DrawnHistoryItem = {
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path,
    release_date: movie.release_date || '',
    vote_average: movie.vote_average,
    genre_ids: movie.genre_ids,
    drawnAt: new Date().toISOString(),
  };

  // Prepend, dropping any earlier draw of the same movie, capped to the last N.
  const filtered = list.filter((item) => item.id !== movie.id);
  const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);

  saveDrawnHistory(updated);
  return updated;
}

export function clearDrawnHistory(): void {
  removeKey(HISTORY_STORAGE_KEY);
}
