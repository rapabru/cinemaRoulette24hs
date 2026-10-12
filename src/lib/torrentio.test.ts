import { describe, it, expect } from 'vitest';
import { parseTorrentioStream, pickDefaultStream, groupByQuality, buildMagnet, torrentioStreamPath } from './torrentio';
import type { TorrentioStream } from './torrentio';

const HASH_A = '03dd34fea0ff15a451c1723062a901aa3a0ad458';
const HASH_B = '9d86667f49f42712909c2888d346b37a17c44191';

const stream = (overrides: Partial<TorrentioStream>): TorrentioStream => ({
  key: `${overrides.infoHash || HASH_A}:`,
  infoHash: HASH_A,
  fileIdx: null,
  quality: '1080p',
  filename: 'Movie.1080p.x264.mkv',
  seeders: 10,
  size: '2 GB',
  source: 'YTS',
  isHevc: false,
  innerPath: null,
  ...overrides,
});

describe('parseTorrentioStream', () => {
  it('extracts quality, seeders, size and source from the addon payload', () => {
    const parsed = parseTorrentioStream({
      name: 'Torrentio\n4k HDR',
      title: 'The.Matrix.1999.2160p.UHD.BluRay.x265-IAMABLE\n👤 99 💾 35.09 GB ⚙️ RARBG',
      infoHash: HASH_A,
      fileIdx: 2,
      behaviorHints: { filename: 'The.Matrix.1999.2160p.UHD.BluRay.X265-IAMABLE.mkv' },
    });

    expect(parsed).toEqual({
      key: `${HASH_A}:2`,
      infoHash: HASH_A,
      fileIdx: 2,
      quality: '4k HDR',
      filename: 'The.Matrix.1999.2160p.UHD.BluRay.X265-IAMABLE.mkv',
      seeders: 99,
      size: '35.09 GB',
      source: 'RARBG',
      isHevc: true,
      innerPath: null,
    });
  });

  it('falls back to the title line when there is no filename hint', () => {
    const parsed = parseTorrentioStream({ name: 'Torrentio\n720p', title: 'Some.Release.720p\n👤 5 💾 700 MB ⚙️ 1337x', infoHash: HASH_B });
    expect(parsed?.filename).toBe('Some.Release.720p');
    expect(parsed?.key).toBe(`${HASH_B}:`);
    expect(parsed?.isHevc).toBe(false);
  });

  it('rejects entries without an infoHash', () => {
    expect(parseTorrentioStream({ name: 'Torrentio\n1080p', title: 'x' })).toBeNull();
  });
});

describe('pickDefaultStream', () => {
  it('prefers the best-seeded non-HEVC stream at 1080p or below', () => {
    const picked = pickDefaultStream([
      stream({ key: '4k', quality: '4k', seeders: 500 }),
      stream({ key: 'hevc', quality: '1080p', seeders: 400, isHevc: true }),
      stream({ key: 'x264-low', quality: '1080p', seeders: 20 }),
      stream({ key: 'x264-high', quality: '720p', seeders: 300 }),
    ]);
    expect(picked?.key).toBe('x264-high');
  });

  it('falls back to HEVC when nothing else is available below 4k', () => {
    const picked = pickDefaultStream([
      stream({ key: '4k', quality: '4k', seeders: 500 }),
      stream({ key: 'hevc', quality: '1080p', seeders: 4, isHevc: true }),
    ]);
    expect(picked?.key).toBe('hevc');
  });

  it('returns null for an empty list', () => {
    expect(pickDefaultStream([])).toBeNull();
  });
});

describe('groupByQuality', () => {
  it('buckets by quality, best first, and sorts each bucket by seeders', () => {
    const groups = groupByQuality([
      stream({ key: 'a', quality: '720p', seeders: 1 }),
      stream({ key: 'b', quality: '1080p', seeders: 5 }),
      stream({ key: 'c', quality: '4k HDR', seeders: 9 }),
      stream({ key: 'd', quality: '1080p', seeders: 50 }),
      stream({ key: 'e', quality: 'SCR', seeders: 2 }),
    ]);

    expect([...groups.keys()]).toEqual(['4k', '1080p', '720p', 'other']);
    expect(groups.get('1080p')?.map((s) => s.key)).toEqual(['d', 'b']);
    expect(groups.get('other')?.map((s) => s.key)).toEqual(['e']);
  });
});

describe('buildMagnet', () => {
  it('builds a magnet with the display name and public trackers', () => {
    const magnet = buildMagnet(stream({ infoHash: HASH_A }), 'The Matrix (1999)');
    expect(magnet.startsWith(`magnet:?xt=urn:btih:${HASH_A}&dn=The+Matrix+%281999%29`)).toBe(true);
    expect(magnet.match(/&tr=/g)?.length).toBe(4);
  });
});

describe('series episodes', () => {
  it('builds the Stremio series path as imdb:season:episode', () => {
    expect(torrentioStreamPath('tt0903747')).toBe('/stream/movie/tt0903747.json');
    expect(torrentioStreamPath('tt0903747', { season: 1, episode: 3 })).toBe('/stream/series/tt0903747%3A1%3A3.json');
  });

  it('reads the file path that season packs print under the torrent name', () => {
    const pack = parseTorrentioStream({
      name: 'Torrentio\n1080p',
      title:
        'Breaking.Bad.S01.1080p.BluRay-NOGRP\nBreaking.Bad.S01/Breaking.Bad.S01E03.1080p.mkv\n👤 19 💾 9.24 GB ⚙️ RARBG',
      infoHash: HASH_A,
      fileIdx: 2,
      behaviorHints: { filename: 'Breaking.Bad.S01E03.1080p.mkv' },
    })!;
    expect(pack.innerPath).toBe('Breaking.Bad.S01/Breaking.Bad.S01E03.1080p.mkv');
    expect(pack.seeders).toBe(19);

    const single = parseTorrentioStream({
      name: 'Torrentio\n1080p',
      title: 'Breaking.Bad.S01E03.1080p.WEB\n👤 5 💾 1 GB ⚙️ EZTV',
      infoHash: HASH_B,
    })!;
    expect(single.innerPath).toBeNull();
  });

  it('prefers a single-episode torrent over a better-seeded pack when asked', () => {
    const pack = stream({ infoHash: HASH_A, seeders: 500, innerPath: 'S01/E03.mkv' });
    const single = stream({ infoHash: HASH_B, seeders: 5 });
    expect(pickDefaultStream([pack, single], true)?.infoHash).toBe(HASH_B);
    expect(pickDefaultStream([pack, single])?.infoHash).toBe(HASH_A);
    // Only packs available: still picks one.
    expect(pickDefaultStream([pack], true)?.infoHash).toBe(HASH_A);
  });
});
