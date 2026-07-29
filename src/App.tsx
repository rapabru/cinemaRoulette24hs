import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './i18n';

import {
  DEFAULT_FILTERS,
  fetchGenres,
  discoverMovies,
  fetchMovieDetails,
  performRandomDraw,
} from './lib/tmdb';

import type {
  Genre,
  FilterState,
  MovieSummary,
  MovieDetails,
} from './lib/tmdb';

import {
  getWatchedMovies,
  toggleMovieWatched,
} from './lib/watched';

import type { WatchedMovie } from './lib/watched';

import { Header } from './components/Header';
import { SortearButton } from './components/SortearButton';
import { FilterPanel } from './components/FilterPanel';
import { CatalogGrid } from './components/CatalogGrid';
import { ContextMenu } from './components/ContextMenu';
import { RouletteModal } from './components/RouletteModal';
import { WatchedView } from './components/WatchedView';
import { ApiKeyModal } from './components/ApiKeyModal';
import { MOCK_GENRES } from './lib/mockMovies';

export function App() {
  const { t, i18n } = useTranslation();

  // Dark/Light mode theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('cyber_theme');
    if (saved !== null) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply dark class to <html> element
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('cyber_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('cyber_theme', 'light');
    }
  }, [isDark]);

  // Tab state
  const [activeTab, setActiveTab] = useState<'catalog' | 'watched'>('catalog');

  // Filters state
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [genres, setGenres] = useState<Genre[]>(MOCK_GENRES.es);

  // Catalog state
  const [movies, setMovies] = useState<MovieSummary[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [resultsCount, setResultsCount] = useState(0);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);

  // Watched list state
  const [watchedList, setWatchedList] = useState<WatchedMovie[]>(getWatchedMovies());
  const watchedMovieIds = useMemo(
    () => new Set(watchedList.map((m) => m.id)),
    [watchedList]
  );

  // Random Draw Roulette modal state
  const [drawnMovie, setDrawnMovie] = useState<MovieDetails | null>(null);
  const [isRouletteOpen, setIsRouletteOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  // Context Menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    movie: MovieSummary;
  } | null>(null);

  // Api Key Modal state
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Load genres on mount or language change
  useEffect(() => {
    fetchGenres(i18n.language).then(setGenres);
  }, [i18n.language]);

  // Load catalog movies whenever filters, page, or language change
  const loadCatalog = useCallback(async () => {
    setIsLoadingCatalog(true);
    try {
      const data = await discoverMovies(filters, currentPage, i18n.language);
      setMovies(data.results || []);
      setTotalPages(data.total_pages || 1);
      setResultsCount(data.total_results || 0);
    } catch (err) {
      console.error('Failed to load movies catalog:', err);
      setMovies([]);
    } finally {
      setIsLoadingCatalog(false);
    }
  }, [filters, currentPage, i18n.language]);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  // Reset filters
  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  };

  // Perform Random Draw ("Sortear")
  const handleSortear = async () => {
    setIsDrawing(true);
    try {
      const result = await performRandomDraw(
        filters,
        watchedMovieIds,
        i18n.language
      );
      if (result) {
        setDrawnMovie(result);
        setIsRouletteOpen(true);
      } else {
        alert(t('errors.no_results'));
      }
    } catch (err: any) {
      console.error('Error during random draw:', err);
      if (err?.message === 'INVALID_API_KEY' || err?.message === 'NO_API_KEY') {
        setIsApiKeyModalOpen(true);
      } else {
        alert(t('errors.no_results'));
      }
    } finally {
      setIsDrawing(false);
    }
  };

  // Toggle Watched Status for any movie object
  const handleToggleWatched = (movie: {
    id: number;
    title: string;
    poster_path: string | null;
    release_date: string;
    vote_average?: number;
  }) => {
    const { updatedList } = toggleMovieWatched(movie);
    setWatchedList([...updatedList]);
  };

  // Open details from card or context menu
  const handleSelectMovie = async (movieSummary: MovieSummary | number) => {
    const id = typeof movieSummary === 'number' ? movieSummary : movieSummary.id;
    try {
      const details = await fetchMovieDetails(id, i18n.language);
      setDrawnMovie(details);
      setIsRouletteOpen(true);
    } catch (err) {
      console.error('Error fetching movie details:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-[var(--neon-magenta)] selection:text-white">
      <div>
        {/* Navigation Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isDark={isDark}
          setIsDark={setIsDark}
          onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
          watchedCount={watchedList.length}
        />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {activeTab === 'catalog' ? (
            <>
              {/* Signature Marquee "Sortear" Button */}
              <SortearButton onDraw={handleSortear} isLoading={isDrawing} />

              {/* Control Filter Panel */}
              <FilterPanel
                filters={filters}
                onChange={(newF) => {
                  setFilters(newF);
                  setCurrentPage(1);
                }}
                genres={genres}
                onReset={handleResetFilters}
                resultsCount={resultsCount}
              />

              {/* Movie Catalog Grid */}
              <CatalogGrid
                movies={movies}
                isLoading={isLoadingCatalog}
                watchedMovieIds={watchedMovieIds}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
                onContextMenu={(e, movie) => {
                  setContextMenu({ x: e.clientX, y: e.clientY, movie });
                }}
                onMovieClick={handleSelectMovie}
              />
            </>
          ) : (
            /* Watched List View */
            <WatchedView
              watchedList={watchedList}
              onUnmark={(id) => handleToggleWatched({ id, title: '', poster_path: '', release_date: '' })}
              onSelectMovie={handleSelectMovie}
            />
          )}
        </main>
      </div>

      {/* Right-click Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          movie={contextMenu.movie}
          isWatched={watchedMovieIds.has(contextMenu.movie.id)}
          onToggleWatched={handleToggleWatched}
          onViewDetails={handleSelectMovie}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Roulette Drawn Result Modal */}
      <RouletteModal
        movie={drawnMovie}
        isOpen={isRouletteOpen}
        onClose={() => setIsRouletteOpen(false)}
        onRedraw={handleSortear}
        isWatched={drawnMovie ? watchedMovieIds.has(drawnMovie.id) : false}
        onToggleWatched={handleToggleWatched}
        isLoading={isDrawing}
      />

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeySaved={loadCatalog}
      />

      {/* Footer & TMDB Attribution */}
      <footer className="brick-wall-bg border-t border-[var(--bg-brick)] py-6 mt-12 text-center text-xs font-mono text-[var(--ink-muted)]">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="text-[var(--neon-cyan)] font-bold tracking-wider">
            CYBERCAFÉ 24HS — MOVIE ROULETTE TERMINAL
          </p>
          <p className="text-[11px] max-w-2xl mx-auto opacity-80">
            {t('app.attribution')}
          </p>
        </div>
      </footer>
    </div>
  );
}
