import { MOCK_MOVIES, MOCK_GENRES } from './mockMovies';

export interface Genre {
  id: number;
  name: string;
}

export interface MovieSummary {
  id: number;
  title: string;
  original_title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  overview: string;
  original_language: string;
  origin_country?: string[];
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
}

export interface VideoItem {
  key: string;
  site: string;
  type: string;
  name: string;
}

export interface WatchProviderEntry {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface WatchProvidersRegion {
  link?: string;
  flatrate?: WatchProviderEntry[];
  rent?: WatchProviderEntry[];
  buy?: WatchProviderEntry[];
}

export interface MovieDetails extends MovieSummary {
  genres: Genre[];
  runtime: number | null;
  tagline: string | null;
  status: string;
  budget: number;
  revenue: number;
  imdb_id?: string | null;
  credits?: {
    cast: CastMember[];
    crew: CrewMember[];
  };
  videos?: {
    results: VideoItem[];
  };
  'watch/providers'?: {
    results: Record<string, WatchProvidersRegion>;
  };
  recommendations?: {
    results: MovieSummary[];
  };
}

export interface PersonResult {
  id: number;
  name: string;
  known_for_department: string;
  profile_path: string | null;
}

export const ALL_INDUSTRY_KEYS = [
  'hollywood',
  'argentina',
  'espanol',
  'europeo',
  'asiatico',
  'latin',
  'shortFilms',
  'others',
];

export interface FilterState {
  genreIds: number[];
  actorId: number | null;
  actorName: string;
  directorId: number | null;
  directorName: string;
  yearFrom: number;
  yearTo: number;
  language: string;
  country: string;
  minRating: number;
  maxRating: number;
  // Minimum number of TMDB votes. A rating threshold alone lets through titles
  // rated 9.0 by two people, so this is what keeps the draw from landing on
  // obscure junk. 0 disables it.
  minVotes: number;
  minRuntime: number;
  maxRuntime: number;
  skipWatched: boolean;
  selectedIndustries: string[];
}

export const DEFAULT_FILTERS: FilterState = {
  genreIds: [],
  actorId: null,
  actorName: '',
  directorId: null,
  directorName: '',
  yearFrom: 2005,
  yearTo: new Date().getFullYear(),
  language: 'en',
  country: '',
  minRating: 6,
  maxRating: 9,
  minVotes: 50,
  minRuntime: 60,
  maxRuntime: 300,
  skipWatched: true,
  selectedIndustries: ['hollywood'],
};

export const OFFICIAL_DEMO_KEY =
  'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyNTQwMjhjMDFmYmQ0NzllZmI1ZmUxZjJjYjIxZDgwMyIsIm5iZiI6MTc4NTI5NDg4OS4xNCwic3ViIjoiNmE2OTcwMjljYmRlYjMwMTEzMjQwMmI5Iiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.0BT1Bj6_bkCipGn_etrrXOo5-skNLhkce1c7YMjZQr4';

const STORAGE_KEY_API = 'cyber_tmdb_api_key';

export function getStoredApiKey(): string {
  const customKey = localStorage.getItem(STORAGE_KEY_API);
  if (customKey && customKey.trim().length > 0) return customKey.trim();
  const envKey = import.meta.env.VITE_TMDB_API_KEY;
  if (envKey && envKey.trim().length > 0) return envKey.trim();
  // Default to official TMDB Bearer Token so catalog always works 100%
  return OFFICIAL_DEMO_KEY;
}

export function setStoredApiKey(key: string): void {
  localStorage.setItem(STORAGE_KEY_API, key.trim());
}

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

export function getImageUrl(path: string | null, size: 'w185' | 'w342' | 'w500' | 'original' = 'w500'): string {
  if (!path) return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=500&auto=format&fit=crop';
  if (path.startsWith('http')) return path; // Support direct URLs from mock items
  return `${IMAGE_BASE_URL}${size}${path}`;
}

/**
 * src/srcSet pair for grid cells (~200px wide): w342 is plenty at 1x and
 * w500 covers retina, instead of shipping w500 to everyone.
 */
export function getGridPosterSources(path: string | null): { src: string; srcSet: string } {
  const src = getImageUrl(path, 'w342');
  return { src, srcSet: `${src} 1x, ${getImageUrl(path, 'w500')} 2x` };
}

/** Finds the best YouTube trailer URL for a movie, if any was returned by TMDB. */
export function getTrailerVideo(details: MovieDetails): VideoItem | null {
  const results = details.videos?.results || [];
  const trailer =
    results.find((v) => v.site === 'YouTube' && v.type === 'Trailer') ||
    results.find((v) => v.site === 'YouTube' && v.type === 'Teaser');
  return trailer || null;
}

/**
 * Watch providers for a region, preferring the given country, falling back to
 * Argentina (the app's home audience) and then the US.
 */
export function getWatchProviders(details: MovieDetails, preferredCountry?: string): WatchProvidersRegion | null {
  const regions = details['watch/providers']?.results;
  if (!regions) return null;
  const candidates = [preferredCountry, 'AR', 'US'].filter(Boolean) as string[];
  for (const code of candidates) {
    const region = regions[code];
    if (region && (region.flatrate?.length || region.rent?.length || region.buy?.length)) {
      return region;
    }
  }
  return null;
}

export type TmdbParams = Record<string, string | number | boolean | undefined>;

/** True for the DOMException thrown by fetch when its AbortSignal fires. */
export function isAbortError(err: unknown): boolean {
  return err instanceof Error && err.name === 'AbortError';
}

async function tmdbFetch<T>(endpoint: string, params: TmdbParams = {}, signal?: AbortSignal): Promise<T> {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  const queryParams = new URLSearchParams();
  const headers: Record<string, string> = {};

  // Support both TMDB v4 Bearer Read Access Tokens (JWT starting with eyJ) and v3 API Keys
  if (apiKey.startsWith('eyJ')) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  } else {
    queryParams.append('api_key', apiKey);
  }

  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      queryParams.append(key, String(val));
    }
  });

  const url = `${TMDB_BASE_URL}${endpoint}?${queryParams.toString()}`;
  const response = await fetch(url, { headers, signal });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('INVALID_API_KEY');
    }
    throw new Error(`TMDB_ERROR_${response.status}`);
  }

  return response.json() as Promise<T>;
}

