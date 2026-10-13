import type { MediaType } from './tmdb';
import type { EpisodeRef } from './shareLinks';

// Where each player server lives for a movie or for one episode of a series.
// Kept free of React so the URL rules can be unit-tested.

export interface PlayerTarget {
  id: number;
  media_type?: MediaType;
  imdb_id?: string | null;
  title: string;
}

// Servers that can only be opened in a new tab (their site can't be framed and
// has no TMDB-keyed page). To add one: add its id here and an entry below; the
// toolbar, share links, Open Graph names and validation pick it up from here.
export const EXTERNAL_SERVER_IDS = ['cinearar'] as const;
export type ExternalServerId = (typeof EXTERNAL_SERVER_IDS)[number];

export interface ExternalServer {
  name: string;
  // Neon token from index.css (without the var wrapper) for its button and card.
  accent: 'neon-red-glow';
  buildUrl: (target: PlayerTarget, episode?: EpisodeRef | null) => string;
}

export const EXTERNAL_SERVERS: Record<ExternalServerId, ExternalServer> = {
  // cine.ar (ARSAT) doesn't index titles by TMDB id, so the link is a search
  // restricted to its player domain rather than a direct title page.
  cinearar: {
    name: 'cine.ar',
    accent: 'neon-red-glow',
    buildUrl: (target) =>
      `https://www.google.com/search?q=${encodeURIComponent(`site:play.cine.ar ${target.title}`)}`,
  },
};

export function isExternalServerId(value: string): value is ExternalServerId {
  return (EXTERNAL_SERVER_IDS as readonly string[]).includes(value);
}

export interface PlayerUrls {
  cinejoy: string;
  vidking: string;
  playimdb: string;
  // Fallback for PlayIMDB when there's no IMDb id to build its page from.
  playimdbDirect: string;
  stremio: string | null;
}

export function buildPlayerUrls(target: PlayerTarget, episode: EpisodeRef | null = null): PlayerUrls {
  const isSeries = target.media_type === 'tv';
  const imdbId = target.imdb_id || null;
  const ep = isSeries ? episode ?? { season: 1, episode: 1 } : null;

  const vidking = ep
    ? `https://www.vidking.net/embed/tv/${target.id}/${ep.season}/${ep.episode}?color=35E6FF&nextEpisode=true&episodeSelector=true`
    : `https://www.vidking.net/embed/movie/${target.id}?color=35E6FF`;

  // PlayIMDB mirrors IMDb's title pages, so a series page works the same way
  // as a movie's; the episode is picked inside its own player.
  const playimdb = imdbId
    ? `https://www.playimdb.com/es-es/title/${imdbId}/`
    : isSeries
      ? `https://www.google.com/search?q=playimdb+${encodeURIComponent(target.title)}`
      : `https://www.playimdb.com/title/tt${target.id}/`;

  const playimdbDirect = imdbId
    ? `https://www.playimdb.com/es-es/title/${imdbId}/`
    : `https://www.google.com/search?q=playimdb+${encodeURIComponent(target.title)}`;

  const stremio = imdbId
    ? ep
      ? `stremio://detail/series/${imdbId}/${imdbId}:${ep.season}:${ep.episode}`
      : `stremio://detail/movie/${imdbId}/${imdbId}`
    : null;

  return {
    cinejoy: `https://cinejoy.to/watch/${isSeries ? 'tv' : 'movie'}/${target.id}`,
    vidking,
    playimdb,
    playimdbDirect,
    stremio,
  };
}
