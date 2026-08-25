import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { History, Search, Trash2, Calendar, Star, Check, Dices, BarChart3 } from 'lucide-react';
import type { DrawnHistoryItem } from '../lib/history';
import { getImageUrl } from '../lib/tmdb';
import type { Genre } from '../lib/tmdb';
import { ExportButtons } from './ExportButtons';

interface DrawHistoryViewProps {
  historyList: DrawnHistoryItem[];
  watchedMovieIds: Set<number>;
  genres: Genre[];
  onClearHistory: () => void;
  onSelectMovie: (id: number) => void;
  onToggleWatched: (movie: { id: number; title: string; poster_path: string | null; release_date: string }) => void;
  onSortearAgain: () => void;
}

/** Animates a number counting up from 0 to `target` over `durationMs`. */
function useCountUp(target: number, durationMs = 700): number {
  const [value, setValue] = useState(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      setValue(Math.round(from + (target - from) * progress));
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [target, durationMs]);

  return value;
}

export const DrawHistoryView: React.FC<DrawHistoryViewProps> = ({
  historyList,
  watchedMovieIds,
  genres,
  onClearHistory,
  onSelectMovie,
  onToggleWatched,
  onSortearAgain,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredList = historyList.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ratedEntries = historyList.filter((m) => (m.vote_average || 0) > 0);
  const avgRatingRaw = ratedEntries.length
    ? ratedEntries.reduce((sum, m) => sum + (m.vote_average || 0), 0) / ratedEntries.length
    : 0;

  const genreCounts = new Map<number, number>();
  historyList.forEach((m) => {
    (m.genre_ids || []).forEach((gid) => {
      genreCounts.set(gid, (genreCounts.get(gid) || 0) + 1);
    });
  });
  let topGenreId: number | null = null;
  let topGenreCount = 0;
  genreCounts.forEach((count, gid) => {
    if (count > topGenreCount) {
      topGenreCount = count;
      topGenreId = gid;
    }
  });
  const topGenreName = topGenreId !== null ? genres.find((g) => g.id === topGenreId)?.name : undefined;

  const totalCountUp = useCountUp(historyList.length);
  const avgRatingCountUp = useCountUp(Math.round(avgRatingRaw * 10)) / 10;

  if (historyList.length === 0) {
    return (
      <div className="my-12 p-8 text-center bg-[var(--bg-panel)] border-2 border-dashed border-[var(--neon-amber)]/40 rounded-xl max-w-xl mx-auto space-y-4">
        <History className="w-12 h-12 text-[var(--neon-amber)] mx-auto animate-pulse" />
        <h3 className="font-display text-sm text-[var(--neon-amber)] uppercase">
          {t('history.empty')}
        </h3>
        <p className="text-xs font-mono text-[var(--ink-muted)] leading-relaxed">
          {t('history.empty_hint')}
        </p>
        <button
          onClick={onSortearAgain}
          className="mt-2 inline-flex items-center gap-2 bg-[var(--neon-amber)] text-[var(--bg-void)] font-bold font-mono text-xs py-2.5 px-4 rounded-lg shadow-neon-amber hover:bg-[var(--neon-amber)]/80 transition-all cursor-pointer"
        >
          <Dices className="w-4 h-4" />
          <span>{t('history.try_draw')}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="my-6 space-y-6">
      {/* Header Bar Stats & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[var(--bg-panel)] border border-[var(--neon-amber)]/40 rounded-xl shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[var(--bg-void)] border border-[var(--neon-amber)] flex items-center justify-center text-[var(--neon-amber)] shadow-neon-amber">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-xs sm:text-sm text-[var(--neon-amber)] uppercase tracking-wider">
              {t('history.title')}
            </h2>
            <p className="text-xs font-mono text-[var(--ink-muted)]">
              {t('history.total_draws')}: <strong className="text-[var(--neon-cyan)]">{historyList.length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('history.search_placeholder')}
              className="w-full bg-[var(--bg-void)] border border-[var(--ink-muted)]/40 focus:border-[var(--neon-amber)] text-[var(--ink-light)] font-mono text-xs px-3 py-2 pl-9 rounded outline-none transition-all"
            />
            <Search className="w-4 h-4 text-[var(--ink-muted)] absolute left-2.5 top-2.5" />
          </div>

          {/* Export Buttons */}
          <ExportButtons
            title={t('history.title')}
            filenamePrefix="historial_sorteos"
            rows={historyList.map((m) => ({
              title: m.title,
              year: m.release_date ? m.release_date.split('-')[0] : '',
              rating: m.vote_average ? m.vote_average.toFixed(1) : 'N/A',
              dateLabel: new Date(m.drawnAt).toLocaleString(),
            }))}
          />

          {/* Clear History Button */}
          <button
            onClick={onClearHistory}
            title={t('history.clear')}
            className="p-2 rounded bg-[var(--bg-void)] border border-red-500/30 hover:border-red-500 text-red-400 text-xs font-mono flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">{t('history.clear')}</span>
          </button>
        </div>
      </div>

      {/* Stat Tiles */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-[var(--bg-panel)] border border-[var(--neon-cyan)]/30 rounded-xl p-3 sm:p-4 text-center">
          <p className="text-xl sm:text-2xl font-display text-[var(--neon-cyan)]">{totalCountUp}</p>
          <p className="text-[10px] sm:text-[11px] font-mono text-[var(--ink-muted)] uppercase tracking-wider mt-1 flex items-center justify-center gap-1">
            <BarChart3 className="w-3 h-3" />
            {t('history.stat_total')}
          </p>
        </div>

        <div className="bg-[var(--bg-panel)] border border-[var(--neon-amber)]/30 rounded-xl p-3 sm:p-4 text-center">
          <p className="text-xl sm:text-2xl font-display text-[var(--neon-amber)]">
            {avgRatingRaw > 0 ? avgRatingCountUp.toFixed(1) : '—'}
          </p>
          <p className="text-[10px] sm:text-[11px] font-mono text-[var(--ink-muted)] uppercase tracking-wider mt-1 flex items-center justify-center gap-1">
            <Star className="w-3 h-3" />
            {t('history.stat_avg_rating')}
          </p>
        </div>

        <div className="bg-[var(--bg-panel)] border border-[var(--neon-magenta)]/30 rounded-xl p-3 sm:p-4 text-center">
          <p className="text-sm sm:text-base font-display text-[var(--neon-magenta)] line-clamp-1">
            {topGenreName || '—'}
          </p>
          <p className="text-[10px] sm:text-[11px] font-mono text-[var(--ink-muted)] uppercase tracking-wider mt-1">
            {t('history.stat_top_genre')}
          </p>
        </div>
      </div>

      {/* Grid of Drawn Movies */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
        {filteredList.map((movie) => {
          const posterUrl = getImageUrl(movie.poster_path, 'w500');
          const year = movie.release_date ? movie.release_date.split('-')[0] : '';
          const drawnDate = new Date(movie.drawnAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const isWatched = watchedMovieIds.has(movie.id);

          return (
            <div
              key={`${movie.id}_${movie.drawnAt}`}
              className="crt-monitor group relative bg-[var(--bg-panel)] border border-[var(--neon-amber)]/30 rounded-lg overflow-hidden flex flex-col justify-between"
            >
              {/* Poster Image */}
              <div
                onClick={() => onSelectMovie(movie.id)}
                className="relative aspect-[2/3] w-full overflow-hidden cursor-pointer bg-black/60"
              >
                <img src={posterUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />

                {/* Rating Badge */}
                {movie.vote_average && movie.vote_average > 0 && (
                  <div className="absolute top-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[var(--neon-amber)] font-mono text-[10px] font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-[var(--neon-amber)]" />
                    <span>{movie.vote_average.toFixed(1)}</span>
                  </div>
                )}

                {/* Drawn Timestamp Tag */}
                <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[var(--neon-cyan)] font-mono text-[9px] flex items-center gap-1">
                  <Calendar className="w-2.5 h-2.5" />
                  <span>{drawnDate}</span>
                </div>
              </div>

              {/* Info & Watched Toggle Action */}
              <div className="p-3 bg-[var(--bg-panel)] border-t border-[var(--bg-brick)] flex flex-col justify-between flex-1">
                <div>
                  <h3
                    onClick={() => onSelectMovie(movie.id)}
                    className="font-mono font-semibold text-xs text-[var(--ink-light)] line-clamp-1 hover:text-[var(--neon-amber)] cursor-pointer"
                  >
                    {movie.title}
                  </h3>
                  <p className="text-[10px] font-mono text-[var(--ink-muted)] mt-0.5">
                    {year}
                  </p>
                </div>

                <button
                  onClick={() => onToggleWatched(movie)}
                  className={`mt-2.5 w-full py-1 px-2 rounded text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition-all border ${
                    isWatched
                      ? 'bg-[var(--neon-green)] text-[var(--bg-void)] border-[var(--neon-green)] shadow-neon-green'
                      : 'bg-[var(--bg-void)] text-[var(--neon-cyan)] border-[var(--neon-cyan)]/40 hover:border-[var(--neon-cyan)]'
                  }`}
                >
                  <Check className="w-3 h-3" />
                  <span>{isWatched ? 'Vista ✔' : 'Marcar La Vi'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
