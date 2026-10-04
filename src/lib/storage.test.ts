import { describe, it, expect, beforeEach, vi } from 'vitest';
import { installMemoryStorage } from './test-utils';
import { readJson, writeJson, runMigrationOnce } from './storage';
import { getWatchedMovies, toggleMovieWatched } from './watched';
import { getDrawnHistory, addMovieToHistory, clearDrawnHistory } from './history';

let store: Map<string, string>;
beforeEach(() => {
  store = installMemoryStorage();
});

describe('storage helpers', () => {
  it('round-trips JSON and falls back on corrupted values', () => {
    writeJson('k', { a: 1 });
    expect(readJson('k', null)).toEqual({ a: 1 });
    store.set('k', '{not json');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(readJson('k', 'fallback')).toBe('fallback');
  });

  it('runs a migration exactly once', () => {
    const migrate = vi.fn();
    runMigrationOnce('m1', migrate);
    runMigrationOnce('m1', migrate);
    expect(migrate).toHaveBeenCalledTimes(1);
    expect(store.get('m1')).toBe('done');
  });

  it('retries a migration that threw', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const migrate = vi.fn(() => { throw new Error('boom'); });
    runMigrationOnce('m2', migrate);
    runMigrationOnce('m2', migrate);
    expect(migrate).toHaveBeenCalledTimes(2);
    expect(store.get('m2')).toBeUndefined();
  });
});

describe('watched list', () => {
  it('remaps the legacy Matrix id once, not on every read', () => {
    store.set('cyber_movie_roulette_watched_v1', JSON.stringify([{ id: 102, title: 'Matrix', poster_path: null, release_date: '', dateWatched: '' }]));
    expect(getWatchedMovies()[0].id).toBe(603);
    // A later write with the old id is left alone: the migration is done.
    store.set('cyber_movie_roulette_watched_v1', JSON.stringify([{ id: 102, title: 'Matrix', poster_path: null, release_date: '', dateWatched: '' }]));
    expect(getWatchedMovies()[0].id).toBe(102);
  });

  it('toggles a movie in and out, newest first', () => {
    const m = { id: 1, title: 'A', poster_path: null, release_date: '2020-01-01' };
    expect(toggleMovieWatched(m).isNowWatched).toBe(true);
    toggleMovieWatched({ ...m, id: 2, title: 'B' });
    expect(getWatchedMovies().map((x) => x.id)).toEqual([2, 1]);
    expect(toggleMovieWatched(m).isNowWatched).toBe(false);
    expect(getWatchedMovies().map((x) => x.id)).toEqual([2]);
  });
});

describe('draw history', () => {
  it('prepends, dedupes and caps at 100', () => {
    for (let i = 1; i <= 105; i++) addMovieToHistory({ id: i, title: `M${i}`, poster_path: null, release_date: '' });
    addMovieToHistory({ id: 50, title: 'M50 again', poster_path: null, release_date: '' });
    const ids = getDrawnHistory().map((x) => x.id);
    expect(ids.length).toBe(100);
    expect(ids[0]).toBe(50);
    expect(ids.filter((id) => id === 50).length).toBe(1);
    clearDrawnHistory();
    expect(getDrawnHistory()).toEqual([]);
  });
});