// In-memory cache for genres
let genresCache: Record<string, Genre[]> = {};

const OTHER_GENRE_NAME: Record<string, string> = { en: 'Other', pt: 'Outro', es: 'Otro' };

export async function fetchGenres(language: string = 'es'): Promise<Genre[]> {
  const langKey = MOCK_GENRES[language] ? language : 'es';
  const otherName = OTHER_GENRE_NAME[language] || OTHER_GENRE_NAME.es;
  if (genresCache[language]) return genresCache[language];
  try {
    const data = await tmdbFetch<{ genres: Genre[] }>('/genre/movie/list', { language });
    if (data.genres && data.genres.length > 0) {
      const list = data.genres.map((g) => {
        if (language === 'es' && (g.id === 53 || g.name.toLowerCase() === 'suspense')) {
          return { ...g, name: 'Suspenso' };
        }
        return g;
      });
      if (!list.some((g) => g.id === 0)) {
        list.push({ id: 0, name: otherName });
      }
      genresCache[language] = list;
      return list;
    }
    return MOCK_GENRES[langKey] || MOCK_GENRES.es;
  } catch (err) {
    return MOCK_GENRES[langKey] || MOCK_GENRES.es;
  }
}

export async function searchPerson(query: string, language: string = 'es'): Promise<PersonResult[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const data = await tmdbFetch<{ results: PersonResult[] }>('/search/person', {
      query: query.trim(),
      language,
    });
    return data.results.slice(0, 8);
  } catch (err) {
    return [];
  }
}

