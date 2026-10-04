import { describe, it, expect } from 'vitest';
import { buildDiscoverParams, DEFAULT_FILTERS, isAbortError, regionForLanguage } from './tmdb';
import type { FilterState } from './tmdb';

const withFilters = (overrides: Partial<FilterState>): FilterState => ({ ...DEFAULT_FILTERS, ...overrides });

describe('buildDiscoverParams', () => {
  it('maps the default filters to a quality-gated Hollywood query', () => {
    const params = buildDiscoverParams(DEFAULT_FILTERS, 3, 'es');

    expect(params).toMatchObject({
      language: 'es',
      page: 3,
      sort_by: 'popularity.desc',
      with_original_language: 'en',
      with_origin_country: 'US',
      'primary_release_date.gte': '2005-01-01',
      'vote_average.gte': 6,
      'vote_average.lte': 9,
      'vote_count.gte': 50,
      'with_runtime.gte': 60,
    });
    // yearTo defaults to the current year, which means "no upper bound".
    expect(params['primary_release_date.lte']).toBeUndefined();
    // maxRuntime 300 means "300m+", so no upper bound either.
    expect(params['with_runtime.lte']).toBeUndefined();
    expect(params.with_genres).toBeUndefined();
  });

  it('requires a minimum vote count so 2-vote 9.0 movies stay out of the draw', () => {
    expect(buildDiscoverParams(withFilters({ minVotes: 200 }))['vote_count.gte']).toBe(200);
    expect(buildDiscoverParams(withFilters({ minVotes: 0 }))['vote_count.gte']).toBeUndefined();
  });

  it('joins several genres with OR', () => {
    expect(buildDiscoverParams(withFilters({ genreIds: [28, 12] })).with_genres).toBe('28|12');
  });

  it('drops the genre restriction entirely when "Otro" (id 0) is selected', () => {
    expect(buildDiscoverParams(withFilters({ genreIds: [0, 28] })).with_genres).toBeUndefined();
  });

  it('passes actor and director ids through', () => {
    const params = buildDiscoverParams(withFilters({ actorId: 287, directorId: 138 }));
    expect(params.with_cast).toBe(287);
    expect(params.with_crew).toBe(138);
  });

  it('bounds the release year on both ends when they are not the extremes', () => {
    const params = buildDiscoverParams(withFilters({ yearFrom: 1990, yearTo: 1999 }));
    expect(params['primary_release_date.gte']).toBe('1990-01-01');
    expect(params['primary_release_date.lte']).toBe('1999-12-31');
  });

  it('lets an explicit country override the industry selection', () => {
    expect(buildDiscoverParams(withFilters({ country: 'AR', selectedIndustries: ['hollywood'] })).with_origin_country).toBe('AR');
  });

  it('expands industries into their countries', () => {
    const params = buildDiscoverParams(withFilters({ selectedIndustries: ['argentina', 'latin'] }));
    expect(params.with_origin_country).toBe('AR|MX|BR|CL|CO|UY|PE');
  });

  it('applies no country filter when "others" is among the industries', () => {
    expect(buildDiscoverParams(withFilters({ selectedIndustries: ['hollywood', 'others'] })).with_origin_country).toBeUndefined();
  });

  it('excludes shorts by raising the minimum runtime to 45 unless shortFilms is selected', () => {
    expect(buildDiscoverParams(withFilters({ minRuntime: 10, selectedIndustries: ['hollywood'] }))['with_runtime.gte']).toBe(45);
    expect(buildDiscoverParams(withFilters({ minRuntime: 10, selectedIndustries: ['hollywood', 'shortFilms'] }))['with_runtime.gte']).toBe(10);
  });

  it('omits rating bounds at their extremes', () => {
    const params = buildDiscoverParams(withFilters({ minRating: 0, maxRating: 10 }));
    expect(params['vote_average.gte']).toBeUndefined();
    expect(params['vote_average.lte']).toBeUndefined();
  });
});

describe('isAbortError', () => {
  it('recognises the DOMException fetch throws on abort', () => {
    expect(isAbortError(new DOMException('aborted', 'AbortError'))).toBe(true);
    expect(isAbortError(new Error('TMDB_ERROR_500'))).toBe(false);
    expect(isAbortError('nope')).toBe(false);
  });
});

describe('regionForLanguage', () => {
  it('maps UI languages to the box office the marquee should show', () => {
    expect(regionForLanguage('es')).toBe('AR');
    expect(regionForLanguage('pt-BR')).toBe('BR');
    expect(regionForLanguage('en')).toBe('US');
    expect(regionForLanguage('fr')).toBe('US');
  });
});
