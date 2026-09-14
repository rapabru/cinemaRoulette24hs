import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { MovieSummary } from '../lib/tmdb';
import { MovieCard } from './MovieCard';
import { AlertTriangle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

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
  // TMDB refuses pages beyond 500 regardless of total_pages.
  const lastPage = Math.min(totalPages, 500);
  const [pageInput, setPageInput] = useState(String(currentPage));

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  // ←/→ flip pages when nothing else (an input, a dialog) owns the keyboard.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (document.activeElement as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (document.querySelector('[role="dialog"]')) return;
      if (e.key === 'ArrowLeft' && currentPage > 1) onPageChange(currentPage - 1);
      if (e.key === 'ArrowRight' && currentPage < lastPage) onPageChange(currentPage + 1);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, lastPage, onPageChange]);

  const pageButtonClass =
    'flex items-center gap-1 px-3 py-2 rounded bg-[var(--bg-panel)] border border-[var(--neon-cyan)]/40 hover:border-[var(--neon-cyan)] text-[var(--ink-light)] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer';

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
        <nav
          aria-label={t('catalog.pagination_label')}
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-8 py-4 font-mono text-xs"
        >
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            title={t('catalog.first')}
            aria-label={t('catalog.first')}
            className={pageButtonClass}
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={pageButtonClass}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{t('catalog.previous')}</span>
          </button>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const target = parseInt(pageInput, 10);
              if (!isNaN(target)) onPageChange(Math.min(lastPage, Math.max(1, target)));
            }}
            className="flex items-center gap-1.5 text-[var(--neon-cyan)] font-bold px-3 py-1.5 bg-[var(--bg-panel)] border border-[var(--ink-muted)]/20 rounded"
          >
            <label htmlFor="catalog-page-input" className="sr-only">
              {t('catalog.go_to_page')}
            </label>
            <span>{t('catalog.page_prefix')}</span>
            <input
              id="catalog-page-input"
              type="text"
              inputMode="numeric"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value.replace(/[^0-9]/g, ''))}
              onBlur={() => setPageInput(String(currentPage))}
              title={t('catalog.go_to_page')}
              className="w-12 h-6 bg-[var(--bg-void)] border border-[var(--neon-cyan)]/40 focus:border-[var(--neon-cyan)] text-center text-[var(--ink-light)] rounded outline-none"
            />
            <span>/ {lastPage}</span>
          </form>

          <button
            onClick={() => onPageChange(Math.min(lastPage, currentPage + 1))}
            disabled={currentPage >= lastPage}
            className={pageButtonClass}
          >
            <span>{t('catalog.next')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPageChange(lastPage)}
            disabled={currentPage >= lastPage}
            title={t('catalog.last')}
            aria-label={t('catalog.last')}
            className={pageButtonClass}
          >
            <ChevronsRight className="w-4 h-4" />
          </button>

          {totalPages >= 500 && (
            <span className="basis-full text-center text-[10px] text-[var(--ink-muted)] font-mono">
              {t('catalog.page_cap_hint')}
            </span>
          )}
          <span className="basis-full text-center text-[10px] text-[var(--ink-muted)] font-mono opacity-70">
            {t('catalog.keyboard_hint')}
          </span>
        </nav>
      )}
    </div>
  );
};