export interface DiscoverResponse {
  page: number;
  results: MovieSummary[];
  total_pages: number;
  total_results: number;
  isMockFallback?: boolean;
}

/**
 * Filter mock collection when TMDB API key is missing or invalid
 */
function getMockDiscoverResponse(filters: FilterState): DiscoverResponse {
  let filtered = MOCK_MOVIES.filter((movie) => {
    const year = Number(movie.release_date.split('-')[0] || 0);
    if (filters.yearFrom && year < filters.yearFrom) return false;
    if (filters.yearTo && year > filters.yearTo) return false;
    if (filters.minRating && movie.vote_average < filters.minRating) return false;
    if (filters.maxRating !== undefined && filters.maxRating < 10 && movie.vote_average > filters.maxRating) return false;
    if (filters.minVotes > 0 && movie.vote_count < filters.minVotes) return false;
    if (filters.language && movie.original_language !== filters.language) return false;
    if (filters.country && movie.origin_country && !movie.origin_country.includes(filters.country)) return false;
    if (filters.directorId) {
      const hasDirector = movie.credits?.crew?.some(
        (c) => c.job === 'Director' && (c.id === filters.directorId || c.name.toLowerCase().includes(filters.directorName.toLowerCase()))
      );
      if (!hasDirector) return false;
    }
    if (filters.genreIds.length > 0) {
      const includesOtro = filters.genreIds.includes(0);
      const standardGids = filters.genreIds.filter((id) => id !== 0);
      const hasGenre =
        (standardGids.length > 0 && standardGids.some((gid) => movie.genre_ids.includes(gid))) ||
        (includesOtro && (!movie.genre_ids || movie.genre_ids.length === 0));
      if (!hasGenre) return false;
    }
    return true;
  });

  return {
    page: 1,
    results: filtered,
    total_pages: 1,
    total_results: filtered.length,
    isMockFallback: true,
  };
}

/**
 * Translates the panel's FilterState into TMDB /discover/movie query params.
 * Pure function, so the mapping rules can be unit-tested without network.
 */
export function buildDiscoverParams(filters: FilterState, page: number = 1, language: string = 'es'): TmdbParams {
  const params: TmdbParams = {
    language,
    page,
    sort_by: 'popularity.desc',
  };

  if (filters.genreIds.length > 0) {
    const includesOtro = filters.genreIds.includes(0);
    const standardGids = filters.genreIds.filter((id) => id !== 0);

    // If 'Otro' is selected (or if all standard genres + 'Otro' are selected),
    // we omit the restrictive with_genres filter so unclassified / 100% of 1,000,000+ movies are included!
    if (!includesOtro && standardGids.length < 19) {
      params.with_genres = standardGids.join('|');
    }
  }
  if (filters.actorId) {
    params.with_cast = filters.actorId;
  }
  if (filters.directorId) {
    params.with_crew = filters.directorId;
  }
  const currentYear = new Date().getFullYear();
  if (filters.yearFrom && filters.yearFrom > 1900) {
    const formattedYearFrom = Math.max(1, filters.yearFrom).toString().padStart(4, '0');
    params['primary_release_date.gte'] = `${formattedYearFrom}-01-01`;
  }
  if (filters.yearTo && filters.yearTo < currentYear) {
    const formattedYearTo = filters.yearTo.toString().padStart(4, '0');
    params['primary_release_date.lte'] = `${formattedYearTo}-12-31`;
  }
  if (filters.language) {
    params.with_original_language = filters.language;
  }

  // Country filtering logic combining country dropdown and selected industries
  if (filters.country) {
    params.with_origin_country = filters.country;
  } else if (filters.selectedIndustries && filters.selectedIndustries.length < ALL_INDUSTRY_KEYS.length) {
    const countryMap: Record<string, string[]> = {
      hollywood: ['US'],
      argentina: ['AR'],
      espanol: ['ES'],
      europeo: ['FR', 'IT', 'DE', 'GB', 'SE', 'DK', 'NL', 'BE', 'PL'],
      asiatico: ['JP', 'KR', 'IN', 'CN', 'HK', 'TW'],
      latin: ['MX', 'BR', 'CL', 'CO', 'UY', 'PE'],
    };

    const targetCountries = new Set<string>();
    filters.selectedIndustries.forEach((ind) => {
      if (countryMap[ind]) {
        countryMap[ind].forEach((c) => targetCountries.add(c));
      }
    });

    if (targetCountries.size > 0 && !filters.selectedIndustries.includes('others')) {
      params.with_origin_country = Array.from(targetCountries).join('|');
    }
  }

  // Short films & runtime logic
  const hasShorts = !filters.selectedIndustries || filters.selectedIndustries.includes('shortFilms');
  let effectiveMinRuntime = filters.minRuntime || 0;
  if (!hasShorts && effectiveMinRuntime < 45) {
    effectiveMinRuntime = 45; // Exclude short films if shortFilms checkbox is unchecked
  }

  if (filters.minRating > 0) {
    params['vote_average.gte'] = filters.minRating;
  }
  if (filters.maxRating < 10) {
    params['vote_average.lte'] = filters.maxRating;
  }
  if (filters.minVotes > 0) {
    params['vote_count.gte'] = filters.minVotes;
  }
  if (effectiveMinRuntime > 0) {
    params['with_runtime.gte'] = effectiveMinRuntime;
  }
  if (filters.maxRuntime < 300) {
    params['with_runtime.lte'] = filters.maxRuntime;
  }

  return params;
}

