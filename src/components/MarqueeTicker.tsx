import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import { fetchNowPlayingMovies, fetchPopularMovies, getImageUrl } from '../lib/tmdb';
import type { MovieSummary } from '../lib/tmdb';
import { BackgroundAudioPlayer } from './BackgroundAudioPlayer';

interface MarqueeTickerProps {
  onSelectMovie: (id: number) => void;
}

const FALLBACK_PHRASES: Record<string, string[]> = {
  es: [
    '🎬 CYBERCAFÉ 24HS — ABIERTO TODA LA NOCHE',
    '🎰 PRESIONÁ SORTEAR Y DESCUBRÍ TU PRÓXIMA PELÍCULA',
    '💬 VEMOS PELÍCULAS JUNTOS EN EL DISCORD, TODAS LAS NOCHES',
  ],
  en: [
    '🎬 CYBERCAFÉ 24HS — OPEN ALL NIGHT',
    '🎰 HIT RANDOM DRAW AND FIND YOUR NEXT MOVIE',
    '💬 WE WATCH MOVIES TOGETHER ON DISCORD, EVERY NIGHT',
  ],
  pt: [
    '🎬 CYBERCAFÉ 24HS — ABERTO A NOITE TODA',
    '🎰 CLIQUE EM SORTEAR E DESCUBRA SEU PRÓXIMO FILME',
    '💬 ASSISTIMOS FILMES JUNTOS NO DISCORD, TODAS AS NOITES',
  ],
};

interface HoverState {
  item: MovieSummary;
  rect: DOMRect;
}

export const MarqueeTicker: React.FC<MarqueeTickerProps> = ({ onSelectMovie }) => {
  const { t, i18n } = useTranslation();
  const [nowPlaying, setNowPlaying] = useState<MovieSummary[]>([]);
  const [popular, setPopular] = useState<MovieSummary[]>([]);
  const [hover, setHover] = useState<HoverState | null>(null);
  const [cardZoomed, setCardZoomed] = useState(false);
  const [settledHoverId, setSettledHoverId] = useState<number | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Only start looking for background audio once the mouse has rested on the same
  // title for a bit, so sweeping across the ticker doesn't fire a search per title.
  useEffect(() => {
    if (!hover) {
      setSettledHoverId(null);
      return;
    }
    const targetId = hover.item.id;
    const timer = setTimeout(() => setSettledHoverId(targetId), 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hover?.item.id]);

  useEffect(() => {
    let cancelled = false;
    fetchNowPlayingMovies(i18n.language).then((list) => {
      if (!cancelled) setNowPlaying(list.slice(0, 10));
    });
    fetchPopularMovies(i18n.language).then((list) => {
      if (!cancelled) setPopular(list.slice(0, 10));
    });
    return () => {
      cancelled = true;
    };
  }, [i18n.language]);

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  // Small grace period so moving the mouse from the title down into the
  // preview card (crossing the gap between them) doesn't close it early.
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      setHover(null);
      setCardZoomed(false);
    }, 150);
  };

  const fallbackPhrases = FALLBACK_PHRASES[i18n.language] || FALLBACK_PHRASES.es;

  const renderRun = (keyPrefix: string, items: MovieSummary[], emoji: string) =>
    items.length > 0
      ? items.map((movie, i) => {
          const year = movie.release_date ? movie.release_date.split('-')[0] : '';
          return (
            <span key={`${keyPrefix}-${movie.id}-${i}`} className="inline-flex items-center shrink-0">
              <button
                onClick={() => onSelectMovie(movie.id)}
                onMouseEnter={(e) => {
                  cancelClose();
                  setHover({ item: movie, rect: e.currentTarget.getBoundingClientRect() });
                }}
                onMouseLeave={scheduleClose}
                className="px-1 font-mono text-[11px] text-[var(--neon-magenta)] tracking-wider hover:text-[var(--neon-cyan)] transition-colors cursor-pointer"
              >
                {emoji} {movie.title}
                {year ? ` (${year})` : ''}
              </button>
              <span className="px-3 text-[var(--neon-magenta)]/50">•</span>
            </span>
          );
        })
      : fallbackPhrases.map((phrase, i) => (
          <span key={`${keyPrefix}-phrase-${i}`} className="px-1 font-mono text-[11px] text-[var(--neon-magenta)] tracking-wider shrink-0">
            {phrase}
            <span className="px-3 text-[var(--neon-magenta)]/50">•</span>
          </span>
        ));

  const renderRow = (rowKey: string, items: MovieSummary[], emoji: string, label: string, reverse: boolean) => (
    <div
      className="w-full overflow-hidden bg-[var(--bg-void)] py-1.5"
      aria-label={label}
    >
      <div
        className={`flex whitespace-nowrap w-max marquee-track ${reverse ? 'marquee-track-reverse' : ''}`}
        style={{ animationPlayState: hover ? 'paused' : undefined }}
      >
        <span className="flex items-center">{renderRun(`${rowKey}-a`, items, emoji)}</span>
        <span className="flex items-center" aria-hidden="true">{renderRun(`${rowKey}-b`, items, emoji)}</span>
      </div>
    </div>
  );

  return (
    <div className="border-b border-[var(--neon-magenta)]/30">
      {renderRow('now', nowPlaying, '🆕', t('marquee.now_playing_label'), true)}
      <div className="border-t border-[var(--neon-magenta)]/10" />
      {renderRow('pop', popular, '👍', t('marquee.popular_label'), false)}

      {hover &&
        createPortal(
          <div
            onClick={() => onSelectMovie(hover.item.id)}
            onMouseEnter={() => {
              cancelClose();
              setCardZoomed(true);
            }}
            onMouseLeave={() => {
              setCardZoomed(false);
              scheduleClose();
            }}
            style={{
              position: 'fixed',
              top: hover.rect.bottom + 8,
              left: Math.min(Math.max(hover.rect.left + hover.rect.width / 2, 90), window.innerWidth - 90),
              transform: `translateX(-50%) scale(${cardZoomed ? 2 : 1})`,
              transformOrigin: 'top center',
              transition: 'transform 200ms ease-out',
            }}
            className="z-[60] w-44 cursor-pointer bg-[var(--bg-panel)] border-2 border-[var(--neon-cyan)] rounded-lg shadow-neon-cyan overflow-hidden"
          >
            <div className="aspect-[2/3] w-full bg-black/60">
              <img
                src={getImageUrl(hover.item.poster_path, 'w185')}
                alt={hover.item.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-2 space-y-1">
              <p className="font-mono text-[11px] font-bold text-[var(--ink-light)] line-clamp-2 leading-snug">
                {hover.item.title}
              </p>
              {hover.item.vote_average ? (
                <p className="flex items-center gap-1 text-[10px] font-mono text-[var(--neon-amber)]">
                  <Star className="w-3 h-3 fill-[var(--neon-amber)]" />
                  {hover.item.vote_average.toFixed(1)}
                </p>
              ) : null}
            </div>
          </div>,
          document.body
        )}

      {hover && settledHoverId === hover.item.id && (
        <BackgroundAudioPlayer
          movieId={hover.item.id}
          title={hover.item.title}
          year={hover.item.release_date ? hover.item.release_date.split('-')[0] : ''}
          trailerKey={null}
          active
        />
      )}
    </div>
  );
};
