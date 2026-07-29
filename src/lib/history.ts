export interface DrawnHistoryItem {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average?: number;
  drawnAt: string;
}

const HISTORY_STORAGE_KEY = 'cyber_movie_roulette_draw_history_v1';

export function getDrawnHistory(): DrawnHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const list: DrawnHistoryItem[] = JSON.parse(raw);
    let changed = false;
    list.forEach((item) => {
      if (item.id === 102 || item.title.toLowerCase().includes('matrix')) {
        item.id = 603;
        changed = true;
      }
    });
    if (changed) saveDrawnHistory(list);
    return list;
  } catch (err) {
    console.error('Error reading draw history from localStorage:', err);
    return [];
  }
}

export function saveDrawnHistory(list: DrawnHistoryItem[]): void {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Error saving draw history to localStorage:', err);
  }
}

export function addMovieToHistory(movie: {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average?: number;
}): DrawnHistoryItem[] {
  const list = getDrawnHistory();
  
  // Prepend new drawn movie (limit history to last 100 items)
  const newItem: DrawnHistoryItem = {
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path,
    release_date: movie.release_date || '',
    vote_average: movie.vote_average,
    drawnAt: new Date().toISOString(),
  };

  // Remove existing duplicate if drawn again
  const filtered = list.filter((item) => item.id !== movie.id);
  const updated = [newItem, ...filtered].slice(0, 100);
  
  saveDrawnHistory(updated);
  return updated;
}

export function clearDrawnHistory(): void {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (err) {
    console.error('Error clearing draw history:', err);
  }
}
