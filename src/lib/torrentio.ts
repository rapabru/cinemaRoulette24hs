// Torrentio is the Stremio addon that indexes public torrent sites. Its API is a
// plain JSON endpoint with CORS enabled, so we can query it straight from the
// browser using the movie's IMDb id and then hand the chosen magnet to Webtor.

// Sort by quality then size, and hide cams / unknown quality, which are never
// worth listing for a movie night.
const TORRENTIO_BASE = 'https://torrentio.strem.fun/sort=qualitysize|qualityfilter=cam,unknown';

// Same public trackers Torrentio itself appends to its magnets.
const PUBLIC_TRACKERS = [
  'udp://tracker.opentrackr.org:1337/announce',
  'udp://open.demonii.com:1337/announce',
  'udp://tracker.torrent.eu.org:451/announce',
  'udp://exodus.desync.com:6969/announce',
];

export interface RawTorrentioStream {
  name?: string;
  title?: string;
  infoHash?: string;
  fileIdx?: number;
  behaviorHints?: { filename?: string };
}

export interface TorrentioStream {
  // Torrentio can list the same torrent more than once (multi-file packs with a
  // different fileIdx each), so the infoHash alone isn't a unique key.
  key: string;
  infoHash: string;
  fileIdx: number | null;
  quality: string;
  filename: string;
  seeders: number | null;
  size: string | null;
  source: string | null;
  // x265/HEVC usually can't be decoded by the browser player, flag it so the
  // UI can steer people towards x264 releases.
  isHevc: boolean;
  // For multi-file torrents (season packs), the file's path inside the torrent,
  // which Torrentio prints on the line after the torrent name.
  innerPath: string | null;
}

export function parseTorrentioStream(raw: RawTorrentioStream): TorrentioStream | null {
  if (!raw.infoHash) return null;

  // name: "Torrentio\n1080p"  title: "<release name>\n👤 99 💾 2.1 GB ⚙️ YTS"
  // Multi-file torrents add the file's path as a second title line:
  // "<pack name>\n<folder>/<file>.mkv\n👤 49 💾 34 GB ⚙️ 1337x"
  const quality = (raw.name || '').split('\n')[1]?.trim() || '?';
  const titleLines = (raw.title || '').split('\n');
  const secondLine = titleLines[1]?.trim() || '';
  const innerPath = secondLine && !secondLine.startsWith('👤') ? secondLine : null;
  const filename = raw.behaviorHints?.filename || titleLines[0]?.trim() || raw.infoHash;
  const meta = titleLines.slice(1).join(' ');

  const seedersMatch = meta.match(/👤\s*(\d+)/);
  const sizeMatch = meta.match(/💾\s*([\d.,]+\s*[KMGT]?B)/i);
  const sourceMatch = meta.match(/⚙️\s*(.+?)\s*$/);

  const fileIdx = typeof raw.fileIdx === 'number' ? raw.fileIdx : null;

  return {
    key: `${raw.infoHash}:${fileIdx ?? ''}`,
    infoHash: raw.infoHash,
    fileIdx,
    quality,
    filename,
    seeders: seedersMatch ? parseInt(seedersMatch[1], 10) : null,
    size: sizeMatch ? sizeMatch[1] : null,
    source: sourceMatch ? sourceMatch[1] : null,
    isHevc: /x265|hevc|h\.?265/i.test(filename),
    innerPath,
  };
}

/** Stremio addon path: movies by IMDb id, series episodes as `tt123:season:episode`. */
export function torrentioStreamPath(imdbId: string, episode?: { season: number; episode: number } | null): string {
  return episode
    ? `/stream/series/${encodeURIComponent(`${imdbId}:${episode.season}:${episode.episode}`)}.json`
    : `/stream/movie/${encodeURIComponent(imdbId)}.json`;
}

/**
 * Fetches the list of torrent streams Torrentio knows for a movie, or for one
 * episode of a series when `episode` is given.
 * Returns [] on any failure (no id, network error, bad payload) so the caller
 * can show an "empty" state instead of breaking the player view.
 */
export async function fetchTorrentioStreams(
  imdbId: string,
  episode?: { season: number; episode: number } | null
): Promise<TorrentioStream[]> {
  if (!imdbId) return [];

  try {
    const response = await fetch(`${TORRENTIO_BASE}${torrentioStreamPath(imdbId, episode)}`);
    if (!response.ok) return [];

    const data = await response.json();
    const streams: RawTorrentioStream[] = Array.isArray(data?.streams) ? data.streams : [];
    return streams.map(parseTorrentioStream).filter((s): s is TorrentioStream => s !== null);
  } catch {
    return [];
  }
}

/**
 * Picks the stream most likely to play smoothly in the browser: non-HEVC, 1080p
 * or below, and among those the best seeded one (Webtor pulls from the swarm
 * live, so seeders matter far more than file size for a good start).
 */
export function pickDefaultStream(streams: TorrentioStream[], preferSingleFile: boolean = false): TorrentioStream | null {
  const is4k = (s: TorrentioStream) => /4k|2160/i.test(s.quality);
  // For an episode, a torrent holding just that episode starts faster and
  // can't land on the wrong file the way a whole-season pack can.
  const base = preferSingleFile && streams.some((s) => !s.innerPath) ? streams.filter((s) => !s.innerPath) : streams;
  const candidates =
    base.filter((s) => !s.isHevc && !is4k(s)).length > 0
      ? base.filter((s) => !s.isHevc && !is4k(s))
      : base.filter((s) => !is4k(s));
  const pool = candidates.length > 0 ? candidates : base;
  if (pool.length === 0) return null;
  return pool.reduce((best, s) => ((s.seeders ?? 0) > (best.seeders ?? 0) ? s : best), pool[0]);
}

// Canonical quality buckets, best first. Anything Torrentio labels differently
// (SCR, TS, HDTV...) lands in 'other'.
export const QUALITY_GROUPS = ['4k', '1080p', '720p', '480p', 'other'] as const;
export type QualityGroup = (typeof QUALITY_GROUPS)[number];

export function qualityGroupOf(stream: TorrentioStream): QualityGroup {
  const match = stream.quality.match(/4k|2160p|1080p|720p|480p/i);
  if (!match) return 'other';
  const label = match[0].toLowerCase();
  return label === '2160p' ? '4k' : (label as QualityGroup);
}

/** Groups streams by quality bucket (best first), each bucket sorted by seeders. */
export function groupByQuality(streams: TorrentioStream[]): Map<QualityGroup, TorrentioStream[]> {
  const groups = new Map<QualityGroup, TorrentioStream[]>();
  for (const group of QUALITY_GROUPS) {
    const members = streams
      .filter((s) => qualityGroupOf(s) === group)
      .sort((a, b) => (b.seeders ?? 0) - (a.seeders ?? 0));
    if (members.length > 0) groups.set(group, members);
  }
  return groups;
}

export function buildMagnet(stream: TorrentioStream, displayName: string): string {
  const params = new URLSearchParams();
  params.set('dn', displayName || stream.filename);
  for (const tracker of PUBLIC_TRACKERS) params.append('tr', tracker);
  return `magnet:?xt=urn:btih:${stream.infoHash}&${params.toString()}`;
}
