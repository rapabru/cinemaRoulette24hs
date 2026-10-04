import { DEFAULT_FILTERS } from './tmdb';
import type { FilterState } from './tmdb';

// URL state for things worth sharing in the Discord: a movie's details
// (?movie=603) and a "sorteo de la noche" (?seed=ABC123&f=<filters>&q=<search>).

export const MOVIE_PARAM = 'movie';
export const SEED_PARAM = 'seed';
export const FILTERS_PARAM = 'f';
export const QUERY_PARAM = 'q';

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

export function buildMovieLink(movieId: number, base: string = window.location.origin + window.location.pathname): string {
  return `${base}?${MOVIE_PARAM}=${movieId}`;
}

export function buildNightDrawLink(link: NightDrawLink, base: string = window.location.origin + window.location.pathname): string {
  const params = new URLSearchParams();
  params.set(SEED_PARAM, link.seed);
  params.set(FILTERS_PARAM, encodeFilters(link.filters));
  if (link.searchQuery.trim()) params.set(QUERY_PARAM, link.searchQuery.trim());
  return `${base}?${params.toString()}`;
}

export interface ParsedAppUrl {
  movieId: number | null;
  nightDraw: NightDrawLink | null;
}

export function parseAppUrl(search: string): ParsedAppUrl {
  const params = new URLSearchParams(search);
  const movieRaw = params.get(MOVIE_PARAM);
  const movieId = movieRaw && /^\d+$/.test(movieRaw) ? parseInt(movieRaw, 10) : null;

  const seed = params.get(SEED_PARAM)?.trim().toUpperCase() || '';
  let nightDraw: NightDrawLink | null = null;
  if (/^[A-Z0-9]{3,16}$/.test(seed)) {
    const filters = (params.get(FILTERS_PARAM) && decodeFilters(params.get(FILTERS_PARAM)!)) || DEFAULT_FILTERS;
    nightDraw = { seed, filters, searchQuery: params.get(QUERY_PARAM) || '' };
  }
  return { movieId, nightDraw };
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
