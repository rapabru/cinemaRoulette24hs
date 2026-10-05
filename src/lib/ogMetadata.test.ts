import { describe, it, expect, vi } from 'vitest';
import {
  isBotUserAgent,
  escapeHtml,
  formatOgTitle,
  formatOgDescription,
  generateBotHtml,
  injectOgTagsIntoHtml,
  fetchMovieOgData,
} from './ogMetadata';
import type { MovieOgData } from './ogMetadata';

describe('ogMetadata', () => {
  describe('isBotUserAgent', () => {
    it('detects Discordbot as bot', () => {
      expect(isBotUserAgent('Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)')).toBe(true);
    });

    it('detects WhatsApp and Facebook crawlers as bot', () => {
      expect(isBotUserAgent('WhatsApp/2.21.12.21 A')).toBe(true);
      expect(isBotUserAgent('facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)')).toBe(true);
    });

    it('detects Twitterbot and TelegramBot as bot', () => {
      expect(isBotUserAgent('Twitterbot/1.0')).toBe(true);
      expect(isBotUserAgent('TelegramBot (like TwitterBot)')).toBe(true);
    });

    it('detects Slackbot and Applebot as bot', () => {
      expect(isBotUserAgent('Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)')).toBe(true);
      expect(isBotUserAgent('Applebot/0.1; +http://www.apple.com/go/applebot')).toBe(true);
    });

    it('identifies standard human browsers as non-bots', () => {
      expect(
        isBotUserAgent(
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )
      ).toBe(false);
      expect(
        isBotUserAgent(
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        )
      ).toBe(false);
      expect(
        isBotUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0')
      ).toBe(false);
      expect(isBotUserAgent(null)).toBe(false);
      expect(isBotUserAgent(undefined)).toBe(false);
      expect(isBotUserAgent('')).toBe(false);
    });
  });

  describe('escapeHtml', () => {
    it('escapes &, <, >, " and single quotes', () => {
      expect(escapeHtml('Tom & Jerry <"The Movie"> \'2024\'')).toBe(
        'Tom &amp; Jerry &lt;&quot;The Movie&quot;&gt; &#039;2024&#039;'
      );
    });
  });

  describe('formatOgTitle', () => {
    it('formats title with year and rating', () => {
      const title = formatOgTitle({
        title: 'Transformers',
        year: '2007',
        voteAverage: 6.8,
      });
      expect(title).toBe('Transformers (2007) ⭐ 6.8/10 — Cybercafé 24hs');
    });

    it('handles missing year or rating gracefully', () => {
      const title = formatOgTitle({
        title: 'Película Desconocida',
      });
      expect(title).toBe('Película Desconocida — Cybercafé 24hs');
    });
  });

  describe('formatOgDescription', () => {
    it('includes provider name, rating, duration, genres and overview', () => {
      const desc = formatOgDescription({
        overview: 'Sam Witwicky descubre que su auto es un robot alienígena.',
        genres: ['Acción', 'Ciencia ficción'],
        runtime: 144,
        voteAverage: 6.8,
        year: '2007',
        providerName: 'cinejoy.to',
      });
      expect(desc).toContain('▶ Ver en cinejoy.to');
      expect(desc).toContain('⭐ 6.8/10');
      expect(desc).toContain('⏱ 144 min');
      expect(desc).toContain('🎬 Acción, Ciencia ficción');
      expect(desc).toContain('Sam Witwicky descubre');
    });

    it('falls back to default text when overview is empty', () => {
      const desc = formatOgDescription({
        genres: ['Comedia'],
      });
      expect(desc).toContain('Descubrí esta película en Cybercafé 24hs');
    });
  });

  describe('generateBotHtml', () => {
    const mockData: MovieOgData = {
      id: 17334,
      title: 'Al otro lado de la línea',
      originalTitle: 'The Other End of the Line',
      year: '2007',
      voteAverage: 6.5,
      voteCount: 193,
      runtime: 106,
      genres: ['Comedia', 'Romance'],
      overview: 'Una empleada de un centro de llamadas viaja a San Francisco.',
      imageUrl: 'https://image.tmdb.org/t/p/w1280/kDACJi8eHur78ycoIc7L8fE6zlG.jpg',
      hasBackdrop: true,
      provider: 'cinejoy',
      providerName: 'cinejoy.to',
    };

    it('generates valid HTML with all required OpenGraph and Twitter Card tags', () => {
      const html = generateBotHtml(mockData, 'https://cinemaroulette.vercel.app/?movie=17334&player=cinejoy');

      expect(html).toContain('<meta property="og:title"');
      expect(html).toContain('Al otro lado de la línea (2007) ⭐ 6.5/10 — Cybercafé 24hs');
      expect(html).toContain('<meta property="og:image" content="https://image.tmdb.org/t/p/w1280/kDACJi8eHur78ycoIc7L8fE6zlG.jpg"');
      expect(html).toContain('<meta name="twitter:card" content="summary_large_image"');
      expect(html).toContain('<meta property="og:type" content="video.movie"');
      expect(html).toContain('▶ Ver en cinejoy.to');
    });
  });

  describe('injectOgTagsIntoHtml', () => {
    const sampleHtml = `<!doctype html>
<html>
<head>
  <title>CYBERCAFÉ 24HS — Movie Roulette</title>
  <meta name="description" content="Sorteá tu próxima película: filtros avanzados..." />
  <meta property="og:title" content="CYBERCAFÉ 24HS — Movie Roulette" />
  <meta property="og:description" content="Sorteá tu próxima película..." />
  <meta property="og:image" content="https://cinemaroulette.vercel.app/icons/og-image.png" />
  <meta property="og:url" content="https://cinemaroulette.vercel.app/" />
  <meta name="twitter:title" content="CYBERCAFÉ 24HS" />
  <meta name="twitter:description" content="Sorteá..." />
  <meta name="twitter:image" content="https://cinemaroulette.vercel.app/icons/og-image.png" />
</head>
<body><div id="root"></div></body>
</html>`;

    it('replaces placeholder title and meta tags with movie details', () => {
      const data: MovieOgData = {
        id: 999,
        title: 'Matrix',
        originalTitle: 'The Matrix',
        year: '1999',
        voteAverage: 8.7,
        voteCount: 20000,
        runtime: 136,
        genres: ['Acción', 'Ciencia ficción'],
        overview: 'Un hacker aprende la verdad sobre su realidad.',
        imageUrl: 'https://image.tmdb.org/t/p/w1280/matrix-backdrop.jpg',
        hasBackdrop: true,
      };

      const result = injectOgTagsIntoHtml(sampleHtml, data, 'https://cinemaroulette.vercel.app/?movie=999');

      expect(result).toContain('<title>Matrix (1999) ⭐ 8.7/10 — Cybercafé 24hs</title>');
      expect(result).toContain('<meta property="og:title" content="Matrix (1999) ⭐ 8.7/10 — Cybercafé 24hs" />');
      expect(result).toContain('<meta property="og:image" content="https://image.tmdb.org/t/p/w1280/matrix-backdrop.jpg" />');
      expect(result).toContain('<meta property="og:url" content="https://cinemaroulette.vercel.app/?movie=999" />');
      expect(result).toContain('<meta name="twitter:title" content="Matrix (1999) ⭐ 8.7/10 — Cybercafé 24hs" />');
    });
  });

  describe('fetchMovieOgData', () => {
    it('fetches movie metadata from TMDB and falls back to English when Spanish synopsis is missing', async () => {
      const mockFetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('language=es-ES')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              id: 17334,
              title: 'Al otro lado de la línea',
              release_date: '2007-03-23',
              vote_average: 6.5,
              vote_count: 193,
              runtime: 106,
              genres: [{ id: 35, name: 'Comedia' }],
              overview: '', // Empty in Spanish
              backdrop_path: '/kDACJi8eHur78ycoIc7L8fE6zlG.jpg',
            }),
          });
        }
        if (url.includes('language=en-US')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              overview: 'English synopsis from TMDB.',
            }),
          });
        }
        return Promise.reject(new Error('Unknown url'));
      });

      const data = await fetchMovieOgData(17334, 'cinejoy', 'dummy-key', mockFetch as any);

      expect(data).not.toBeNull();
      expect(data?.id).toBe(17334);
      expect(data?.title).toBe('Al otro lado de la línea');
      expect(data?.year).toBe('2007');
      expect(data?.overview).toBe('English synopsis from TMDB.');
      expect(data?.imageUrl).toBe('https://image.tmdb.org/t/p/w1280/kDACJi8eHur78ycoIc7L8fE6zlG.jpg');
      expect(data?.providerName).toBe('cinejoy.to');
    });
  });
});
