import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Dices, Check, Star, Clock, ExternalLink } from 'lucide-react';
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
}

export const RouletteModal: React.FC<RouletteModalProps> = ({
  movie,
  isOpen,
  onClose,
  onRedraw,
  isWatched,
  onToggleWatched,
  isLoading,
}) => {
  const { t } = useTranslation();

  if (!isOpen || !movie) return null;

  const year = movie.release_date ? movie.release_date.split('-')[0] : '';
  const director = movie.credits?.crew?.find((c) => c.job === 'Director')?.name || 'N/A';
  const topCast = movie.credits?.cast?.slice(0, 4).map((c) => c.name).join(', ') || 'N/A';
  const posterUrl = getImageUrl(movie.poster_path, 'w500');

  // Search google/justwatch hint link for watching options
  const watchSearchUrl = `https://www.google.com/search?q=donde+ver+${encodeURIComponent(movie.title)}+pelicula`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[var(--bg-panel)] border-2 border-[var(--neon-cyan)] rounded-2xl shadow-neon-cyan overflow-hidden crt-monitor my-8">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-3 bg-[var(--bg-brick)] border-b border-[var(--neon-cyan)]/40">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[var(--neon-green)] animate-ping" />
            <h2 className="font-display text-xs sm:text-sm text-[var(--neon-amber)] uppercase tracking-wider">
              {t('sortear.modal_title')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[var(--ink-muted)] hover:text-[var(--neon-magenta)] transition-colors rounded"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Movie Poster */}
          <div className="relative aspect-[2/3] w-full max-w-xs mx-auto rounded-lg overflow-hidden border border-[var(--neon-cyan)]/40 shadow-md">
            <img src={posterUrl} alt={movie.title} className="w-full h-full object-cover" />
            {isWatched && (
              <div className="absolute top-3 left-3 bg-[var(--neon-green)] text-[var(--bg-void)] font-mono font-bold text-xs px-2.5 py-1 rounded shadow-neon-green flex items-center gap-1">
                <Check className="w-4 h-4" /> LA VI
              </div>
            )}
          </div>

          {/* Movie Details */}
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
              <p className="text-xs font-mono text-[var(--ink-light)] leading-relaxed max-h-32 overflow-y-auto pr-1">
                {movie.overview || `Producción cinematográfica (${year}) dirigida por ${director}. Disponible para explorar en la base de datos.`}
              </p>
            </div>

            {/* Watch Hint Link */}
            <div className="bg-[var(--bg-void)] p-3 rounded-lg border border-[var(--neon-cyan)]/30 flex items-center justify-between text-xs font-mono">
              <span className="text-[var(--ink-muted)]">{t('sortear.watch_hint')}</span>
              <a
                href={watchSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[var(--neon-cyan)] font-bold hover:underline shrink-0 ml-2"
              >
                <span>¿Dónde ver?</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Quick Actions */}
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
                className={`px-4 py-3 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
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
      </div>
    </div>
  );
};
