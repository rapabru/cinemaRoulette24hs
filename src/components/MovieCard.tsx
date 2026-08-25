import React, { useState } from 'react';
import { Star, Check, Play } from 'lucide-react';
import { getImageUrl } from '../lib/tmdb';
import type { MovieSummary } from '../lib/tmdb';

interface MovieCardProps {
  movie: MovieSummary;
  isWatched: boolean;
  onContextMenu: (e: React.MouseEvent, movie: MovieSummary) => void;
  onClick: (movie: MovieSummary) => void;
  entranceDelayMs?: number;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  isWatched,
  onContextMenu,
  onClick,
  entranceDelayMs = 0,
}) => {
  const year = movie.release_date ? movie.release_date.split('-')[0] : '';
  const posterUrl = getImageUrl(movie.poster_path, 'w500');
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu(e, movie);
  };

  return (
    <div
      onClick={() => onClick(movie)}
      onContextMenu={handleRightClick}
      style={{ animationDelay: `${entranceDelayMs}ms` }}
      className={`
        crt-monitor group cursor-pointer select-none flex flex-col justify-between animate-card-enter
        ${isWatched ? 'opacity-70 grayscale-[0.3]' : ''}
      `}
    >
      {/* Corner CRT Bezel Markers */}
      <span className="crt-bezel-corner top-1 left-1 border-t-2 border-l-2" />
      <span className="crt-bezel-corner top-1 right-1 border-t-2 border-r-2" />
      <span className="crt-bezel-corner bottom-1 left-1 border-b-2 border-l-2" />
      <span className="crt-bezel-corner bottom-1 right-1 border-b-2 border-r-2" />

      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/60">
        <img
          src={posterUrl}
          alt={movie.title}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform transition-opacity duration-300 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Rating Badge */}
        {movie.vote_average > 0 && (
          <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded border border-[var(--neon-amber)]/60 text-[var(--neon-amber)] font-mono text-[11px] font-bold flex items-center gap-1 shadow-md z-10">
            <Star className="w-3 h-3 fill-[var(--neon-amber)] text-[var(--neon-amber)]" />
            <span>{movie.vote_average.toFixed(1)}</span>
          </div>
        )}

        {/* Watched Ribbon/Badge */}
        {isWatched && (
          <div className="absolute top-2 left-2 bg-[var(--neon-green)] text-[var(--bg-void)] font-mono text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-neon-green z-10">
            <Check className="w-3 h-3" />
            <span>LA VI</span>
          </div>
        )}

        {/* Hover Cyber Play Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-[var(--neon-cyan)] text-[var(--bg-void)] flex items-center justify-center shadow-neon-cyan mb-2 transform group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
          <span className="font-mono text-xs font-bold text-[var(--neon-cyan)] tracking-wider uppercase mb-1">
            ▶ Reproducir (VidKing)
          </span>
          <p className="text-[10px] font-mono text-[var(--ink-light)] line-clamp-2 leading-snug">
            {movie.overview || 'Ver en el reproductor terminal.'}
          </p>
        </div>
      </div>

      {/* Card Info Footer */}
      <div className="p-3 bg-[var(--bg-panel)] border-t border-[var(--bg-brick)]">
        <h3 className="font-mono font-semibold text-xs text-[var(--ink-light)] line-clamp-1 group-hover:text-[var(--neon-cyan)] transition-colors">
          {movie.title}
        </h3>
        <div className="flex items-center justify-between text-[10px] font-mono text-[var(--ink-muted)] mt-1">
          <span>{year}</span>
          <span className="uppercase tracking-widest">{movie.original_language}</span>
        </div>
      </div>
    </div>
  );
};
