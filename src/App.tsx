import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './i18n';

import {
  DEFAULT_FILTERS,
  fetchGenres,
  discoverMovies,
  searchMovies,
  fetchMovieDetails,
  performRandomDraw,
  isAbortError,
} from './lib/tmdb';
import { playWinChime } from './lib/sound';
import { showToast } from './lib/toast';
import { createSeededRng, generateSeed } from './lib/seededRandom';
import { parseAppUrl, replaceUrlParams, buildNightDrawLink, MOVIE_PARAM, SEED_PARAM, FILTERS_PARAM, QUERY_PARAM } from './lib/shareLinks';

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

import {
  getDrawnHistory,
  addMovieToHistory,
  clearDrawnHistory,
} from './lib/history';

import type { DrawnHistoryItem } from './lib/history';

import {
  getStoredGoogleUser,
  saveGoogleUser,
} from './lib/auth';

import type { GoogleUser } from './lib/auth';

import { Header } from './components/Header';
import type { PendingMovie } from './components/RouletteModal';
import { VolumeControl } from './components/VolumeControl';
import { MarqueeTicker } from './components/MarqueeTicker';
import { ScrollDownArrow } from './components/ScrollDownArrow';
import { SortearButton } from './components/SortearButton';
import { FilterPanel } from './components/FilterPanel';
import { CatalogGrid } from './components/CatalogGrid';
import { ContextMenu } from './components/ContextMenu';
import { RouletteModal } from './components/RouletteModal';
import { WatchedView } from './components/WatchedView';
import { DrawHistoryView } from './components/DrawHistoryView';
import { ApiKeyModal } from './components/ApiKeyModal';
import { GoogleLoginModal } from './components/GoogleLoginModal';
import { ToastHost } from './components/ToastHost';
import { NightDrawBanner } from './components/NightDrawBanner';
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
  const [activeTab, setActiveTab] = useState<'catalog' | 'watched' | 'history'>('catalog');

  // Filters state
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [genres, setGenres] = useState<Genre[]>(MOCK_GENRES.es);

  // Title/keyword search state ("la lupa") — bypasses discover filters when active
  const [searchQuery, setSearchQuery] = useState('');

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

  // Draw History state
  const [historyList, setHistoryList] = useState<DrawnHistoryItem[]>(getDrawnHistory());

  // Google User auth state
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(getStoredGoogleUser());
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  // Random Draw Roulette modal state
  const [drawnMovie, setDrawnMovie] = useState<MovieDetails | null>(null);
  const [isRouletteOpen, setIsRouletteOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  // Snapshot of poster paths for the slot-machine reel, frozen once per draw so it
  // doesn't get reshuffled mid-spin by unrelated re-renders of App.
  const [spinPosterPool, setSpinPosterPool] = useState<(string | null)[]>([]);
  // Back-navigation stack: movies visited before drilling into a recommendation
  // or a marquee title while the modal was already open on a different movie.
  const [movieBackStack, setMovieBackStack] = useState<MovieDetails[]>([]);
  // What the modal shows while a movie's details are still being fetched, so
  // clicking a card gives instant feedback instead of a ~1s dead pause.
  const [pendingMovie, setPendingMovie] = useState<PendingMovie | null>(null);
  const pendingRequestRef = useRef(0);

  // Context Menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    movie: MovieSummary;
  } | null>(null);

  // Api Key Modal state
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // "Sorteo de la noche": a shared seed makes every browser that opens the
  // same link (same filters) draw the same sequence of movies.
  // Deep links (?movie=603 opens a card, ?seed=ABC123&f=... joins a night draw)
  // are read once, before any effect gets to rewrite the address bar.
  const initialUrlRef = useRef(parseAppUrl(window.location.search));
  const [nightSeed, setNightSeed] = useState<string | null>(initialUrlRef.current.nightDraw?.seed ?? null);
  const nightRngRef = useRef<(() => number) | null>(null);

  useEffect(() => {
    nightRngRef.current = nightSeed ? createSeededRng(`${nightSeed}:${new Date().toISOString().slice(0, 10)}`) : null;
    replaceUrlParams({ [SEED_PARAM]: nightSeed, ...(nightSeed ? {} : { [FILTERS_PARAM]: null, [QUERY_PARAM]: null }) });
  }, [nightSeed]);

  useEffect(() => {
    const { movieId, nightDraw } = initialUrlRef.current;
    if (nightDraw) {
      setFilters(nightDraw.filters);
      setSearchQuery(nightDraw.searchQuery);
    }
    if (movieId) handleSelectMovie(movieId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep ?movie= in the address bar in sync with the open card, so the URL is always shareable.
  useEffect(() => {
    const shownId = isRouletteOpen && !pendingMovie && drawnMovie ? String(drawnMovie.id) : null;
    replaceUrlParams({ [MOVIE_PARAM]: shownId });
  }, [isRouletteOpen, pendingMovie, drawnMovie]);

  const nightDrawLink = nightSeed ? buildNightDrawLink({ seed: nightSeed, filters, searchQuery }) : null;

  const copyNightDrawLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      showToast(t('night.link_copied'), 'success');
    } catch {
      showToast(link, 'info', 8000);
    }
  };

  const handleStartNightDraw = () => {
    const seed = generateSeed();
    setNightSeed(seed);
    copyNightDrawLink(buildNightDrawLink({ seed, filters, searchQuery }));
  };

  // Load genres on mount or language change
  useEffect(() => {
    fetchGenres(i18n.language).then(setGenres);
  }, [i18n.language]);

  // Load catalog movies whenever filters, search query, page, or language change.
  // Only the most recent request may touch state: typing "mat" → "matrix" fires
  // two requests, and if the first one answers last it must not overwrite the
  // grid. The previous request is also aborted so it stops using bandwidth.
  const catalogRequestRef = useRef<{ id: number; controller: AbortController | null }>({ id: 0, controller: null });

  const loadCatalog = useCallback(async () => {
    catalogRequestRef.current.controller?.abort();
    const controller = new AbortController();
    const requestId = ++catalogRequestRef.current.id;
    catalogRequestRef.current.controller = controller;
    const isCurrent = () => requestId === catalogRequestRef.current.id;

    setIsLoadingCatalog(true);
    try {
      const data = searchQuery.trim()
        ? await searchMovies(searchQuery, currentPage, i18n.language, controller.signal)
        : await discoverMovies(filters, currentPage, i18n.language, controller.signal);
      if (!isCurrent()) return;
      setMovies(data.results || []);
      setTotalPages(data.total_pages || 1);
      setResultsCount(data.total_results || 0);
    } catch (err) {
      if (isAbortError(err) || !isCurrent()) return;
      console.error('Failed to load movies catalog:', err);
      setMovies([]);
    } finally {
      if (isCurrent()) setIsLoadingCatalog(false);
    }
  }, [filters, searchQuery, currentPage, i18n.language]);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  // Reset filters
  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  };

  // Update title/keyword search ("la lupa")
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Perform Random Draw ("Sortear") and record in history.
  // Opens the roulette modal immediately so the slot-machine reel (RouletteModal, isLoading=true)
  // is visible while the real draw resolves, with a minimum spin duration so it always registers.
  const handleSortear = async () => {
    setIsDrawing(true);
    setIsRouletteOpen(true);
    setMovieBackStack([]);
    setSpinPosterPool(movies.map((m) => m.poster_path));
    try {
      const minSpinDelay = new Promise((resolve) => setTimeout(resolve, 1200));
      // Seeded draws ignore "skip watched" on purpose: everyone must land on the same movie.
      const drawFilters = nightRngRef.current ? { ...filters, skipWatched: false } : filters;
      const [result] = await Promise.all([
        performRandomDraw(drawFilters, watchedMovieIds, i18n.language, 0, searchQuery, nightRngRef.current ?? Math.random),
        minSpinDelay,
      ]);

      if (result) {
        setDrawnMovie(result);
        playWinChime();

        // Record in Draw History
        const updatedHistory = addMovieToHistory({
          id: result.id,
          title: result.title,
          poster_path: result.poster_path,
          release_date: result.release_date,
          vote_average: result.vote_average,
          genre_ids: result.genres?.map((g) => g.id),
        });
        setHistoryList([...updatedHistory]);
      } else {
        if (!drawnMovie) setIsRouletteOpen(false);
        showToast(t('errors.no_results'), 'warning');
      }
    } catch (err: any) {
      console.error('Error during random draw:', err);
      if (!drawnMovie) setIsRouletteOpen(false);
      if (err?.message === 'INVALID_API_KEY' || err?.message === 'NO_API_KEY') {
        setIsApiKeyModalOpen(true);
      } else {
        showToast(t('errors.no_results'), 'error');
      }
    } finally {
      setIsDrawing(false);
    }
  };

  // Clear History
  const handleClearHistory = () => {
    clearDrawnHistory();
    setHistoryList([]);
  };

  // Logout Google
  const handleLogoutGoogle = () => {
    saveGoogleUser(null);
    setGoogleUser(null);
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

  // Reopen the last drawn movie's card without drawing again
  const handleShowLastDrawn = () => {
    if (historyList.length > 0) handleSelectMovie(historyList[0]);
  };

  // Open details from card, context menu, recommendations carousel, or marquee.
  // If the modal is already open on a different movie, push it onto the back
  // stack first so the user can return to it with the "Volver" button.
  const handleSelectMovie = async (movieSummary: PendingMovie | number) => {
    const id = typeof movieSummary === 'number' ? movieSummary : movieSummary.id;
    const requestId = ++pendingRequestRef.current;
    const wasOpenOn = isRouletteOpen ? drawnMovie : null;

    setPendingMovie(
      typeof movieSummary === 'number'
        ? { id }
        : { id, title: movieSummary.title, poster_path: movieSummary.poster_path, release_date: movieSummary.release_date }
    );
    setIsRouletteOpen(true);

    try {
      const details = await fetchMovieDetails(id, i18n.language);
      if (requestId !== pendingRequestRef.current) return; // a newer click won
      if (wasOpenOn && wasOpenOn.id !== id) {
        setMovieBackStack((stack) => [...stack, wasOpenOn]);
      } else {
        setMovieBackStack([]);
      }
      setDrawnMovie(details);
      setPendingMovie(null);
    } catch (err) {
      if (requestId !== pendingRequestRef.current) return;
      console.error('Error fetching movie details:', err);
      setPendingMovie(null);
      if (!wasOpenOn) setIsRouletteOpen(false);
      showToast(t('errors.details_failed'), 'error');
    }
  };

  // Return to the previously viewed movie in the back stack, no re-fetch needed.
  const handleGoBack = () => {
    setMovieBackStack((stack) => {
      if (stack.length === 0) return stack;
      setDrawnMovie(stack[stack.length - 1]);
      return stack.slice(0, -1);
    });
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
          historyCount={historyList.length}
          googleUser={googleUser}
          onOpenGoogleLogin={() => setIsGoogleModalOpen(true)}
          onLogoutGoogle={handleLogoutGoogle}
        />

        {/* Neon Marquee Ticker */}
        <MarqueeTicker onSelectMovie={handleSelectMovie} />

        {/* Scroll-down invitation */}
        <ScrollDownArrow targetId="main-content-start" />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div id="main-content-start" key={activeTab} className="animate-channel-change">
          {activeTab === 'catalog' ? (
            <>
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
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                searchSuggestions={movies}
                isSearchLoading={isLoadingCatalog}
                onSelectMovie={handleSelectMovie}
              />

              {/* Shared-seed draw banner */}
              {nightSeed && nightDrawLink && (
                <NightDrawBanner
                  seed={nightSeed}
                  link={nightDrawLink}
                  onCopyLink={() => copyNightDrawLink(nightDrawLink)}
                  onExit={() => setNightSeed(null)}
                />
              )}

              {/* Signature Marquee "Sortear" Button (Positioned Below Filter Panel) */}
              <SortearButton onDraw={handleSortear} isLoading={isDrawing} />

              {/* Quick links under the button: last drawn movie, start a shared draw */}
              <div className="w-full flex flex-wrap justify-center gap-x-6 gap-y-1 -mt-2 mb-4 text-xs font-mono">
                {historyList.length > 0 && (
                  <button
                    onClick={handleShowLastDrawn}
                    className="text-[var(--neon-cyan)] hover:text-[var(--neon-amber)] underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    {t('sortear.view_last_drawn')}
                  </button>
                )}
                {!nightSeed && (
                  <button
                    onClick={handleStartNightDraw}
                    className="text-[var(--neon-magenta)] hover:text-[var(--neon-amber)] underline underline-offset-2 transition-colors cursor-pointer"
                    title={t('night.start_hint')}
                  >
                    {t('night.start')}
                  </button>
                )}
              </div>

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
          ) : activeTab === 'watched' ? (
            /* Watched List View */
            <WatchedView
              watchedList={watchedList}
              onUnmark={(id) => handleToggleWatched({ id, title: '', poster_path: '', release_date: '' })}
              onSelectMovie={handleSelectMovie}
            />
          ) : (
            /* Draw History View */
            <DrawHistoryView
              historyList={historyList}
              watchedMovieIds={watchedMovieIds}
              genres={genres}
              onClearHistory={handleClearHistory}
              onSelectMovie={handleSelectMovie}
              onToggleWatched={handleToggleWatched}
              onSortearAgain={handleSortear}
            />
          )}
          </div>

          {/* Discord Community Banner */}
          <div className="my-8 p-4 sm:p-5 bg-[var(--bg-panel)] border-2 border-[#5865F2]/60 hover:border-[#5865F2] rounded-xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 transition-all">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center text-white shrink-0 shadow-md">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 127.14 96.36">
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22c2.72-27.47-5.59-51.27-18.9-72.15ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.92,53.86,53,48.73,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.92,96.1,53,91,65.69,84.69,65.69Z" />
                </svg>
              </div>
              <div>
                <h4 className="font-display text-xs sm:text-sm text-white uppercase tracking-wider">
                  {t('app.discord_heading')}
                </h4>
                <p className="text-xs font-mono text-[var(--ink-muted)]">
                  {t('app.discord_description')}
                </p>
              </div>
            </div>

            <a
              href="https://discord.gg/dfSD65dgx"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white font-mono text-xs font-bold transition-all shadow-md flex items-center gap-2 shrink-0 no-underline cursor-pointer"
            >
              <span>{t('app.discord_join')}</span>
              <span className="text-xs">➔</span>
            </a>
          </div>
        </main>
      </div>

      {/* Floating Site-wide Mute Button */}
      <VolumeControl className="fixed bottom-5 right-5 z-40 shadow-lg" />

      {/* Non-blocking notifications (replaces alert()) */}
      <ToastHost />

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
        posterPool={spinPosterPool}
        pendingMovie={pendingMovie}
        onSelectMovie={handleSelectMovie}
        canGoBack={movieBackStack.length > 0}
        onGoBack={handleGoBack}
      />

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeySaved={loadCatalog}
        onDataImported={() => {
          setWatchedList(getWatchedMovies());
          setHistoryList(getDrawnHistory());
        }}
      />

      {/* Google Login Modal */}
      <GoogleLoginModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onLoginSuccess={(user) => setGoogleUser(user)}
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
