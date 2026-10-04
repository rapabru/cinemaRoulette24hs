export type PlayerProvider = 'vidking' | 'playimdb' | 'torrentio' | 'trailer';

export interface BuildShareUrlOptions {
  origin?: string;
  pathname?: string;
  movieId: number;
  mode?: 'details' | 'player';
  provider?: PlayerProvider;
}

export function buildShareUrl({
  origin = typeof window !== 'undefined' ? window.location.origin : 'https://cinemaroulette.vercel.app',
  pathname = typeof window !== 'undefined' ? window.location.pathname : '/',
  movieId,
  mode = 'details',
  provider = 'vidking',
}: BuildShareUrlOptions): string {
  const url = new URL(pathname, origin);
  url.searchParams.set('movie', String(movieId));
  if (mode === 'player') {
    url.searchParams.set('player', provider);
  }
  return url.toString();
}

export interface BuildShareTextOptions {
  title: string;
  year?: string;
  rating?: number;
  genres?: string[];
  shareUrl: string;
  mode?: 'details' | 'player';
  provider?: PlayerProvider;
}

const SERVER_NAMES: Record<PlayerProvider, string> = {
  vidking: 'VidKing',
  playimdb: 'PlayIMDB',
  torrentio: 'Stremio / Torrentio',
  trailer: 'Tráiler',
};

export function buildShareText({
  title,
  year,
  rating,
  genres = [],
  shareUrl,
  mode = 'details',
  provider = 'vidking',
}: BuildShareTextOptions): string {
  const yearSuffix = year ? ` (${year})` : '';
  const ratingLine = rating && rating > 0 ? `⭐ ${rating.toFixed(1)}/10` : null;

  if (mode === 'player') {
    const serverName = SERVER_NAMES[provider] || provider;
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

export interface ParsedDeepLink {
  movieId: number | null;
  mode: 'details' | 'player';
  provider: PlayerProvider;
}

export function parseMovieDeepLink(search: string): ParsedDeepLink {
  const params = new URLSearchParams(search);
  const movieIdRaw = params.get('movie') || params.get('id') || params.get('sorteo');
  const playerRaw = params.get('player') || params.get('server');

  let movieId: number | null = null;
  if (movieIdRaw) {
    const parsed = parseInt(movieIdRaw, 10);
    if (!isNaN(parsed) && parsed > 0) {
      movieId = parsed;
    }
  }

  const validProviders: PlayerProvider[] = ['vidking', 'playimdb', 'torrentio', 'trailer'];
  const provider: PlayerProvider = (playerRaw && validProviders.includes(playerRaw as PlayerProvider))
    ? (playerRaw as PlayerProvider)
    : 'vidking';

  const mode: 'details' | 'player' = playerRaw ? 'player' : 'details';

  return { movieId, mode, provider };
}