export async function discoverMovies(
  filters: FilterState,
  page: number = 1,
  language: string = 'es',
  signal?: AbortSignal
): Promise<DiscoverResponse> {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    return getMockDiscoverResponse(filters);
  }

  try {
    return await tmdbFetch<DiscoverResponse>('/discover/movie', buildDiscoverParams(filters, page, language), signal);
  } catch (err) {
    // A cancelled request must not be mistaken for an outage and served from the demo catalog.
    if (isAbortError(err)) throw err;
    console.warn('TMDB API request failed. Falling back to local demo catalog.', err);
    return getMockDiscoverResponse(filters);
  }
}

/**
 * Free-text title search ("la lupa"). Unlike discoverMovies, TMDB's /search/movie
 * endpoint does not accept genre/rating/runtime/etc. filters — it only matches on title.
 */
function getMockSearchResponse(query: string): DiscoverResponse {
  const lowered = query.trim().toLowerCase();
  const filtered = MOCK_MOVIES.filter((movie) => movie.title.toLowerCase().includes(lowered));
  return {
    page: 1,
    results: filtered,
    total_pages: 1,
    total_results: filtered.length,
    isMockFallback: true,
  };
}

export async function searchMovies(
  query: string,
  page: number = 1,
  language: string = 'es',
  signal?: AbortSignal
): Promise<DiscoverResponse> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { page: 1, results: [], total_pages: 1, total_results: 0 };
  }

  const apiKey = getStoredApiKey();
  if (!apiKey) {
    return getMockSearchResponse(trimmed);
  }

  try {
    return await tmdbFetch<DiscoverResponse>(
      '/search/movie',
      { query: trimmed, page, language, include_adult: false },
      signal
    );
  } catch (err) {
    if (isAbortError(err)) throw err;
    console.warn('TMDB search request failed. Falling back to local demo catalog.', err);
    return getMockSearchResponse(trimmed);
  }
}

/** Country whose box office the marquee should reflect for a UI language. */
export function regionForLanguage(language: string): string {
  const map: Record<string, string> = { es: 'AR', pt: 'BR', en: 'US' };
  return map[language.split('-')[0]] || 'US';
}

