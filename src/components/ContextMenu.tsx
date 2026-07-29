import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Info, Download, ExternalLink } from 'lucide-react';
import type { MovieSummary } from '../lib/tmdb';

interface ContextMenuProps {
  x: number;
  y: number;
  movie: MovieSummary;
  isWatched: boolean;
  onToggleWatched: (movie: MovieSummary) => void;
  onViewDetails: (movie: MovieSummary) => void;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  movie,
  isWatched,
  onToggleWatched,
  onViewDetails,
  onClose,
}) => {
  const { t } = useTranslation();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click or ESC key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Adjust coordinates to prevent clipping viewport edges
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const menuWidth = 240;
  const menuHeight = 160;

  const posX = x + menuWidth > windowWidth ? windowWidth - menuWidth - 10 : x;
  const posY = y + menuHeight > windowHeight ? windowHeight - menuHeight - 10 : y;

  const subdivxUrl = `https://www.subdivx.com/index.php?buscar=${encodeURIComponent(movie.title)}`;

  return (
    <div
      ref={menuRef}
      style={{ left: `${posX}px`, top: `${posY}px` }}
      className="fixed z-50 w-60 terminal-context-menu rounded-lg p-1.5 animate-fade-in select-none"
    >
      {/* Menu Header with Movie Title */}
      <div className="px-2.5 py-1.5 border-b border-[var(--ink-muted)]/20 mb-1">
        <p className="text-[11px] font-mono text-[var(--neon-amber)] line-clamp-1 font-bold">
          {movie.title}
        </p>
      </div>

      {/* Menu Actions */}
      <div className="space-y-1">
        <button
          onClick={() => {
            onToggleWatched(movie);
            onClose();
          }}
          className="w-full text-left px-2.5 py-2 rounded text-xs font-mono flex items-center justify-between text-[var(--ink-light)] hover:bg-[var(--neon-cyan)]/20 hover:text-[var(--neon-cyan)] transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Check className={`w-4 h-4 ${isWatched ? 'text-[var(--neon-green)]' : 'text-[var(--ink-muted)]'}`} />
            <span>{isWatched ? t('context_menu.unmark_watched') : t('context_menu.mark_watched')}</span>
          </span>
          {isWatched && <span className="text-[10px] text-[var(--neon-green)] font-bold">✔</span>}
        </button>

        <button
          onClick={() => {
            onViewDetails(movie);
            onClose();
          }}
          className="w-full text-left px-2.5 py-2 rounded text-xs font-mono flex items-center gap-2 text-[var(--ink-light)] hover:bg-[var(--neon-amber)]/20 hover:text-[var(--neon-amber)] transition-colors cursor-pointer"
        >
          <Info className="w-4 h-4 text-[var(--neon-amber)]" />
          <span>{t('context_menu.details')}</span>
        </button>

        <a
          href={subdivxUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="w-full text-left px-2.5 py-2 rounded text-xs font-mono flex items-center justify-between text-[var(--neon-magenta)] hover:bg-[var(--neon-magenta)]/20 transition-colors no-underline cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Download className="w-4 h-4 text-[var(--neon-magenta)]" />
            <span>Subtítulos (SubDivX)</span>
          </span>
          <ExternalLink className="w-3 h-3 opacity-70" />
        </a>
      </div>
    </div>
  );
};
