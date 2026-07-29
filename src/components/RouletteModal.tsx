import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Dices, Check, Star, Clock, Play, Info, Tv, Download, ExternalLink } from 'lucide-react';
import { getImageUrl } from '../lib/tmdb';
import type { MovieDetails } from '../lib/tmdb';

interface RouletteModalProps {
  movie: MovieDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onRedraw: () => void;
  isWatched: boolean;
  onToggleWatched: (movie: MovieDetails) => void;
  isLoading: boolean;
  initialMode?: 'details' | 'player';
}

export const RouletteModal: React.FC<RouletteModalProps> = ({
  movie,
  isOpen,
  onClose,
  onRedraw,
  isWatched,
  onToggleWatched,
  isLoading,
  initialMode = 'details',
}) => {
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState<'details' | 'player'>(initialMode);

  if (!isOpen || !movie) return null;

  const year = movie.release_date ? movie.release_date.split('-')[0] : '';
  const director = movie.credits?.crew?.find((c) => c.job === 'Director')?.name || 'N/A';
  const topCast = movie.credits?.cast?.slice(0, 4).map((c) => c.name).join(', ') || 'N/A';
  const posterUrl = getImageUrl(movie.poster_path, 'w500');

  // VidKing Embed URL for Movie (TMDB ID)
  const vidkingEmbedUrl = `https://www.vidking.net/embed/movie/${movie.id}?color=35E6FF`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[var(--bg-panel)] border-2 border-[var(--neon-cyan)] rounded-2xl shadow-neon-cyan overflow-hidden crt-monitor">
        {/* Sticky Header Bar */}
        <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-3 bg-[var(--bg-brick)] border-b border-[var(--neon-cyan)]/40 gap-2 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[var(--neon-green)] animate-ping" />
            <h2 className="font-display text-xs sm:text-sm text-[var(--neon-amber)] uppercase tracking-wider line-clamp-1">
              {movie.title} ({year})
            </h2>
          </div>

          {/* View Toggle Tabs: Details vs VidKing Player */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('details')}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'details'
                  ? 'bg-[var(--neon-cyan)] text-[var(--bg-void)] shadow-neon-cyan'
                  : 'bg-[var(--bg-void)] text-[var(--ink-muted)] hover:text-[var(--ink-light)]'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Ficha</span>
            </button>

            <button
              onClick={() => setActiveView('player')}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'player'
                  ? 'bg-[var(--neon-magenta)] text-white shadow-neon-magenta animate-pulse'
                  : 'bg-[var(--bg-void)] text-[var(--neon-cyan)] border border-[var(--neon-cyan)]/40 hover:bg-[var(--neon-cyan)]/20'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>▶ Reproductor</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 ml-1 text-[var(--ink-muted)] hover:text-[var(--neon-magenta)] transition-colors rounded cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {activeView === 'player' ? (
            /* VidKing Video Player View */
            <div className="space-y-4">
              <div className="relative aspect-video w-full max-h-[58vh] rounded-xl overflow-hidden border-2 border-[var(--neon-cyan)] shadow-neon-cyan bg-black mx-auto">
                <iframe
                  src={vidkingEmbedUrl}
                  className="w-full h-full border-0"
                  allowFullScreen
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  title={`VidKing Player - ${movie.title}`}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs font-mono text-[var(--ink-muted)] px-1 gap-2">
                <span className="flex items-center gap-1.5 text-[var(--neon-cyan)] font-bold">
                  <Tv className="w-4 h-4" /> Terminal VidKing Activo
                </span>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveView('details')}
                    className="text-[var(--neon-amber)] hover:underline font-bold"
                  >
                    Ficha Técnica
                  </button>
                </div>
              </div>

              {/* Bottom Quick Action Bar inside Player View */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-[var(--bg-brick)]">
                <button
                  onClick={onRedraw}
                  disabled={isLoading}
                  className="flex-1 bg-[var(--neon-amber)] hover:bg-[var(--neon-amber)]/80 text-[var(--bg-void)] font-bold font-mono text-xs py-2.5 px-4 rounded-lg shadow-neon-amber flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Dices className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{isLoading ? t('sortear.drawing') : t('sortear.again')}</span>
                </button>

                <a
                  href={`https://www.subdivx.com/index.php?buscar=${encodeURIComponent(movie.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 bg-[var(--neon-magenta)]/20 hover:bg-[var(--neon-magenta)] text-[var(--neon-magenta)] hover:text-white border border-[var(--neon-magenta)]/40 shadow-sm"
                  title="Buscar y descargar subtítulos en español para esta película en SubDivX"
                >
                  <Download className="w-4 h-4" />
                  <span>Subtítulos (SubDivX)</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>

                <button
                  onClick={() => onToggleWatched(movie)}
                  className={`px-4 py-2.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                    isWatched
                      ? 'bg-[var(--neon-green)] text-[var(--bg-void)] border-[var(--neon-green)] shadow-neon-green'
                      : 'border-[var(--neon-cyan)] text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/20'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{isWatched ? 'Vista ✔' : t('sortear.watched_action')}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Movie Details View */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Movie Poster */}
              <div className="relative aspect-[2/3] w-full max-w-xs mx-auto rounded-lg overflow-hidden border border-[var(--neon-cyan)]/40 shadow-md group">
                <img src={posterUrl} alt={movie.title} className="w-full h-full object-cover" />

                {/* Play Overlay Button on Poster */}
                <button
                  onClick={() => setActiveView('player')}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white font-mono text-xs font-bold cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-[var(--neon-magenta)] flex items-center justify-center shadow-neon-magenta animate-bounce">
                    <Play className="w-6 h-6 fill-white ml-0.5" />
                  </div>
                  <span>▶ REPRODUCIR</span>
                </button>

                {isWatched && (
                  <div className="absolute top-3 left-3 bg-[var(--neon-green)] text-[var(--bg-void)] font-mono font-bold text-xs px-2.5 py-1 rounded shadow-neon-green flex items-center gap-1 pointer-events-none">
                    <Check className="w-4 h-4" /> LA VI
                  </div>
                )}
              </div>

              {/* Details Content */}
              <div className="md:col-span-2 space-y-4 text-left">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="font-mono text-xl sm:text-2xl font-bold text-[var(--ink-light)]">
                      {movie.title}
                    </h1>
                    <span className="text-sm font-mono text-[var(--neon-amber)] font-bold">
                      ({year})
                    </span>
                  </div>
                  {movie.tagline && (
                    <p className="text-xs font-mono text-[var(--neon-cyan)] italic">
                      "{movie.tagline}"
                    </p>
                  )}
                </div>

                {/* Badges: Rating, Runtime, Language */}
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                  {movie.vote_average > 0 && (
                    <div className="flex items-center gap-1 text-[var(--neon-amber)] bg-[var(--bg-void)] px-2.5 py-1 rounded border border-[var(--neon-amber)]/40 font-bold">
                      <Star className="w-3.5 h-3.5 fill-[var(--neon-amber)]" />
                      <span>{movie.vote_average.toFixed(1)} / 10</span>
                    </div>
                  )}

                  {movie.runtime && movie.runtime > 0 && (
                    <div className="flex items-center gap-1 text-[var(--ink-light)] bg-[var(--bg-void)] px-2.5 py-1 rounded border border-[var(--ink-muted)]/30">
                      <Clock className="w-3.5 h-3.5 text-[var(--neon-cyan)]" />
                      <span>{movie.runtime} {t('sortear.minutes')}</span>
                    </div>
                  )}

                  <div className="uppercase font-bold text-[var(--ink-muted)] bg-[var(--bg-void)] px-2.5 py-1 rounded border border-[var(--ink-muted)]/30">
                    {movie.original_language}
                  </div>
                </div>

                {/* Genre Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {movie.genres?.map((g) => (
                    <span
                      key={g.id}
                      className="px-2 py-0.5 text-[11px] font-mono rounded bg-[var(--neon-magenta)]/20 text-[var(--neon-magenta)] border border-[var(--neon-magenta)]/40 font-semibold"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>

                {/* Director & Cast */}
                <div className="space-y-1 text-xs font-mono text-[var(--ink-light)] border-t border-[var(--bg-brick)] pt-3">
                  <p>
                    <strong className="text-[var(--neon-amber)]">{t('sortear.director')}:</strong> {director}
                  </p>
                  <p>
                    <strong className="text-[var(--neon-amber)]">{t('sortear.cast')}:</strong> {topCast}
                  </p>
                </div>

                {/* Overview */}
                <div className="border-t border-[var(--bg-brick)] pt-3">
                  <h4 className="text-xs font-mono uppercase text-[var(--ink-muted)] mb-1">
                    {t('sortear.overview')}
                  </h4>
                  <p className="text-xs font-mono text-[var(--ink-light)] leading-relaxed max-h-28 overflow-y-auto pr-1">
                    {movie.overview || `Producción cinematográfica (${year}) dirigida por ${director}. Disponible para explorar en la base de datos.`}
                  </p>
                </div>

                {/* Direct Play Banner & Subtitles Actions */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => setActiveView('player')}
                    className="flex-1 bg-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/80 text-[var(--bg-void)] font-mono text-xs font-bold py-3 px-4 rounded-lg shadow-neon-cyan flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-[var(--bg-void)]" />
                    <span>▶ REPRODUCIR EN VIVO (VidKing)</span>
                  </button>

                  <a
                    href={`https://www.subdivx.com/index.php?buscar=${encodeURIComponent(movie.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 bg-[var(--neon-magenta)]/20 hover:bg-[var(--neon-magenta)] text-[var(--neon-magenta)] hover:text-white border border-[var(--neon-magenta)]/40 shadow-sm"
                    title="Buscar y descargar subtítulos en español para esta película en SubDivX"
                  >
                    <Download className="w-4 h-4" />
                    <span>Subtítulos (SubDivX)</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                  </a>
                </div>

                {/* Bottom Quick Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-[var(--bg-brick)]">
                  <button
                    onClick={onRedraw}
                    disabled={isLoading}
                    className="flex-1 bg-[var(--neon-amber)] hover:bg-[var(--neon-amber)]/80 text-[var(--bg-void)] font-bold font-mono text-xs py-3 px-4 rounded-lg shadow-neon-amber flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Dices className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>{isLoading ? t('sortear.drawing') : t('sortear.again')}</span>
                  </button>

                  <button
                    onClick={() => onToggleWatched(movie)}
                    className={`px-4 py-3 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                      isWatched
                        ? 'bg-[var(--neon-green)] text-[var(--bg-void)] border-[var(--neon-green)] shadow-neon-green'
                        : 'border-[var(--neon-cyan)] text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/20'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>{isWatched ? 'Vista ✔' : t('sortear.watched_action')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