/** Movies currently in theaters ("Nuevas" marquee row). Returns [] on any failure — caller falls back to a welcome phrase. */
export async function fetchNowPlayingMovies(language: string = 'es', region: string = regionForLanguage(language)): Promise<MovieSummary[]> {
  try {
    const data = await tmdbFetch<DiscoverResponse>('/movie/now_playing', { language, region, page: 1 });
    return data.results || [];
  } catch (err) {
    console.warn('TMDB now_playing request failed.', err);
    return [];
  }
}

/** Popular movies on TMDB ("Recomendadas" marquee row). Returns [] on any failure. */
export async function fetchPopularMovies(language: string = 'es', region: string = regionForLanguage(language)): Promise<MovieSummary[]> {
  try {
    const data = await tmdbFetch<DiscoverResponse>('/movie/popular', { language, region, page: 1 });
    return data.results || [];
  } catch (err) {
    console.warn('TMDB popular request failed.', err);
    return [];
  }
}

export async function fetchMovieDetails(id: number, language: string = 'es'): Promise<MovieDetails> {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    const mock = MOCK_MOVIES.find((m) => m.id === id);
    if (mock) return mock;
  }

  try {
    let details = await tmdbFetch<MovieDetails>(`/movie/${id}`, {
      language,
      append_to_response: 'credits,videos,watch/providers,recommendations',
    });

    // 1. Fallback to English overview if Spanish overview is missing/empty
    if (!details.overview || details.overview.trim().length === 0) {
      try {
        const enDetails = await tmdbFetch<MovieDetails>(`/movie/${id}`, { language: 'en-US' });
        if (enDetails.overview && enDetails.overview.trim().length > 0) {
          details.overview = enDetails.overview;
        }
      } catch {
        // ignore
      }
    }

    // Still empty: the UI builds a synopsis from the metadata in its own language
    // (RouletteModal), so nothing hardcoded in Spanish leaks in here.

    return details;
  } catch (err) {
    const mock = MOCK_MOVIES.find((m) => m.id === id);
    if (mock) return mock;
    throw err;
  }
}

/**
 * Random Draw ("Sortear") Algorithm:
 * 1. Discover total pages with active filters.
 * 2. Pick a random page number between 1 and min(total_pages, 500).
 * 3. Fetch that page and pick a random movie from the results.
 * 4. Fetch full details for the movie.
 * 5. If already watched and skipWatched is true, redraw (up to 5 retries).
 */
export async function performRandomDraw(
  filters: FilterState,
  watchedMovieIds: Set<number>,
  language: string = 'es',
  retryCount: number = 0,
  searchQuery: string = '',
  // Injectable so a shared seed can make everyone draw the same movie.
  rng: () => number = Math.random
): Promise<MovieDetails | null> {
  const trimmedQuery = searchQuery.trim();
  const fetchPage = (page: number) =>
    trimmedQuery ? searchMovies(trimmedQuery, page, language) : discoverMovies(filters, page, language);

  const initial = await fetchPage(1);

  if (!initial || initial.results.length === 0) {
    return null;
  }

  const maxPages = Math.min(initial.total_pages, 500);
  const randomPage = Math.floor(rng() * maxPages) + 1;

  let targetPageResults = initial.results;
  if (randomPage !== 1 && !initial.isMockFallback) {
    try {
      const pageData = await fetchPage(randomPage);
      if (pageData.results.length > 0) {
        targetPageResults = pageData.results;
      }
    } catch {
      targetPageResults = initial.results;
    }
  }

  const randomIndex = Math.floor(rng() * targetPageResults.length);
  const selectedMovieSummary = targetPageResults[randomIndex];

  if (filters.skipWatched && watchedMovieIds.has(selectedMovieSummary.id) && retryCount < 5) {
    return performRandomDraw(filters, watchedMovieIds, language, retryCount + 1, searchQuery, rng);
  }

  return fetchMovieDetails(selectedMovieSummary.id, language);
}
