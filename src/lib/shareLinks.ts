import { DEFAULT_FILTERS } from './tmdb';
import type { FilterState } from './tmdb';

// URL state for things worth sharing in the Discord: a movie's details
// (?movie=603) and a "sorteo de la noche" (?seed=ABC123&f=<filters>&q=<search>).

export const MOVIE_PARAM = 'movie';
export const PLAYER_PARAM = 'player';
export const SEED_PARAM = 'seed';
export const FILTERS_PARAM = 'f';
export const QUERY_PARAM = 'q';

export type PlayerProvider = 'vidking' | 'playimdb' | 'torrentio' | 'cinejoy' | 'trailer';

export const SERVER_DISPLAY_NAMES: Record<PlayerProvider, string> = {
  vidking: 'VidKing',
  cinejoy: 'CineJoy',
  playimdb: 'PlayIMDB',
  torrentio: 'Stremio / Torrentio',
  trailer: 'Tráiler',
};

export interface NightDrawLink {
  seed: string;
  filters: FilterState;
  searchQuery: string;
}

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(text: string): string {
  const padded = text.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (text.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** Only the filters that differ from the defaults, so links stay short. */
export function encodeFilters(filters: FilterState): string {
  const diff: Partial<FilterState> = {};
  (Object.keys(filters) as (keyof FilterState)[]).forEach((key) => {
    if (JSON.stringify(filters[key]) !== JSON.stringify(DEFAULT_FILTERS[key])) {
      (diff as Record<string, unknown>)[key] = filters[key];
    }
  });
  return toBase64Url(JSON.stringify(diff));
}

export function decodeFilters(encoded: string): FilterState | null {
  try {
    const diff = JSON.parse(fromBase64Url(encoded));
    if (!diff || typeof diff !== 'object' || Array.isArray(diff)) return null;
    const known = new Set(Object.keys(DEFAULT_FILTERS));
    const safe: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(diff)) {
      if (known.has(key)) safe[key] = value;
    }
    return { ...DEFAULT_FILTERS, ...safe } as FilterState;
  } catch {
    return null;
  }
}

export function buildMovieLink(
  movieId: number,
  modeOrBase: 'details' | 'player' | string = 'details',
  provider?: PlayerProvider,
  baseParam?: string
): string {
  let mode: 'details' | 'player' = 'details';
  let base: string = typeof window !== 'undefined' ? window.location.origin : 'https://cinemaroulette.vercel.app';

  if (typeof modeOrBase === 'string' && (modeOrBase.startsWith('http') || modeOrBase.startsWith('/'))) {
    base = modeOrBase;
  } else if (modeOrBase === 'player' || modeOrBase === 'details') {
    mode = modeOrBase;
    if (baseParam) base = baseParam;
  }

  const origin = base.endsWith('/') ? base.slice(0, -1) : base;
  const url = new URL(`${origin}/m/${movieId}`);
  if (mode === 'player' && provider) {
    url.searchParams.set(PLAYER_PARAM, provider);
  }
  return url.toString();
}

export function buildShareText({
  title,
  year,
  rating,
  genres = [],
  shareUrl,
  mode = 'details',
  provider = 'vidking',
}: {
  title: string;
  year?: string;
  rating?: number;
  genres?: string[];
  shareUrl: string;
  mode?: 'details' | 'player';
  provider?: PlayerProvider;
}): string {
  const yearSuffix = year ? ` (${year})` : '';
  const ratingLine = rating && rating > 0 ? `⭐ ${rating.toFixed(1)}/10` : null;

  if (mode === 'player') {
    const serverName = SERVER_DISPLAY_NAMES[provider] || provider;
    return [
      `🍿 Ver "${title}${yearSuffix}" en ${serverName} | CinemaRoulette 24HS`,
      ratingLine,
      `▶ Enlace directo al reproductor:`,
      shareUrl,
    ]
      .filter(Boolean)
      .join('\n');
  }

  const genresLine = genres.length > 0 ? genres.join(', ') : null;
  return [
    `🎰 ${title}${yearSuffix}`,
    ratingLine,
    genresLine,
    `🎬 Ficha en CinemaRoulette 24HS:`,
    shareUrl,
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildNightDrawLink(link: NightDrawLink, base: string = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://cinemaroulette.vercel.app/'): string {
  const params = new URLSearchParams();
  params.set(SEED_PARAM, link.seed);
  params.set(FILTERS_PARAM, encodeFilters(link.filters));
  if (link.searchQuery.trim()) params.set(QUERY_PARAM, link.searchQuery.trim());
  return `${base}?${params.toString()}`;
}

export interface ParsedAppUrl {
  movieId: number | null;
  mode: 'details' | 'player';
  player: PlayerProvider;
  nightDraw: NightDrawLink | null;
}

export function parseAppUrl(search: string, pathname: string = ''): ParsedAppUrl {
  const params = new URLSearchParams(search);

  let movieId: number | null = null;
  const pathMatch = pathname.match(/^\/(?:m|movie)\/(\d+)/i);
  if (pathMatch) {
    movieId = parseInt(pathMatch[1], 10);
  }

  if (!movieId) {
    const movieRaw = params.get(MOVIE_PARAM) || params.get('id') || params.get('sorteo');
    movieId = movieRaw && /^\d+$/.test(movieRaw) ? parseInt(movieRaw, 10) : null;
  }

  const playerRaw = params.get(PLAYER_PARAM) || params.get('server');
  const validProviders: PlayerProvider[] = ['vidking', 'cinejoy', 'playimdb', 'torrentio', 'trailer'];
  const player: PlayerProvider = playerRaw && validProviders.includes(playerRaw as PlayerProvider)
    ? (playerRaw as PlayerProvider)
    : 'vidking';
  const mode: 'details' | 'player' = playerRaw ? 'player' : 'details';

  const seed = params.get(SEED_PARAM)?.trim().toUpperCase() || '';
  let nightDraw: NightDrawLink | null = null;
  if (/^[A-Z0-9]{3,16}$/.test(seed)) {
    const filters = (params.get(FILTERS_PARAM) && decodeFilters(params.get(FILTERS_PARAM)!)) || DEFAULT_FILTERS;
    nightDraw = { seed, filters, searchQuery: params.get(QUERY_PARAM) || '' };
  }
  return { movieId, mode, player, nightDraw };
}

/** Rewrites the address bar without adding history entries. */
export function replaceUrlParams(updates: Record<string, string | null>): void {
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries(updates)) {
    if (value === null) url.searchParams.delete(key);
    else url.searchParams.set(key, value);
  }
  window.history.replaceState(null, '', url.toString());
}
