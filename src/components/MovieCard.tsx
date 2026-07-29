import React from 'react';
import { Star, Check } from 'lucide-react';
import { getImageUrl } from '../lib/tmdb';
import type { MovieSummary } from '../lib/tmdb';

interface MovieCardProps {
  movie: MovieSummary;
  isWatched: boolean;
  onContextMenu: (e: React.MouseEvent, movie: MovieSummary) => void;
  onClick: (movie: MovieSummary) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  isWatched,
  onContextMenu,
  onClick,
}) => {
  const year = movie.release_date ? movie.release_date.split('-')[0] : '';
  const posterUrl = getImageUrl(movie.poster_path, 'w500');

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu(e, movie);
  };

  return (
    <div
      onClick={() => onClick(movie)}
      onContextMenu={handleRightClick}
      className={`
        crt-monitor group cursor-pointer select-none flex flex-col justify-between
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
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Rating Badge */}
        {movie.vote_average > 0 && (
          <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded border border-[var(--neon-amber)]/60 text-[var(--neon-amber)] font-mono text-[11px] font-bold flex items-center gap-1 shadow-md">
            <Star className="w-3 h-3 fill-[var(--neon-amber)] text-[var(--neon-amber)]" />
            <span>{movie.vote_average.toFixed(1)}</span>
          </div>
        )}

        {/* Watched Ribbon/Badge */}
        {isWatched && (
          <div className="absolute top-2 left-2 bg-[var(--neon-green)] text-[var(--bg-void)] font-mono text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-neon-green">
            <Check className="w-3 h-3" />
            <span>LA VI</span>
          </div>
        )}

        {/* Hover Hint Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end text-left">
          <p className="text-[10px] font-mono text-[var(--neon-cyan)] line-clamp-3 leading-snug">
            {movie.overview || 'Sin descripción disponible.'}
          </p>
          <span className="text-[9px] font-mono text-[var(--ink-muted)] mt-1">
            (Clic dcho: Marcar "La vi")
          </span>
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
