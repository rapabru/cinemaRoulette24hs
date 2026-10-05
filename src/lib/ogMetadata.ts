import { OFFICIAL_DEMO_KEY } from './tmdb';

export interface MovieOgData {
  id: number;
  title: string;
  originalTitle: string;
  year: string;
  voteAverage: number;
  voteCount: number;
  runtime: number | null;
  genres: string[];
  overview: string;
  imageUrl: string;
  hasBackdrop: boolean;
  provider?: string | null;
  providerName?: string | null;
}

const PROVIDER_NAMES: Record<string, string> = {
  cinejoy: 'cinejoy.to',
  vidking: 'VidKing',
  playimdb: 'PlayIMDB',
  torrentio: 'Torrentio (Stremio)',
  trailer: 'Tráiler Oficial',
};

const BOT_USER_AGENTS_REGEX =
  /bot|crawl|spider|facebookexternalhit|whatsapp|telegram|twitter|discord|slack|preview|embed|applebot|skypeuripreview|linkedin|vkshare|quora/i;

export function isBotUserAgent(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  return BOT_USER_AGENTS_REGEX.test(userAgent);
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function getProviderDisplayName(providerKey?: string | null): string | null {
  if (!providerKey) return null;
  const lower = providerKey.toLowerCase();
  return PROVIDER_NAMES[lower] || providerKey;
}

export function formatOgTitle(data: {
  title: string;
  year?: string;
  voteAverage?: number;
  providerName?: string | null;
}): string {
  const yearSuffix = data.year ? ` (${data.year})` : '';
  const ratingSuffix = data.voteAverage && data.voteAverage > 0 ? ` ⭐ ${data.voteAverage.toFixed(1)}/10` : '';
  return `${data.title}${yearSuffix}${ratingSuffix} — Cybercafé 24hs`;
}

export function formatOgDescription(data: {
  overview?: string;
  genres?: string[];
  runtime?: number | null;
  voteAverage?: number;
  year?: string;
  providerName?: string | null;
}): string {
  const sections: string[] = [];

  if (data.providerName) {
    sections.push(`▶ Ver en ${data.providerName}`);
  }

  const metaItems: string[] = [];
  if (data.voteAverage && data.voteAverage > 0) {
    metaItems.push(`⭐ ${data.voteAverage.toFixed(1)}/10`);
  }
  if (data.year) {
    metaItems.push(`📅 ${data.year}`);
  }
  if (data.runtime && data.runtime > 0) {
    metaItems.push(`⏱ ${data.runtime} min`);
  }
  if (data.genres && data.genres.length > 0) {
    metaItems.push(`🎬 ${data.genres.slice(0, 3).join(', ')}`);
  }

  if (metaItems.length > 0) {
    sections.push(metaItems.join(' • '));
  }

  if (data.overview && data.overview.trim().length > 0) {
    const trimmed = data.overview.trim();
    sections.push(trimmed.length > 280 ? `${trimmed.slice(0, 277)}...` : trimmed);
  } else {
    sections.push('Descubrí esta película en Cybercafé 24hs — Sorteos aleatorios, filtros avanzados y streaming.');
  }

  return sections.join('\n\n');
}

export async function fetchMovieOgData(
  movieId: number | string,
  providerKey?: string | null,
  apiKey?: string,
  fetchFn: typeof fetch = fetch
): Promise<MovieOgData | null> {
  const token = apiKey || OFFICIAL_DEMO_KEY;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  };

  try {
    const res = await fetchFn(`https://api.themoviedb.org/3/movie/${movieId}?language=es-ES`, { headers });
    if (!res.ok) return null;

    const data = await res.json();
    let overview = data.overview || '';

    // If Spanish synopsis is empty, fallback to English
    if (!overview.trim()) {
      try {
        const enRes = await fetchFn(`https://api.themoviedb.org/3/movie/${movieId}?language=en-US`, { headers });
        if (enRes.ok) {
          const enData = await enRes.json();
          if (enData.overview && enData.overview.trim()) {
            overview = enData.overview.trim();
          }
        }
      } catch {
        // ignore fallback error
      }
    }

    const year = data.release_date ? data.release_date.slice(0, 4) : '';
    const genres = Array.isArray(data.genres) ? data.genres.map((g: any) => g.name).filter(Boolean) : [];
    const hasBackdrop = Boolean(data.backdrop_path);
    const imageUrl = data.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}`
      : data.poster_path
        ? `https://image.tmdb.org/t/p/w780${data.poster_path}`
        : 'https://cinemaroulette.vercel.app/icons/og-image.png';

    const providerName = getProviderDisplayName(providerKey);

    return {
      id: Number(data.id),
      title: data.title || data.original_title || 'Película',
      originalTitle: data.original_title || '',
      year,
      voteAverage: Number(data.vote_average) || 0,
      voteCount: Number(data.vote_count) || 0,
      runtime: data.runtime ?? null,
      genres,
      overview,
      imageUrl,
      hasBackdrop,
      provider: providerKey || null,
      providerName,
    };
  } catch (err) {
    console.error(`Failed to fetch TMDB OG data for movie ${movieId}:`, err);
    return null;
  }
}

