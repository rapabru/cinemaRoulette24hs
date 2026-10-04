import { describe, it, expect } from 'vitest';
import { buildShareUrl, buildShareText, parseMovieDeepLink } from './share';

describe('buildShareUrl', () => {
  it('builds a clean details URL for a movie', () => {
    const url = buildShareUrl({
      origin: 'https://cinemaroulette.vercel.app',
      pathname: '/',
      movieId: 550,
      mode: 'details',
    });
    expect(url).toBe('https://cinemaroulette.vercel.app/?movie=550');
  });

  it('builds a direct player URL with provider', () => {
    const url = buildShareUrl({
      origin: 'https://cinemaroulette.vercel.app',
      pathname: '/',
      movieId: 680,
      mode: 'player',
      provider: 'torrentio',
    });
    expect(url).toBe('https://cinemaroulette.vercel.app/?movie=680&player=torrentio');
  });
});

describe('buildShareText', () => {
  it('formats share text for movie details with rating and genres', () => {
    const text = buildShareText({
      title: 'Fight Club',
      year: '1999',
      rating: 8.4,
      genres: ['Drama', 'Thriller'],
      shareUrl: 'https://cinemaroulette.vercel.app/?movie=550',
      mode: 'details',
    });

    expect(text).toContain('Fight Club (1999)');
    expect(text).toContain('⭐ 8.4/10');
    expect(text).toContain('Drama, Thriller');
    expect(text).toContain('https://cinemaroulette.vercel.app/?movie=550');
  });

  it('formats share text for direct player streaming', () => {
    const text = buildShareText({
      title: 'Pulp Fiction',
      year: '1994',
      rating: 8.5,
      shareUrl: 'https://cinemaroulette.vercel.app/?movie=680&player=vidking',
      mode: 'player',
      provider: 'vidking',
    });

    expect(text).toContain('🍿 Ver "Pulp Fiction (1994)" en VidKing');
    expect(text).toContain('⭐ 8.5/10');
    expect(text).toContain('https://cinemaroulette.vercel.app/?movie=680&player=vidking');
  });
});

describe('parseMovieDeepLink', () => {
  it('parses ?movie=123 into details mode', () => {
    const parsed = parseMovieDeepLink('?movie=550');
    expect(parsed).toEqual({
      movieId: 550,
      mode: 'details',
      provider: 'vidking',
    });
  });

  it('parses ?id=550 and ?sorteo=550 as aliases', () => {
    expect(parseMovieDeepLink('?id=550').movieId).toBe(550);
    expect(parseMovieDeepLink('?sorteo=550').movieId).toBe(550);
  });

  it('parses ?movie=680&player=playimdb into player mode with playimdb provider', () => {
    const parsed = parseMovieDeepLink('?movie=680&player=playimdb');
    expect(parsed).toEqual({
      movieId: 680,
      mode: 'player',
      provider: 'playimdb',
    });
  });

  it('parses ?server=torrentio alias into torrentio provider', () => {
    const parsed = parseMovieDeepLink('?movie=680&server=torrentio');
    expect(parsed).toEqual({
      movieId: 680,
      mode: 'player',
      provider: 'torrentio',
    });
  });

  it('returns null movieId when query string has no movie id', () => {
    const parsed = parseMovieDeepLink('?other=stuff');
    expect(parsed.movieId).toBeNull();
  });
});
