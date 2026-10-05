import {
  isBotUserAgent,
  fetchMovieOgData,
  generateBotHtml,
  injectOgTagsIntoHtml,
} from '../src/lib/ogMetadata';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const movieId = url.searchParams.get('movie');
  const player = url.searchParams.get('player');
  const userAgent = request.headers.get('user-agent') || '';

  // If no valid movie ID provided, pass through to standard index.html
  if (!movieId || !/^\d+$/.test(movieId)) {
    return fetch(new URL('/index.html', request.url));
  }

  // Fetch movie data from TMDB
  const data = await fetchMovieOgData(movieId, player);

  // If movie wasn't found or TMDB failed, serve standard index.html
  if (!data) {
    return fetch(new URL('/index.html', request.url));
  }

  const isBot = isBotUserAgent(userAgent);

  // If requested by a crawler/bot (Discord, WhatsApp, Twitter, etc.), return lightweight, rich HTML
  if (isBot) {
    const botHtml = generateBotHtml(data, url.toString(), false);
    return new Response(botHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  }

  // If requested by a human visitor in a browser, inject tags into the real SPA index.html
  try {
    const indexRes = await fetch(new URL('/index.html', request.url));
    if (indexRes.ok) {
      const baseHtml = await indexRes.text();
      const enrichedHtml = injectOgTagsIntoHtml(baseHtml, data, url.toString());
      return new Response(enrichedHtml, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      });
    }
  } catch (err) {
    console.error('Failed to fetch and inject base index.html:', err);
  }

  // Fallback for human browsers if base index.html fetch fails: serve bot HTML with instant client redirect
  const fallbackHtml = generateBotHtml(data, url.toString(), true);
  return new Response(fallbackHtml, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
