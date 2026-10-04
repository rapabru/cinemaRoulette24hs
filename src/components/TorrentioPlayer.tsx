import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Magnet, Loader2, AlertTriangle, Users, HardDrive, Download } from 'lucide-react';
import { fetchTorrentioStreams, pickDefaultStream, buildMagnet, groupByQuality, qualityGroupOf } from '../lib/torrentio';
import type { TorrentioStream, QualityGroup } from '../lib/torrentio';

interface TorrentioPlayerProps {
  imdbId: string | null | undefined;
  title: string;
  year: string;
  posterUrl: string | null;
}

// Pinned so a future SDK release can't silently change what runs in the sandbox.
const WEBTOR_SDK_URL = 'https://cdn.jsdelivr.net/npm/@webtor/embed-sdk-js@0.2.19/dist/index.min.js';

/**
 * Builds a self-contained page that boots the Webtor embed SDK with one magnet.
 * The SDK is loaded inside a sandboxed `data:` iframe rather than on our page:
 * it eval()s messages coming from webtor.io, and a `data:` document always
 * gets an opaque origin, so it can never touch our DOM or localStorage.
 *
 * `allow-same-origin` is still needed in the sandbox: sandbox flags cascade
 * into nested frames, and without it the webtor.io player itself would run
 * with an opaque origin and be unable to reach its own API (cookies, session).
 * The flag doesn't affect the wrapper, which stays opaque by virtue of `data:`.
 */
function buildWebtorSrcDoc(config: Record<string, unknown>): string {
  const json = JSON.stringify(config).replace(/</g, '\\u003c');
  const html = [
    '<!doctype html><html><head><meta charset="utf-8">',
    '<style>html,body{margin:0;height:100%;background:#000;overflow:hidden}',
    '#player{position:absolute;inset:0}#player iframe{width:100%!important;height:100%!important;display:block}</style></head><body>',
    '<div id="player"></div>',
    `<script>window.webtor=window.webtor||[];window.webtor.push(${json});</script>`,
    `<script src="${WEBTOR_SDK_URL}" charset="utf-8" async></script>`,
    '</body></html>',
  ].join('');
  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}

