export interface WatchedMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average?: number;
  dateWatched: string;
}

const WATCHED_STORAGE_KEY = 'cyber_movie_roulette_watched_v1';

export function getWatchedMovies(): WatchedMovie[] {
  try {
    const raw = localStorage.getItem(WATCHED_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading watched list from localStorage:', err);
    return [];
  }
}

export function saveWatchedMovies(list: WatchedMovie[]): void {
  try {
    localStorage.setItem(WATCHED_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Error saving watched list to localStorage:', err);
  }
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
  } else {
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
}
