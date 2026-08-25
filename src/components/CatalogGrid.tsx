import React from 'react';
import { useTranslation } from 'react-i18next';
import type { MovieSummary } from '../lib/tmdb';
import { MovieCard } from './MovieCard';
import { AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

interface CatalogGridProps {
  movies: MovieSummary[];
  isLoading: boolean;
  watchedMovieIds: Set<number>;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onContextMenu: (e: React.MouseEvent, movie: MovieSummary) => void;
  onMovieClick: (movie: MovieSummary) => void;
}

export const CatalogGrid: React.FC<CatalogGridProps> = ({
  movies,
  isLoading,
  watchedMovieIds,
  currentPage,
  totalPages,
  onPageChange,
  onContextMenu,
  onMovieClick,
}) => {
  const { t } = useTranslation();

  // Skeleton loading state (12 skeleton cards)
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 my-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="crt-monitor bg-[var(--bg-panel)] rounded-lg overflow-hidden animate-pulse aspect-[2/3] flex flex-col justify-between p-3"
          >
            <div className="w-full h-full bg-[var(--bg-brick)]/60 rounded" />
            <div className="h-4 bg-[var(--bg-brick)] rounded w-3/4 mt-3" />
            <div className="h-3 bg-[var(--bg-brick)] rounded w-1/2 mt-2" />
          </div>
        ))}
      </div>
    );
  }

  // Empty State
  if (!movies || movies.length === 0) {
    return (
      <div className="my-12 p-8 text-center bg-[var(--bg-panel)] border-2 border-dashed border-[var(--neon-amber)]/40 rounded-xl max-w-xl mx-auto space-y-3">
        <AlertTriangle className="w-10 h-10 text-[var(--neon-amber)] mx-auto animate-bounce" />
        <h3 className="font-display text-sm text-[var(--neon-amber)] uppercase">
          {t('errors.no_results')}
        </h3>
        <p className="text-xs font-mono text-[var(--ink-muted)] leading-relaxed">
          {t('errors.no_results_hint')}
        </p>
      </div>
    );
  }

  return (
    <div className="my-6">
      {/* Movie Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
        {movies.map((movie, index) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            isWatched={watchedMovieIds.has(movie.id)}
            onContextMenu={onContextMenu}
            onClick={onMovieClick}
            entranceDelayMs={Math.min(index * 30, 400)}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8 py-4 font-mono text-xs">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-2 rounded bg-[var(--bg-panel)] border border-[var(--neon-cyan)]/40 hover:border-[var(--neon-cyan)] text-[var(--ink-light)] disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <span className="text-[var(--neon-cyan)] font-bold px-3 py-1.5 bg-[var(--bg-panel)] border border-[var(--ink-muted)]/20 rounded">
              Pág. {currentPage} / {Math.min(totalPages, 500)}
            </span>
            {totalPages >= 500 && (
              <span className="text-[10px] text-[var(--ink-muted)] font-mono">
                (Máx. 500 págs por filtro de un total de +1.000.000 en TMDB)
              </span>
            )}
          </div>

          <button
            onClick={() => onPageChange(Math.min(totalPages, 500, currentPage + 1))}
            disabled={currentPage >= Math.min(totalPages, 500)}
            className="flex items-center gap-1 px-3 py-2 rounded bg-[var(--bg-panel)] border border-[var(--neon-cyan)]/40 hover:border-[var(--neon-cyan)] text-[var(--ink-light)] disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            <span>Siguiente</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