export const TorrentioPlayer: React.FC<TorrentioPlayerProps> = ({ imdbId, title, year, posterUrl }) => {
  const { t, i18n } = useTranslation();
  const [streams, setStreams] = useState<TorrentioStream[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'empty' | 'error'>('loading');
  const [selected, setSelected] = useState<TorrentioStream | null>(null);
  const [activeGroup, setActiveGroup] = useState<QualityGroup | null>(null);
  const activeItemRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!imdbId) {
      setStreams([]);
      setSelected(null);
      setStatus('empty');
      return;
    }

    let cancelled = false;
    setStatus('loading');
    setSelected(null);

    fetchTorrentioStreams(imdbId)
      .then((result) => {
        if (cancelled) return;
        const defaultStream = pickDefaultStream(result);
        setStreams(result);
        setSelected(defaultStream);
        setActiveGroup(defaultStream ? qualityGroupOf(defaultStream) : null);
        setStatus(result.length > 0 ? 'ready' : 'empty');
      })
      .catch(() => {
        if (cancelled) return;
        setStreams([]);
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [imdbId]);

  // The auto-picked default is rarely the first row, so make sure it's visible.
  useEffect(() => {
    activeItemRef.current?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  const groups = useMemo(() => groupByQuality(streams), [streams]);
  const visibleStreams = (activeGroup && groups.get(activeGroup)) || [];
  const displayName = `${title} (${year})`;

  const srcDoc = useMemo(() => {
    if (!selected) return null;
    return buildWebtorSrcDoc({
      id: 'player',
      magnet: buildMagnet(selected, displayName),
      imdbId: imdbId || null,
      poster: posterUrl,
      title: displayName,
      lang: i18n.language,
      // Webtor looks up OpenSubtitles by imdbId; userLang picks which language it prefers.
      userLang: i18n.language,
      width: '100%',
      height: '100%',
      features: { embed: false },
    });
  }, [selected, imdbId, displayName, posterUrl, i18n.language]);

  const containerClass =
    'relative aspect-video w-full max-h-[75vh] rounded-xl overflow-hidden border-2 border-[var(--neon-green)] shadow-neon-green bg-black mx-auto';

  const renderMessage = (icon: React.ReactNode, text: string) => (
    <div className={`${containerClass} flex items-center justify-center`}>
      <div className="flex flex-col items-center gap-3 text-center text-sm font-mono text-[var(--ink-muted)] px-6">
        {icon}
        <span>{text}</span>
      </div>
    </div>
  );

  if (!imdbId) {
    return renderMessage(<AlertTriangle className="w-8 h-8 text-[var(--neon-amber)]" />, t('sortear.torrentio_no_imdb'));
  }

  if (status === 'loading') {
    return renderMessage(<Loader2 className="w-8 h-8 text-[var(--neon-green)] animate-spin" />, t('sortear.torrentio_loading'));
  }

  if (status === 'error') {
    return renderMessage(<AlertTriangle className="w-8 h-8 text-[var(--neon-magenta)]" />, t('sortear.torrentio_error'));
  }

  if (status === 'empty') {
    return renderMessage(<Magnet className="w-8 h-8 text-[var(--ink-muted)]" />, t('sortear.torrentio_empty'));
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Stream picker: one tab per quality, rows sorted by seeders */}
      <div className="bg-[var(--bg-brick)] rounded-lg border border-[var(--neon-green)]/30 p-2 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-[var(--ink-muted)] font-bold uppercase tracking-wider mr-1">
            {t('sortear.torrentio_pick_quality')}
          </span>
          {[...groups.entries()].map(([group, members]) => (
            <button
              key={group}
              onClick={() => setActiveGroup(group)}
              className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${
                activeGroup === group
                  ? 'bg-[var(--neon-green)] text-[var(--bg-void)] shadow-neon-green'
                  : 'bg-[var(--bg-void)] text-[var(--ink-muted)] hover:text-[var(--ink-light)] border border-[var(--ink-muted)]/30'
              }`}
            >
              {group === 'other' ? t('sortear.torrentio_other_quality') : group.toUpperCase()} ({members.length})
            </button>
          ))}
          {selected?.isHevc && (
            <span className="flex items-center gap-1 text-[var(--neon-amber)] ml-auto">
              <AlertTriangle className="w-3.5 h-3.5" />
              {t('sortear.torrentio_hevc_hint')}
            </span>
          )}
        </div>

        <ul className="max-h-36 overflow-y-auto flex flex-col gap-1 pr-1">
          {visibleStreams.map((stream) => {
            const isActive = selected?.key === stream.key;
            return (
              <li key={stream.key} ref={isActive ? activeItemRef : undefined} className="flex items-stretch gap-1">
                <button
                  onClick={() => setSelected(stream)}
                  title={stream.filename}
                  className={`flex-1 min-w-0 text-left px-2.5 py-1.5 rounded font-mono text-xs transition-all cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? 'bg-[var(--neon-green)] text-[var(--bg-void)] shadow-neon-green font-bold'
                      : 'bg-[var(--bg-void)] text-[var(--ink-muted)] hover:text-[var(--ink-light)] border border-[var(--ink-muted)]/30'
                  }`}
                >
                  <span className="shrink-0 w-14 font-bold">{stream.quality}</span>
                  {stream.isHevc && (
                    <span
                      className={`shrink-0 px-1 rounded text-[10px] font-bold ${
                        isActive ? 'bg-[var(--bg-void)]/20' : 'bg-[var(--neon-amber)]/20 text-[var(--neon-amber)]'
                      }`}
                    >
                      x265
                    </span>
                  )}
                  <span className="truncate flex-1">{stream.filename}</span>
                  {stream.size && (
                    <span className="shrink-0 flex items-center gap-1">
                      <HardDrive className="w-3 h-3" />
                      {stream.size}
                    </span>
                  )}
                  {stream.seeders !== null && (
                    <span className="shrink-0 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {stream.seeders}
                    </span>
                  )}
                  {stream.source && <span className="shrink-0 hidden sm:inline opacity-70">{stream.source}</span>}
                </button>
                <a
                  href={buildMagnet(stream, displayName)}
                  title={t('sortear.torrentio_download_hint')}
                  aria-label={t('sortear.torrentio_download')}
                  className="shrink-0 px-2 rounded flex items-center bg-[var(--bg-void)] text-[var(--neon-amber)] border border-[var(--neon-amber)]/40 hover:bg-[var(--neon-amber)]/15 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              </li>
            );
          })}
        </ul>

        {selected && (
          <a
            href={buildMagnet(selected, displayName)}
            title={t('sortear.torrentio_download_hint')}
            className="self-start flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs font-bold bg-[var(--bg-void)] text-[var(--neon-amber)] border border-[var(--neon-amber)]/50 hover:bg-[var(--neon-amber)]/15 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>
              {t('sortear.torrentio_download')} · {selected.quality}
              {selected.size ? ` · ${selected.size}` : ''}
            </span>
          </a>
        )}
      </div>

      <div className={containerClass}>
        {srcDoc && (
          <iframe
            // Remount on every stream change so the SDK boots fresh with the new magnet.
            key={selected?.key}
            src={srcDoc}
            className="w-full h-full border-0"
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            sandbox="allow-scripts allow-same-origin allow-forms"
            title={`Torrentio / Webtor Player - ${title}`}
          />
        )}
      </div>

      <p className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--ink-muted)] px-1">
        <Magnet className="w-3.5 h-3.5 text-[var(--neon-green)] shrink-0" />
        {t('sortear.torrentio_free_hint')}
      </p>
    </div>
  );
};
