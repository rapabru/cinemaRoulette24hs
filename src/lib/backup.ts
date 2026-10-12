import { getWatchedMovies, saveWatchedMovies } from './watched';
import type { WatchedMovie } from './watched';
import { getDrawnHistory, saveDrawnHistory } from './history';
import type { DrawnHistoryItem } from './history';
import { getPresets, savePreset } from './presets';
import { getWatchlist, saveWatchlist } from './watchlist';
import type { WatchlistItem } from './watchlist';
import { mediaKey } from './tmdb';
import type { FilterPreset } from './presets';

// Everything the app remembers lives in this browser's localStorage. A backup
// file is the honest way to carry it to another browser or device.

export interface BackupFile {
  app: 'cybercafe24hs';
  version: 1;
  exportedAt: string;
  watched: WatchedMovie[];
  history: DrawnHistoryItem[];
  presets: FilterPreset[];
  // Added after v1 shipped; older backup files simply don't have it.
  watchlist: WatchlistItem[];
}

export interface ImportSummary {
  watchedAdded: number;
  watchlistAdded: number;
  historyAdded: number;
  presetsAdded: number;
}

export function buildBackup(): BackupFile {
  return {
    app: 'cybercafe24hs',
    version: 1,
    exportedAt: new Date().toISOString(),
    watched: getWatchedMovies(),
    history: getDrawnHistory(),
    presets: getPresets(),
    watchlist: getWatchlist(),
  };
}

export function backupFilename(date: Date = new Date()): string {
  return `cybercafe24hs-backup-${date.toISOString().slice(0, 10)}.json`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

/** Validates the parsed JSON loosely: wrong app/version or missing arrays → null. */
export function parseBackup(json: unknown): BackupFile | null {
  if (!isRecord(json) || json.app !== 'cybercafe24hs' || json.version !== 1) return null;
  const watched = Array.isArray(json.watched) ? (json.watched as WatchedMovie[]) : [];
  const history = Array.isArray(json.history) ? (json.history as DrawnHistoryItem[]) : [];
  const presets = Array.isArray(json.presets) ? (json.presets as FilterPreset[]) : [];
  const watchlist = Array.isArray(json.watchlist) ? (json.watchlist as WatchlistItem[]) : [];
  const validId = (item: { id?: unknown }) => typeof item?.id === 'number';
  return {
    app: 'cybercafe24hs',
    version: 1,
    exportedAt: typeof json.exportedAt === 'string' ? json.exportedAt : '',
    watched: watched.filter(validId),
    history: history.filter(validId),
    presets: presets.filter((p) => typeof p?.name === 'string' && isRecord(p.filters)),
    watchlist: watchlist.filter(validId),
  };
}

/**
 * Merges a backup into the current data without duplicating: an entry already
 * present locally is kept as-is (local wins), new ones are added. History is
 * re-sorted newest first and capped like addMovieToHistory does.
 */
export function importBackup(backup: BackupFile): ImportSummary {
  const watched = getWatchedMovies();
  const watchedKeys = new Set(watched.map(mediaKey));
  const newWatched = backup.watched.filter((m) => !watchedKeys.has(mediaKey(m)));
  if (newWatched.length > 0) saveWatchedMovies([...watched, ...newWatched]);

  const watchlist = getWatchlist();
  const watchlistKeys = new Set(watchlist.map(mediaKey));
  const newWatchlist = backup.watchlist.filter((m) => !watchlistKeys.has(mediaKey(m)));
  if (newWatchlist.length > 0) saveWatchlist([...watchlist, ...newWatchlist]);

  const history = getDrawnHistory();
  const historyKeys = new Set(history.map(mediaKey));
  const newHistory = backup.history.filter((m) => !historyKeys.has(mediaKey(m)));
  if (newHistory.length > 0) {
    const merged = [...history, ...newHistory]
      .sort((a, b) => (b.drawnAt || '').localeCompare(a.drawnAt || ''))
      .slice(0, 100);
    saveDrawnHistory(merged);
  }

  const presetNames = new Set(getPresets().map((p) => p.name));
  const newPresets = backup.presets.filter((p) => !presetNames.has(p.name));
  newPresets.forEach((p) => savePreset(p.name, p.filters));

  return {
    watchedAdded: newWatched.length,
    watchlistAdded: newWatchlist.length,
    historyAdded: newHistory.length, presetsAdded: newPresets.length,
  };
}
