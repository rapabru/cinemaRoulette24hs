import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bookmark, Search, Trash2, Calendar, Star, Dices } from 'lucide-react';
import type { WatchlistItem } from '../lib/watchlist';
import { getGridPosterSources, mediaKey } from '../lib/tmdb';
import { ExportButtons } from './ExportButtons';

interface WatchlistViewProps {
  watchlist: WatchlistItem[];
  onRemove: (movie: WatchlistItem) => void;
  onSelectMovie: (movie: WatchlistItem) => void;
}

/** "Mi lista": movies and series saved to watch later. */
export const WatchlistView: React.FC<WatchlistViewProps> = ({ watchlist, onRemove, onSelectMovie }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredList = watchlist.filter((m) => m.title.toLowerCase().includes(searchQuery.toLowerCase()));

  // The roulette, but only over what's already on the list.
  const handleDrawFromList = () => {
    const pool = filteredList.length > 0 ? filteredList : watchlist;
    if (pool.length > 0) onSelectMovie(pool[Math.floor(Math.random() * pool.length)]);
  };

  if (watchlist.length === 0) {
    return (
      <div className="my-12 p-8 text-center bg-[var(--bg-panel)] border-2 border-dashed border-[var(--neon-blue)]/50 rounded-xl max-w-xl mx-auto space-y-4">
        <Bookmark className="w-12 h-12 text-[var(--neon-blue)] mx-auto animate-pulse" />
        <h3 className="font-display text-sm text-[var(--neon-blue)] uppercase">{t('watchlist.empty')}</h3>
        <p className="text-xs font-mono text-[var(--ink-muted)] leading-relaxed">{t('watchlist.empty_hint')}</p>
      </div>
    );
  }

  return (
    <div className="my-6 space-y-6">
      {/* Header Bar Stats & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[var(--bg-panel)] border border-[var(--neon-blue)]/50 rounded-xl shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[var(--bg-void)] border border-[var(--neon-blue)] flex items-center justify-center text-[var(--neon-blue)] shadow-neon-blue">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-xs sm:text-sm text-[var(--neon-blue)] uppercase tracking-wider">
              {t('watchlist.title')}
            </h2>
            <p className="text-xs font-mono text-[var(--ink-muted)]">
              {t('watchlist.total_count')}: <strong className="text-[var(--neon-cyan)]">{watchlist.length}</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleDrawFromList}
            className="px-3 py-2 rounded bg-[var(--neon-blue)] hover:bg-[var(--neon-blue)]/80 text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-neon-blue transition-all cursor-pointer"
            title={t('watchlist.draw_hint')}
          >
            <Dices className="w-4 h-4" />
            <span>{t('watchlist.draw')}</span>
          </button>

          {/* Search Input */}
          <div className="relative flex-1 sm:w-56">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('watched.search_placeholder')}
              className="w-full bg-[var(--bg-void)] border border-[var(--ink-muted)]/40 focus:border-[var(--neon-blue)] text-[var(--ink-light)] font-mono text-xs px-3 py-2 pl-9 rounded outline-none transition-all"
            />
            <Search className="w-4 h-4 text-[var(--ink-muted)] absolute left-2.5 top-2.5" />
          </div>

          <ExportButtons
            title={t('watchlist.title')}
            filenamePrefix="mi_lista"
            rows={watchlist.map((m) => ({
              title: m.media_type === 'tv' ? `${m.title} (${t('sortear.series_badge')})` : m.title,
              year: m.release_date ? m.release_date.split('-')[0] : '',
              rating: m.vote_average ? m.vote_average.toFixed(1) : 'N/A',
              dateLabel: new Date(m.dateAdded).toLocaleDateString(),
            }))}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
        {filteredList.map((movie) => {
          const poster = getGridPosterSources(movie.poster_path);
          const year = movie.release_date ? movie.release_date.split('-')[0] : '';
          const dateAdded = new Date(movie.dateAdded).toLocaleDateString();

          return (
            <div
              key={mediaKey(movie)}
              className="crt-monitor group relative bg-[var(--bg-panel)] border border-[var(--neon-blue)]/50 rounded-lg overflow-hidden flex flex-col justify-between"
            >
              <div
                onClick={() => onSelectMovie(movie)}
                className="relative aspect-[2/3] w-full overflow-hidden cursor-pointer bg-black/60"
              >
                <img
                  src={poster.src}
                  srcSet={poster.srcSet}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />

                {movie.vote_average && movie.vote_average > 0 && (
                  <div className="absolute top-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[var(--neon-amber)] font-mono text-[10px] font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-[var(--neon-amber)]" />
                    <span>{movie.vote_average.toFixed(1)}</span>
                  </div>
                )}

                {movie.media_type === 'tv' && (
                  <div className="absolute top-2 left-2 bg-[var(--neon-magenta)] text-white px-1.5 py-0.5 rounded font-mono text-[9px] font-bold tracking-wider">
                    {t('sortear.series_badge')}
                  </div>
                )}
              </div>

              <div className="p-3 bg-[var(--bg-panel)] border-t border-[var(--bg-brick)] flex flex-col justify-between flex-1">
                <div>
                  <h3
                    onClick={() => onSelectMovie(movie)}
                    className="font-mono font-semibold text-xs text-[var(--ink-light)] line-clamp-1 hover:text-[var(--neon-blue)] cursor-pointer"
                  >
                    {movie.title}
                  </h3>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[var(--ink-muted)] mt-1">
                    <span>{year}</span>
                    <span className="flex items-center gap-1 text-[9px]">
                      <Calendar className="w-3 h-3" /> {dateAdded}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onRemove(movie)}
                  className="mt-3 w-full py-1 px-2 rounded bg-[var(--bg-void)] border border-red-500/30 hover:border-red-500 text-red-400 text-[10px] font-mono flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{t('watchlist.remove')}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
