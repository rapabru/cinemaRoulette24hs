import { describe, it, expect, beforeEach } from 'vitest';
import { installMemoryStorage } from './test-utils';
import { DEFAULT_FILTERS, buildDiscoverRequest, mediaKey, normalizeTvItem } from './tmdb';
import { buildPlayerUrls } from './players';
import { buildMovieLink, parseAppUrl } from './shareLinks';
import { getWatchlist, toggleWatchlist } from './watchlist';
import { toggleMovieWatched } from './watched';
import { buildBackup, parseBackup, importBackup } from './backup';

describe('series discover request', () => {
  it('uses /discover/tv with air dates and without cast, crew or runtime filters', () => {
    const { endpoint, params } = buildDiscoverRequest(
      { ...DEFAULT_FILTERS, contentType: 'series', yearFrom: 2010, yearTo: 2015, actorId: 1, directorId: 2 },
      3
    );
    expect(endpoint).toBe('/discover/tv');
    expect(params.page).toBe(3);
    expect(params['first_air_date.gte']).toBe('2010-01-01');
    expect(params['first_air_date.lte']).toBe('2015-12-31');
    expect(params['primary_release_date.gte']).toBeUndefined();
    expect(params.with_cast).toBeUndefined();
    expect(params.with_crew).toBeUndefined();
    expect(params['with_runtime.gte']).toBeUndefined();
    expect(params['vote_average.gte']).toBe(DEFAULT_FILTERS.minRating);
  });

  it('keeps movies on /discover/movie untouched', () => {
    const { endpoint, params } = buildDiscoverRequest(DEFAULT_FILTERS);
    expect(endpoint).toBe('/discover/movie');
    expect(params['with_runtime.gte']).toBe(DEFAULT_FILTERS.minRuntime);
  });

  it('maps series fields onto the movie-shaped ones', () => {
    const item = normalizeTvItem({ id: 1399, name: 'Game of Thrones', original_name: 'GoT', first_air_date: '2011-04-17' });
    expect(item).toMatchObject({ title: 'Game of Thrones', original_title: 'GoT', release_date: '2011-04-17', media_type: 'tv' });
  });
});

describe('mediaKey', () => {
  it('keeps movie keys as bare ids (old data) and separates series', () => {
    expect(mediaKey({ id: 603 })).toBe('603');
    expect(mediaKey({ id: 603, media_type: 'movie' })).toBe('603');
    expect(mediaKey({ id: 603, media_type: 'tv' })).toBe('tv:603');
  });
});

describe('player urls', () => {
  it('builds movie urls as before', () => {
    const urls = buildPlayerUrls({ id: 603, imdb_id: 'tt0133093', title: 'The Matrix' });
    expect(urls.vidking).toBe('https://www.vidking.net/embed/movie/603?color=35E6FF');
    expect(urls.cinejoy).toBe('https://cinejoy.to/watch/movie/603');
    expect(urls.stremio).toBe('stremio://detail/movie/tt0133093/tt0133093');
  });

  it('points series servers at the chosen episode', () => {
    const urls = buildPlayerUrls(
      { id: 1396, media_type: 'tv', imdb_id: 'tt0903747', title: 'Breaking Bad' },
      { season: 2, episode: 5 }
    );
    expect(urls.vidking).toContain('/embed/tv/1396/2/5');
    expect(urls.cinejoy).toBe('https://cinejoy.to/watch/tv/1396');
    expect(urls.stremio).toBe('stremio://detail/series/tt0903747/tt0903747:2:5');
    expect(urls.playimdb).toBe('https://www.playimdb.com/es-es/title/tt0903747/');
  });

  it('defaults series to S1E1', () => {
    expect(buildPlayerUrls({ id: 1396, media_type: 'tv', title: 'Breaking Bad' }).vidking).toContain('/embed/tv/1396/1/1');
  });
});

describe('series share links', () => {
  it('round-trips type, season and episode', () => {
    const link = buildMovieLink(1396, 'player', 'vidking', 'https://cinemaroulette.vercel.app', 'tv', { season: 2, episode: 5 });
    expect(link).toBe('https://cinemaroulette.vercel.app/m/1396?type=tv&player=vidking&s=2&e=5');
    const url = new URL(link);
    expect(parseAppUrl(url.search, url.pathname)).toMatchObject({
      movieId: 1396,
      mediaType: 'tv',
      episode: { season: 2, episode: 5 },
      mode: 'player',
      player: 'vidking',
    });
  });

  it('leaves movie links unchanged', () => {
    expect(buildMovieLink(603, 'details', undefined, 'https://cinemaroulette.vercel.app')).toBe(
      'https://cinemaroulette.vercel.app/m/603'
    );
    expect(parseAppUrl('', '/m/603')).toMatchObject({ mediaType: 'movie', episode: null });
  });
});

describe('watchlist ("Mi lista")', () => {
  beforeEach(() => {
    installMemoryStorage();
  });

  it('toggles items newest first, keeping a movie and a series with the same id apart', () => {
    toggleWatchlist({ id: 603, title: 'The Matrix', poster_path: null, release_date: '1999-03-31' });
    const { isNowInList } = toggleWatchlist({ id: 603, title: 'Some Show', poster_path: null, release_date: '', media_type: 'tv' });
    expect(isNowInList).toBe(true);
    expect(getWatchlist().map(mediaKey)).toEqual(['tv:603', '603']);

    const removed = toggleWatchlist({ id: 603, title: 'The Matrix', poster_path: null, release_date: '' });
    expect(removed.isNowInList).toBe(false);
    expect(getWatchlist().map(mediaKey)).toEqual(['tv:603']);
  });

  it('does not let a series id mark the movie with that id as watched', () => {
    toggleMovieWatched({ id: 1399, title: 'Movie', poster_path: null, release_date: '' });
    const { isNowWatched } = toggleMovieWatched({ id: 1399, title: 'Series', poster_path: null, release_date: '', media_type: 'tv' });
    expect(isNowWatched).toBe(true);
  });

  it('travels in backups, and old backups without it still import', () => {
    toggleWatchlist({ id: 1, title: 'Local', poster_path: null, release_date: '' });
    const backup = buildBackup();
    expect(backup.watchlist.map((m) => m.id)).toEqual([1]);

    const incoming = parseBackup({
      ...backup,
      watchlist: [...backup.watchlist, { id: 2, title: 'Remote', poster_path: null, release_date: '', media_type: 'tv', dateAdded: '' }],
    })!;
    expect(importBackup(incoming).watchlistAdded).toBe(1);

    const { watchlist: _omitted, ...legacy } = backup;
    expect(parseBackup(legacy)?.watchlist).toEqual([]);
  });
});
