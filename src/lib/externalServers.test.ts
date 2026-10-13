import { describe, it, expect } from 'vitest';
import { EXTERNAL_SERVERS, EXTERNAL_SERVER_IDS, isExternalServerId } from './players';
import { SERVER_DISPLAY_NAMES, buildMovieLink, parseAppUrl } from './shareLinks';

describe('external servers registry', () => {
  it('recognises only registered ids', () => {
    expect(isExternalServerId('cinearar')).toBe(true);
    expect(isExternalServerId('vidking')).toBe(false);
    expect(isExternalServerId('nope')).toBe(false);
  });

  it('builds a site-restricted search for cine.ar from the title', () => {
    const url = EXTERNAL_SERVERS.cinearar.buildUrl({ id: 1, title: 'El secreto de sus ojos' });
    expect(url.startsWith('https://www.google.com/search?q=')).toBe(true);
    expect(decodeURIComponent(url.split('q=')[1])).toBe('site:play.cine.ar El secreto de sus ojos');
  });

  it('exposes display names derived from the registry', () => {
    EXTERNAL_SERVER_IDS.forEach((id) => {
      expect(SERVER_DISPLAY_NAMES[id]).toBe(EXTERNAL_SERVERS[id].name);
    });
  });

  it('parses ?player=cinearar as a player link that opens cine.ar first', () => {
    const parsed = parseAppUrl('?player=cinearar', '/m/550');
    expect(parsed.movieId).toBe(550);
    expect(parsed.mode).toBe('player');
    expect(parsed.player).toBe('cinearar');
  });

  it('round-trips a cine.ar share link', () => {
    const link = buildMovieLink(550, 'player', 'cinearar', 'https://example.test', 'movie');
    const parsed = parseAppUrl(new URL(link).search, new URL(link).pathname);
    expect(parsed.player).toBe('cinearar');
    expect(parsed.mode).toBe('player');
  });

  it('still falls back to vidking for unknown servers', () => {
    expect(parseAppUrl('?player=pelisjuanita', '/m/550').player).toBe('vidking');
  });
});
