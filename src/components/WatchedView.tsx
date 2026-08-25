import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Search, Trash2, Calendar, Star } from 'lucide-react';
import type { WatchedMovie } from '../lib/watched';
import { getImageUrl } from '../lib/tmdb';
import { ExportButtons } from './ExportButtons';

interface WatchedViewProps {
  watchedList: WatchedMovie[];
  onUnmark: (id: number) => void;
  onSelectMovie: (id: number) => void;
}

export const WatchedView: React.FC<WatchedViewProps> = ({
  watchedList,
  onUnmark,
  onSelectMovie,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredList = watchedList.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (watchedList.length === 0) {
    return (
      <div className="my-12 p-8 text-center bg-[var(--bg-panel)] border-2 border-dashed border-[var(--neon-green)]/40 rounded-xl max-w-xl mx-auto space-y-4">
        <Eye className="w-12 h-12 text-[var(--neon-green)] mx-auto animate-pulse" />
        <h3 className="font-display text-sm text-[var(--neon-green)] uppercase">
          {t('watched.empty')}
        </h3>
        <p className="text-xs font-mono text-[var(--ink-muted)] leading-relaxed">
          {t('watched.empty_hint')}
        </p>
      </div>
    );
  }

  return (
    <div className="my-6 space-y-6">
      {/* Header Bar Stats & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[var(--bg-panel)] border border-[var(--neon-green)]/40 rounded-xl shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[var(--bg-void)] border border-[var(--neon-green)] flex items-center justify-center text-[var(--neon-green)] shadow-neon-green">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-xs sm:text-sm text-[var(--neon-green)] uppercase tracking-wider">
              {t('watched.title')}
            </h2>
            <p className="text-xs font-mono text-[var(--ink-muted)]">
              {t('watched.total_count')}: <strong className="text-[var(--neon-cyan)]">{watchedList.length}</strong>
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
              placeholder={t('watched.search_placeholder')}
              className="w-full bg-[var(--bg-void)] border border-[var(--ink-muted)]/40 focus:border-[var(--neon-green)] text-[var(--ink-light)] font-mono text-xs px-3 py-2 pl-9 rounded outline-none transition-all"
            />
            <Search className="w-4 h-4 text-[var(--ink-muted)] absolute left-2.5 top-2.5" />
          </div>

          {/* Export Buttons */}
          <ExportButtons
            title={t('watched.title')}
            filenamePrefix="peliculas_vistas"
            rows={watchedList.map((m) => ({
              title: m.title,
              year: m.release_date ? m.release_date.split('-')[0] : '',
              rating: m.vote_average ? m.vote_average.toFixed(1) : 'N/A',
              dateLabel: new Date(m.dateWatched).toLocaleDateString(),
            }))}
          />
        </div>
      </div>

      {/* Grid of Watched Movies */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
        {filteredList.map((movie) => {
          const posterUrl = getImageUrl(movie.poster_path, 'w500');
          const year = movie.release_date ? movie.release_date.split('-')[0] : '';
          const dateAdded = new Date(movie.dateWatched).toLocaleDateString();

          return (
            <div
              key={movie.id}
              className="crt-monitor group relative bg-[var(--bg-panel)] border border-[var(--neon-green)]/40 rounded-lg overflow-hidden flex flex-col justify-between"
            >
              {/* Image & Remove Hover Action */}
              <div
                onClick={() => onSelectMovie(movie.id)}
                className="relative aspect-[2/3] w-full overflow-hidden cursor-pointer bg-black/60"
              >
                <img src={posterUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                
                {movie.vote_average && movie.vote_average > 0 && (
                  <div className="absolute top-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[var(--neon-amber)] font-mono text-[10px] font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-[var(--neon-amber)]" />
                    <span>{movie.vote_average.toFixed(1)}</span>
                  </div>
                )}
              </div>

              {/* Info & Unmark Button */}
              <div className="p-3 bg-[var(--bg-panel)] border-t border-[var(--bg-brick)] flex flex-col justify-between flex-1">
                <div>
                  <h3
                    onClick={() => onSelectMovie(movie.id)}
                    className="font-mono font-semibold text-xs text-[var(--ink-light)] line-clamp-1 hover:text-[var(--neon-green)] cursor-pointer"
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
                  onClick={() => onUnmark(movie.id)}
                  className="mt-3 w-full py-1 px-2 rounded bg-[var(--bg-void)] border border-red-500/30 hover:border-red-500 text-red-400 text-[10px] font-mono flex items-center justify-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{t('watched.unmark')}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
