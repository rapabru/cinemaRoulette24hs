import { describe, it, expect, vi, beforeEach } from 'vitest';
import handler from './og';

describe('Vercel Edge API /api/og', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns rich OpenGraph HTML for bot user-agents when movie param is provided', async () => {
    // Mock global fetch for TMDB and index.html
    const mockFetch = vi.fn().mockImplementation((url: string | URL) => {
      const urlStr = url.toString();
      if (urlStr.includes('api.themoviedb.org')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              id: 17334,
              title: 'Al otro lado de la línea',
              release_date: '2007-03-23',
              vote_average: 6.5,
              vote_count: 193,
              runtime: 106,
              genres: [{ id: 35, name: 'Comedia' }],
              overview: 'Una divertida comedia romántica.',
              backdrop_path: '/kDACJi8eHur78ycoIc7L8fE6zlG.jpg',
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          )
        );
      }
      return Promise.resolve(new Response('<html><body>Index</body></html>', { status: 200 }));
    });
    vi.stubGlobal('fetch', mockFetch);

    const request = new Request('https://cinemaroulette.vercel.app/?movie=17334&player=cinejoy', {
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)',
      },
    });

    const response = await handler(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/html');
    const html = await response.text();
    expect(html).toContain('Al otro lado de la línea (2007) ⭐ 6.5/10 — Cybercafé 24hs');
    expect(html).toContain('https://image.tmdb.org/t/p/w1280/kDACJi8eHur78ycoIc7L8fE6zlG.jpg');
    expect(html).toContain('▶ Ver en cinejoy.to');
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image">');
  });

  it('serves enriched index.html to human browsers', async () => {
    const mockIndexHtml = `<!doctype html>
<html>
<head>
  <title>CYBERCAFÉ 24HS — Movie Roulette</title>
  <meta name="description" content="Sorteá tu próxima película..." />
  <meta property="og:title" content="CYBERCAFÉ 24HS — Movie Roulette" />
  <meta property="og:image" content="https://cinemaroulette.vercel.app/icons/og-image.png" />
  <meta property="og:url" content="https://cinemaroulette.vercel.app/" />
  <meta name="twitter:title" content="CYBERCAFÉ 24HS" />
  <meta name="twitter:image" content="https://cinemaroulette.vercel.app/icons/og-image.png" />
</head>
<body><div id="root"></div></body>
</html>`;

    const mockFetch = vi.fn().mockImplementation((url: string | URL) => {
      const urlStr = url.toString();
      if (urlStr.includes('api.themoviedb.org')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              id: 999,
              title: 'Inception',
              release_date: '2010-07-16',
              vote_average: 8.4,
              genres: [{ id: 878, name: 'Sci-Fi' }],
              overview: 'Dom Cobb ladrón de sueños.',
              backdrop_path: '/inception-backdrop.jpg',
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          )
        );
      }
      if (urlStr.includes('/index.html')) {
        return Promise.resolve(
          new Response(mockIndexHtml, {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          })
        );
      }
      return Promise.reject(new Error(`Unexpected fetch: ${urlStr}`));
    });
    vi.stubGlobal('fetch', mockFetch);

    const request = new Request('https://cinemaroulette.vercel.app/?movie=999', {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      },
    });

    const response = await handler(request);

    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain('<title>Inception (2010) ⭐ 8.4/10 — Cybercafé 24hs</title>');
    expect(html).toContain('https://image.tmdb.org/t/p/w1280/inception-backdrop.jpg');
    expect(html).toContain('<div id="root"></div>');
  });

  it('passes through to index.html when no movie ID is given', async () => {
    const mockFetch = vi.fn().mockImplementation(() => {
      return Promise.resolve(new Response('Standard Home', { status: 200 }));
    });
    vi.stubGlobal('fetch', mockFetch);

    const request = new Request('https://cinemaroulette.vercel.app/', {
      headers: { 'user-agent': 'Discordbot' },
    });

    const response = await handler(request);
    expect(response.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledWith(expect.objectContaining({ pathname: '/index.html' }));
  });
});
