import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import type { DrawnHistoryItem } from '../lib/history';
import { getImageUrl } from '../lib/tmdb';

interface MarqueeTickerProps {
  historyList: DrawnHistoryItem[];
  onSelectMovie: (id: number) => void;
}

const WELCOME_PHRASES_ES = [
  '🎬 CYBERCAFÉ 24HS — ABIERTO TODA LA NOCHE',
  '🎰 PRESIONÁ SORTEAR Y DESCUBRÍ TU PRÓXIMA PELÍCULA',
  '💬 VEMOS PELÍCULAS JUNTOS EN EL DISCORD, TODAS LAS NOCHES',
];

const WELCOME_PHRASES_EN = [
  '🎬 CYBERCAFÉ 24HS — OPEN ALL NIGHT',
  '🎰 HIT RANDOM DRAW AND FIND YOUR NEXT MOVIE',
  '💬 WE WATCH MOVIES TOGETHER ON DISCORD, EVERY NIGHT',
];

interface HoverState {
  item: DrawnHistoryItem;
  rect: DOMRect;
}

export const MarqueeTicker: React.FC<MarqueeTickerProps> = ({ historyList, onSelectMovie }) => {
  const { t, i18n } = useTranslation();
  const [hover, setHover] = useState<HoverState | null>(null);

  const movieItems = historyList.slice(0, 10);
  const hasMovies = movieItems.length > 0;
  const welcomePhrases = i18n.language === 'en' ? WELCOME_PHRASES_EN : WELCOME_PHRASES_ES;

  const renderRun = (keyPrefix: string) =>
    hasMovies
      ? movieItems.map((movie, i) => {
          const year = movie.release_date ? movie.release_date.split('-')[0] : '';
          return (
            <span key={`${keyPrefix}-${movie.id}-${i}`} className="inline-flex items-center shrink-0">
              <button
                onClick={() => onSelectMovie(movie.id)}
                onMouseEnter={(e) => setHover({ item: movie, rect: e.currentTarget.getBoundingClientRect() })}
                onMouseLeave={() => setHover(null)}
                className="px-1 font-mono text-[11px] text-[var(--neon-magenta)] tracking-wider hover:text-[var(--neon-cyan)] transition-colors cursor-pointer"
              >
                🎲 {movie.title}
                {year ? ` (${year})` : ''}
              </button>
              <span className="px-3 text-[var(--neon-magenta)]/50">•</span>
            </span>
          );
        })
      : welcomePhrases.map((phrase, i) => (
          <span key={`${keyPrefix}-phrase-${i}`} className="px-1 font-mono text-[11px] text-[var(--neon-magenta)] tracking-wider shrink-0">
            {phrase}
            <span className="px-3 text-[var(--neon-magenta)]/50">•</span>
          </span>
        ));

  return (
    <div className="w-full overflow-hidden bg-[var(--bg-void)] border-b border-[var(--neon-magenta)]/30 py-1.5" aria-label={t('marquee.label')}>
      <div className="flex whitespace-nowrap w-max marquee-track">
        <span className="flex items-center">{renderRun('a')}</span>
        <span className="flex items-center" aria-hidden="true">{renderRun('b')}</span>
      </div>

      {hover &&
        createPortal(
          <div
            onClick={() => onSelectMovie(hover.item.id)}
            onMouseLeave={() => setHover(null)}
            style={{
              position: 'fixed',
              top: hover.rect.bottom + 8,
              left: Math.min(Math.max(hover.rect.left + hover.rect.width / 2, 90), window.innerWidth - 90),
              transform: 'translateX(-50%)',
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
    </div>
  );
};