export function generateBotHtml(data: MovieOgData, canonicalUrl: string, addRedirectScript = false): string {
  const ogTitle = formatOgTitle({
    title: data.title,
    year: data.year,
    voteAverage: data.voteAverage,
    providerName: data.providerName,
  });

  const ogDescription = formatOgDescription({
    overview: data.overview,
    genres: data.genres,
    runtime: data.runtime,
    voteAverage: data.voteAverage,
    year: data.year,
    providerName: data.providerName,
  });

  const escapedTitle = escapeHtml(ogTitle);
  const escapedDesc = escapeHtml(ogDescription);
  const escapedUrl = escapeHtml(canonicalUrl);
  const escapedImg = escapeHtml(data.imageUrl);

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${escapedTitle}</title>
  <meta name="description" content="${escapedDesc}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#0b0912">

  <!-- Open Graph / Facebook / Discord / WhatsApp -->
  <meta property="og:type" content="video.movie">
  <meta property="og:site_name" content="Cybercafé 24hs">
  <meta property="og:title" content="${escapedTitle}">
  <meta property="og:description" content="${escapedDesc}">
  <meta property="og:url" content="${escapedUrl}">
  <meta property="og:image" content="${escapedImg}">
  <meta property="og:image:alt" content="${escapeHtml(data.title)}">
  <meta property="og:locale" content="es_AR">

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@Cybercafe24hs">
  <meta name="twitter:title" content="${escapedTitle}">
  <meta name="twitter:description" content="${escapedDesc}">
  <meta name="twitter:image" content="${escapedImg}">
  <meta name="twitter:image:alt" content="${escapeHtml(data.title)}">${
    addRedirectScript
      ? `
  <meta http-equiv="refresh" content="0;url=${escapedUrl}">
  <script>window.location.replace(${JSON.stringify(canonicalUrl)});</script>`
      : ''
  }
</head>
<body style="background-color:#0b0912;color:#f3effc;font-family:sans-serif;padding:24px;text-align:center;">
  <h1>${escapedTitle}</h1>
  <p style="white-space:pre-line;max-width:600px;margin:16px auto;">${escapedDesc}</p>
  <img src="${escapedImg}" alt="${escapeHtml(data.title)}" style="max-width:100%;height:auto;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.5);" />
  <p><a href="${escapedUrl}" style="color:#00f0ff;">Abrir en Cybercafé 24hs</a></p>
</body>
</html>`;
}

export function injectOgTagsIntoHtml(baseHtml: string, data: MovieOgData, canonicalUrl: string): string {
  const ogTitle = formatOgTitle({
    title: data.title,
    year: data.year,
    voteAverage: data.voteAverage,
    providerName: data.providerName,
  });

  const ogDescription = formatOgDescription({
    overview: data.overview,
    genres: data.genres,
    runtime: data.runtime,
    voteAverage: data.voteAverage,
    year: data.year,
    providerName: data.providerName,
  });

  const escapedTitle = escapeHtml(ogTitle);
  const escapedDesc = escapeHtml(ogDescription);
  const escapedUrl = escapeHtml(canonicalUrl);
  const escapedImg = escapeHtml(data.imageUrl);

  let html = baseHtml;

  // Replace <title>
  html = html.replace(/<title>.*?<\/title>/i, `<title>${escapedTitle}</title>`);

  // Replace <meta name="description" ...>
  html = html.replace(/<meta\s+name="description"\s+content=".*?"\s*\/?>/i, `<meta name="description" content="${escapedDesc}" />`);

  // Replace OpenGraph meta tags
  html = html.replace(/<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i, `<meta property="og:title" content="${escapedTitle}" />`);
  html = html.replace(/<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i, `<meta property="og:description" content="${escapedDesc}" />`);
  html = html.replace(/<meta\s+property="og:image"\s+content=".*?"\s*\/?>/i, `<meta property="og:image" content="${escapedImg}" />`);
  html = html.replace(/<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i, `<meta property="og:url" content="${escapedUrl}" />`);

  // Replace Twitter Card meta tags
  html = html.replace(/<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:title" content="${escapedTitle}" />`);
  html = html.replace(/<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:description" content="${escapedDesc}" />`);
  html = html.replace(/<meta\s+name="twitter:image"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:image" content="${escapedImg}" />`);

  return html;
}
