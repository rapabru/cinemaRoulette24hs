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
  yearFrom: 1900,
  yearTo: new Date().getFullYear(),
  language: '',
  country: '',
  minRating: 6,
  maxRating: 10,
  minRuntime: 60,
  maxRuntime: 300,
  skipWatched: true,
  selectedIndustries: ['hollywood', 'argentina', 'espanol', 'europeo', 'latin'],
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

async function tmdbFetch<T>(endpoint: string, params: Record<string, string | number | boolean | undefined> = {}): Promise<T> {
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
  const response = await fetch(url, { headers });

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

export async function fetchGenres(language: string = 'es'): Promise<Genre[]> {
  const langKey = language === 'en' ? 'en' : 'es';
  const otherName = language === 'en' ? 'Other' : 'Otro';
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

export async function discoverMovies(
  filters: FilterState,
  page: number = 1,
  language: string = 'es'
): Promise<DiscoverResponse> {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    return getMockDiscoverResponse(filters);
  }

  const params: Record<string, string | number | boolean | undefined> = {
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
  if (effectiveMinRuntime > 0) {
    params['with_runtime.gte'] = effectiveMinRuntime;
  }
  if (filters.maxRuntime < 300) {
    params['with_runtime.lte'] = filters.maxRuntime;
  }

  try {
    return await tmdbFetch<DiscoverResponse>('/discover/movie', params);
  } catch (err) {
    console.warn('TMDB API request failed. Falling back to local demo catalog.', err);
    return getMockDiscoverResponse(filters);
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
      append_to_response: 'credits',
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

    // 2. Smart generated synopsis if overview is still empty
    if (!details.overview || details.overview.trim().length === 0) {
      const year = details.release_date ? details.release_date.split('-')[0] : '';
      const genreNames = details.genres?.map((g) => g.name).join(', ') || 'Cine';
      const director = details.credits?.crew?.find((c) => c.job === 'Director')?.name;
      const castNames = details.credits?.cast?.slice(0, 3).map((c) => c.name).join(', ');

      let generated = `Producción audiovisual del género ${genreNames}`;
      if (year) generated += ` lanzada en el año ${year}`;
      if (director) generated += `, dirigida por ${director}`;
      if (castNames) generated += ` con las actuaciones de ${castNames}`;
      generated += `. Una propuesta cinematográfica imprescindible en la colección global de TMDB.`;

      details.overview = generated;
    }

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
  retryCount: number = 0
): Promise<MovieDetails | null> {
  const initial = await discoverMovies(filters, 1, language);

  if (!initial || initial.results.length === 0) {
    return null;
  }

  const maxPages = Math.min(initial.total_pages, 500);
  const randomPage = Math.floor(Math.random() * maxPages) + 1;

  let targetPageResults = initial.results;
  if (randomPage !== 1 && !initial.isMockFallback) {
    try {
      const pageData = await discoverMovies(filters, randomPage, language);
      if (pageData.results.length > 0) {
        targetPageResults = pageData.results;
      }
    } catch {
      targetPageResults = initial.results;
    }
  }

  const randomIndex = Math.floor(Math.random() * targetPageResults.length);
  const selectedMovieSummary = targetPageResults[randomIndex];

  if (filters.skipWatched && watchedMovieIds.has(selectedMovieSummary.id) && retryCount < 5) {
    return performRandomDraw(filters, watchedMovieIds, language, retryCount + 1);
  }

  return fetchMovieDetails(selectedMovieSummary.id, language);
}
