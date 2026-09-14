import { describe, it, expect, beforeEach } from 'vitest';
import { installMemoryStorage } from './test-utils';
import { createSeededRng, hashString, generateSeed } from './seededRandom';
import { encodeFilters, decodeFilters, parseAppUrl, buildNightDrawLink, buildMovieLink } from './shareLinks';
import { buildBackup, parseBackup, importBackup } from './backup';
import { DEFAULT_FILTERS } from './tmdb';
import { toggleMovieWatched, getWatchedMovies } from './watched';
import { addMovieToHistory, getDrawnHistory } from './history';
import { getPresets } from './presets';

describe('seeded random', () => {
  it('is deterministic for the same seed and different across seeds', () => {
    const a = createSeededRng('ABC123:2026-09-14');
    const b = createSeededRng('ABC123:2026-09-14');
    const c = createSeededRng('XYZ789:2026-09-14');
    const seqA = [a(), a(), a()];
    expect(seqA).toEqual([b(), b(), b()]);
    expect(seqA).not.toEqual([c(), c(), c()]);
    seqA.forEach((n) => expect(n >= 0 && n < 1).toBe(true));
  });

  it('hashes strings stably', () => {
    expect(hashString('matrix')).toBe(hashString('matrix'));
    expect(hashString('matrix')).not.toBe(hashString('Matrix'));
  });

  it('generates readable seeds of the requested length', () => {
    const seed = generateSeed(6);
    expect(seed).toMatch(/^[A-HJ-NP-Z2-9]{6}$/);
  });
});

describe('share links', () => {
  it('encodes only the filters that differ from the defaults, and decodes them back', () => {
    const filters = { ...DEFAULT_FILTERS, genreIds: [27, 53], minRating: 7, actorName: 'Nicolas Cage' };
    const encoded = encodeFilters(filters);
    expect(encoded.length).toBeLessThan(120);
    expect(decodeFilters(encoded)).toEqual(filters);
    expect(decodeFilters('%%%not-base64')).toBeNull();
  });

  it('ignores unknown keys when decoding so a crafted link cannot inject fields', () => {
    const encoded = btoa(JSON.stringify({ minRating: 8, evil: true }));
    const decoded = decodeFilters(encoded)!;
    expect(decoded.minRating).toBe(8);
    expect('evil' in decoded).toBe(false);
  });

  it('parses movie and night-draw params from a URL', () => {
    expect(parseAppUrl('?movie=603')).toMatchObject({ movieId: 603, nightDraw: null });
    expect(parseAppUrl('?movie=abc').movieId).toBeNull();

    const link = buildNightDrawLink({ seed: 'abc123', filters: { ...DEFAULT_FILTERS, minRating: 7 }, searchQuery: 'matrix' }, 'https://x.test/');
    const parsed = parseAppUrl(new URL(link).search);
    expect(parsed.nightDraw).toEqual({ seed: 'ABC123', filters: { ...DEFAULT_FILTERS, minRating: 7 }, searchQuery: 'matrix' });
    expect(parseAppUrl('?seed=!!').nightDraw).toBeNull();
    expect(buildMovieLink(603, 'https://x.test/')).toBe('https://x.test/?movie=603');
  });
});

describe('backup', () => {
  beforeEach(() => {
    installMemoryStorage();
  });

  it('round-trips and merges without duplicating (local wins)', () => {
    toggleMovieWatched({ id: 1, title: 'Local', poster_path: null, release_date: '' });
    addMovieToHistory({ id: 10, title: 'H10', poster_path: null, release_date: '' });
    const backup = buildBackup();
    expect(backup.app).toBe('cybercafe24hs');

    const incoming = parseBackup({
      ...backup,
      watched: [...backup.watched, { id: 2, title: 'Remote', poster_path: null, release_date: '', dateWatched: '2020-01-01T00:00:00Z' }, { id: 'bad' }],
      history: [{ id: 11, title: 'H11', poster_path: null, release_date: '', drawnAt: '2030-01-01T00:00:00Z' }],
      presets: [{ name: 'Terror', filters: { genreIds: [27] } }, { name: 'broken' }],
    })!;
    const summary = importBackup(incoming);

    expect(summary).toEqual({ watchedAdded: 1, historyAdded: 1, presetsAdded: 1 });
    expect(getWatchedMovies().map((m) => m.id).sort()).toEqual([1, 2]);
    expect(getDrawnHistory().map((m) => m.id)).toEqual([11, 10]);
    expect(getPresets().map((p) => p.name)).toEqual(['Terror']);
    // Importing the same backup again adds nothing.
    expect(importBackup(incoming)).toEqual({ watchedAdded: 0, historyAdded: 0, presetsAdded: 0 });
  });

  it('rejects files from other apps or versions', () => {
    expect(parseBackup({ app: 'other', version: 1 })).toBeNull();
    expect(parseBackup({ app: 'cybercafe24hs', version: 2 })).toBeNull();
    expect(parseBackup('nope')).toBeNull();
  });
});
