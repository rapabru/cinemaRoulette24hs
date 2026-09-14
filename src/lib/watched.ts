import { readJson, writeJson, runMigrationOnce } from './storage';

export interface WatchedMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average?: number;
  dateWatched: string;
}

const WATCHED_STORAGE_KEY = 'cyber_movie_roulette_watched_v1';
const MATRIX_ID_MIGRATION_KEY = 'cyber_migration_watched_matrix_id_v1';

// Early demo builds stored The Matrix under a fake id (102); real TMDB id is 603.
function migrateLegacyMatrixId(): void {
  const list = readJson<WatchedMovie[]>(WATCHED_STORAGE_KEY, []);
  let changed = false;
  for (const item of list) {
    if (item.id === 102 || item.title?.toLowerCase().includes('matrix')) {
      item.id = 603;
      changed = true;
    }
  }
  if (changed) writeJson(WATCHED_STORAGE_KEY, list);
}

export function getWatchedMovies(): WatchedMovie[] {
  runMigrationOnce(MATRIX_ID_MIGRATION_KEY, migrateLegacyMatrixId);
  return readJson<WatchedMovie[]>(WATCHED_STORAGE_KEY, []);
}

export function saveWatchedMovies(list: WatchedMovie[]): void {
  writeJson(WATCHED_STORAGE_KEY, list);
}

export function isMovieWatched(id: number, list?: WatchedMovie[]): boolean {
  const currentList = list || getWatchedMovies();
  return currentList.some((m) => m.id === id);
}

export function toggleMovieWatched(movie: {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average?: number;
}): { isNowWatched: boolean; updatedList: WatchedMovie[] } {
  const list = getWatchedMovies();
  const index = list.findIndex((m) => m.id === movie.id);

  if (index >= 0) {
    // Unmark
    list.splice(index, 1);
    saveWatchedMovies(list);
    return { isNowWatched: false, updatedList: list };
  }

  // Mark as watched
  const newItem: WatchedMovie = {
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path,
    release_date: movie.release_date || '',
    vote_average: movie.vote_average,
    dateWatched: new Date().toISOString(),
  };
  list.unshift(newItem);
  saveWatchedMovies(list);
  return { isNowWatched: true, updatedList: list };
}
