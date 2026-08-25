import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Dices, Check, Star, Clock, Play, Info, Tv, Download, ExternalLink, Film, Video } from 'lucide-react';
import { getImageUrl, getTrailerVideo, getWatchProviders } from '../lib/tmdb';
import type { MovieDetails } from '../lib/tmdb';
import { SlotReel } from './SlotReel';

interface RouletteModalProps {
  movie: MovieDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onRedraw: () => void;
  isWatched: boolean;
  onToggleWatched: (movie: MovieDetails) => void;
  isLoading: boolean;
  initialMode?: 'details' | 'player';
  posterPool?: (string | null)[];
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
  posterPool = [],
}) => {
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState<'details' | 'player'>(initialMode);
  const [playerProvider, setPlayerProvider] = useState<'vidking' | 'playimdb' | 'trailer'>('vidking');

  if (!isOpen) return null;

  // Sorteo en curso: mostrar el carrete tragamonedas en vez de la ficha (o la anterior, en un re-sorteo)
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
        <div className="relative w-full max-w-sm bg-[var(--bg-panel)] border-2 border-[var(--neon-cyan)] rounded-2xl shadow-neon-cyan overflow-hidden crt-monitor">
          <SlotReel posterPaths={posterPool} />
        </div>
      </div>
    );
  }

  if (!movie) return null;

  const trailer = getTrailerVideo(movie);
  const trailerEmbedUrl = trailer ? `https://www.youtube.com/embed/${trailer.key}?autoplay=1` : null;
  const watchProviders = getWatchProviders(movie);

  const year = movie.release_date ? movie.release_date.split('-')[0] : '';
  const director = movie.credits?.crew?.find((c) => c.job === 'Director')?.name || 'N/A';
  const topCast = movie.credits?.cast?.slice(0, 4).map((c) => c.name).join(', ') || 'N/A';
  const posterUrl = getImageUrl(movie.poster_path, 'w500');

  // Option 1: VidKing Embed URL (TMDB ID)
  const vidkingEmbedUrl = `https://www.vidking.net/embed/movie/${movie.id}?color=35E6FF`;

  // Option 2: PlayIMDB Embed URL (IMDB ID, or fallbacks)
  const imdbId = movie.imdb_id;
  const playImdbEmbedUrl = imdbId
    ? `https://www.playimdb.com/es-es/title/${imdbId}/`
    : `https://www.playimdb.com/title/tt${movie.id}/`;

  const playImdbDirectUrl = imdbId
    ? `https://www.playimdb.com/es-es/title/${imdbId}/`
    : `https://www.google.com/search?q=playimdb+${encodeURIComponent(movie.title)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[var(--bg-panel)] border-2 border-[var(--neon-cyan)] rounded-2xl shadow-neon-cyan overflow-hidden crt-monitor animate-result-flash">
        {/* Sticky Header Bar */}
        <div className="relative flex flex-wrap items-center justify-between px-4 sm:px-6 py-3 bg-[var(--bg-brick)] border-b border-[var(--neon-cyan)]/40 gap-2 shrink-0 pr-12">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[var(--neon-green)] animate-ping" />
              <h2 className="font-display text-xs sm:text-sm text-[var(--neon-amber)] uppercase tracking-wider line-clamp-1">
                {movie.title} ({year})
              </h2>
            </div>

            {/* View Toggle Tabs: Details vs Video Player */}
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
            </div>
          </div>

          {/* Always Fixed Top Right Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-4 sm:right-5 p-1 text-[var(--ink-muted)] hover:text-[var(--neon-magenta)] transition-colors rounded cursor-pointer z-10"
            title="Cerrar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {activeView === 'player' ? (
            /* Video Player View (Option 1: VidKing vs Option 2: PlayIMDB) */
            <div className="space-y-4">
              {/* Option Selector Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-[var(--bg-brick)] rounded-lg border border-[var(--neon-cyan)]/30 text-xs font-mono">
                <span className="text-[var(--ink-muted)] font-bold uppercase tracking-wider">
                  Servidores de Reproducción:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPlayerProvider('vidking')}
                    className={`px-3 py-1.5 rounded font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      playerProvider === 'vidking'
                        ? 'bg-[var(--neon-cyan)] text-[var(--bg-void)] shadow-neon-cyan'
                        : 'bg-[var(--bg-void)] text-[var(--ink-muted)] hover:text-[var(--ink-light)] border border-[var(--ink-muted)]/30'
                    }`}
                  >
                    <Tv className="w-3.5 h-3.5" />
                    <span>Opción 1: VidKing</span>
                  </button>

                  <button
                    onClick={() => setPlayerProvider('playimdb')}
                    className={`px-3 py-1.5 rounded font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      playerProvider === 'playimdb'
                        ? 'bg-[var(--neon-amber)] text-[var(--bg-void)] shadow-neon-amber'
                        : 'bg-[var(--bg-void)] text-[var(--ink-muted)] hover:text-[var(--ink-light)] border border-[var(--ink-muted)]/30'
                    }`}
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Opción 2: PlayIMDB</span>
                  </button>

                  {trailerEmbedUrl && (
                    <button
                      onClick={() => setPlayerProvider('trailer')}
                      className={`px-3 py-1.5 rounded font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        playerProvider === 'trailer'
                          ? 'bg-[var(--neon-magenta)] text-white shadow-neon-magenta'
                          : 'bg-[var(--bg-void)] text-[var(--ink-muted)] hover:text-[var(--ink-light)] border border-[var(--ink-muted)]/30'
                      }`}
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>{t('sortear.trailer')}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Player Iframe Display */}
              {playerProvider === 'vidking' ? (
                <div className="relative aspect-video w-full max-h-[58vh] rounded-xl overflow-hidden border-2 border-[var(--neon-cyan)] shadow-neon-cyan bg-black mx-auto">
                  <iframe
                    src={vidkingEmbedUrl}
                    className="w-full h-full border-0"
                    allowFullScreen
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    title={`VidKing Player - ${movie.title}`}
                  />
                </div>
              ) : playerProvider === 'playimdb' ? (
                <div className="relative aspect-video w-full max-h-[58vh] rounded-xl overflow-hidden border-2 border-[var(--neon-amber)] shadow-neon-amber bg-black mx-auto">
                  <iframe
                    src={playImdbEmbedUrl}
                    className="w-full h-full border-0"
                    allowFullScreen
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    title={`PlayIMDB Player - ${movie.title}`}
                  />
                </div>
              ) : trailerEmbedUrl ? (
                <div className="relative aspect-video w-full max-h-[58vh] rounded-xl overflow-hidden border-2 border-[var(--neon-magenta)] shadow-neon-magenta bg-black mx-auto">
                  <iframe
                    src={trailerEmbedUrl}
                    className="w-full h-full border-0"
                    allowFullScreen
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    title={`Trailer - ${movie.title}`}
                  />
                </div>
              ) : null}

              {/* Status & Subtitle Bar */}
              <div className="flex flex-wrap items-center justify-between text-xs font-mono text-[var(--ink-muted)] px-1 gap-2">
                <span className={`flex items-center gap-1.5 font-bold ${
                  playerProvider === 'vidking'
                    ? 'text-[var(--neon-cyan)]'
                    : playerProvider === 'playimdb'
                      ? 'text-[var(--neon-amber)]'
                      : 'text-[var(--neon-magenta)]'
                }`}>
                  {playerProvider === 'trailer' ? <Video className="w-4 h-4" /> : <Tv className="w-4 h-4" />}
                  {playerProvider === 'vidking'
                    ? 'Terminal Opción 1: VidKing Activo'
                    : playerProvider === 'playimdb'
                      ? `Terminal Opción 2: PlayIMDB Activo ${imdbId ? `(${imdbId})` : ''}`
                      : `${t('sortear.trailer')} — YouTube`}
                </span>

                {playerProvider === 'playimdb' && (
                  <a
                    href={playImdbDirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--neon-amber)] hover:underline flex items-center gap-1 font-bold"
                  >
                    <span>Abrir en PlayIMDB externa</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
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

                {/* Watch Providers ("Dónde ver") */}
                {watchProviders && (watchProviders.flatrate?.length || watchProviders.rent?.length || watchProviders.buy?.length) ? (
                  <div className="border-t border-[var(--bg-brick)] pt-3">
                    <h4 className="text-xs font-mono uppercase text-[var(--ink-muted)] mb-2">
                      {t('sortear.watch_providers')}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {[...(watchProviders.flatrate || []), ...(watchProviders.rent || []), ...(watchProviders.buy || [])]
                        .filter((p, i, arr) => arr.findIndex((x) => x.provider_id === p.provider_id) === i)
                        .slice(0, 8)
                        .map((provider) => (
                          <img
                            key={provider.provider_id}
                            src={getImageUrl(provider.logo_path, 'w185')}
                            alt={provider.provider_name}
                            title={provider.provider_name}
                            className="w-9 h-9 rounded-lg border border-[var(--ink-muted)]/30 object-cover"
                          />
                        ))}
                    </div>
                  </div>
                ) : null}

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

                {/* Direct Play Banners & Subtitles Actions */}
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => {
                        setPlayerProvider('vidking');
                        setActiveView('player');
                      }}
                      className="flex-1 bg-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/80 text-[var(--bg-void)] font-mono text-xs font-bold py-2.5 px-3 rounded-lg shadow-neon-cyan flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-[var(--bg-void)]" />
                      <span>▶ Opción 1: VidKing</span>
                    </button>

                    <button
                      onClick={() => {
                        setPlayerProvider('playimdb');
                        setActiveView('player');
                      }}
                      className="flex-1 bg-[var(--neon-amber)] hover:bg-[var(--neon-amber)]/80 text-[var(--bg-void)] font-mono text-xs font-bold py-2.5 px-3 rounded-lg shadow-neon-amber flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Film className="w-4 h-4 fill-[var(--bg-void)]" />
                      <span>▶ Opción 2: PlayIMDB</span>
                    </button>

                    {trailerEmbedUrl && (
                      <button
                        onClick={() => {
                          setPlayerProvider('trailer');
                          setActiveView('player');
                        }}
                        className="flex-1 bg-[var(--neon-magenta)] hover:bg-[var(--neon-magenta)]/80 text-white font-mono text-xs font-bold py-2.5 px-3 rounded-lg shadow-neon-magenta flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Video className="w-4 h-4" />
                        <span>▶ {t('sortear.trailer')}</span>
                      </button>
                    )}
                  </div>

                  <a
                    href={`https://www.subdivx.com/index.php?buscar=${encodeURIComponent(movie.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 bg-[var(--neon-magenta)]/20 hover:bg-[var(--neon-magenta)] text-[var(--neon-magenta)] hover:text-white border border-[var(--neon-magenta)]/40 shadow-sm"
                    title="Buscar y descargar subtítulos en español para esta película en SubDivX"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar Subtítulos en SubDivX</span>
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
