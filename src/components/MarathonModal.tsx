import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Clapperboard, Dices, Loader2, RefreshCw, Trash2, Copy, Check, Clock, Star, Info } from 'lucide-react';
import { getImageUrl } from '../lib/tmdb';
import type { MovieDetails } from '../lib/tmdb';
import { orderForMarathon, totalRuntimeMinutes, estimatedEndTime, formatMinutes, marathonToText } from '../lib/marathon';
import { ExportButtons } from './ExportButtons';
import { useModalA11y } from '../hooks/useModalA11y';

interface MarathonModalProps {
  isOpen: boolean;
  onClose: () => void;
  movies: MovieDetails[];
  isDrawing: boolean;
  /** How many draws are still pending in the current batch (for the progress line). */
  pendingCount: number;
  onDraw: (count: number) => void;
  onRedrawSlot: (movieId: number) => void;
  onRemove: (movieId: number) => void;
  onOpenMovie: (movie: MovieDetails) => void;
  watchedMovieIds: Set<number>;
}

const SIZE_OPTIONS = [3, 5, 7];

/** "Modo maratón": draw a whole night's worth of movies at once. */
export const MarathonModal: React.FC<MarathonModalProps> = ({
  isOpen,
  onClose,
  movies,
  isDrawing,
  pendingCount,
  onDraw,
  onRedrawSlot,
  onRemove,
  onOpenMovie,
  watchedMovieIds,
}) => {
  const { t, i18n } = useTranslation();
  const [justCopied, setJustCopied] = useState(false);
  const dialogRef = useModalA11y<HTMLDivElement>(isOpen, onClose);

  if (!isOpen) return null;

  const ordered = orderForMarathon(movies);
  const total = totalRuntimeMinutes(ordered);
  const endTime = estimatedEndTime(ordered);
  const heading = t('marathon.list_heading', { count: ordered.length, date: new Date().toLocaleDateString(i18n.language) });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(marathonToText(ordered, heading));
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 1500);
    } catch {
      // clipboard unavailable, silently ignore
    }
  };

  const exportRows = ordered.map((m) => ({
    title: m.title,
    year: m.release_date ? m.release_date.slice(0, 4) : '',
    rating: m.vote_average > 0 ? m.vote_average.toFixed(1) : t('sortear.not_available'),
    dateLabel: m.runtime ? formatMinutes(m.runtime) : '',
  }));

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="marathon-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-[var(--bg-panel)] border-2 border-[var(--neon-amber)] rounded-2xl shadow-neon-amber overflow-hidden outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-[var(--bg-brick)] border-b border-[var(--neon-amber)]/40 shrink-0">
          <div className="flex items-center gap-2">
            <Clapperboard className="w-5 h-5 text-[var(--neon-amber)]" />
            <h2 id="marathon-modal-title" className="font-display text-xs sm:text-sm text-[var(--neon-amber)] uppercase tracking-wider">
              {t('marathon.title')}
            </h2>
          </div>
          <button
            onClick={onClose}
            title={t('sortear.close')}
            aria-label={t('sortear.close')}
            className="p-1 text-[var(--ink-muted)] hover:text-[var(--neon-magenta)] transition-colors rounded cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          <p className="text-xs font-mono text-[var(--ink-muted)] leading-relaxed">{t('marathon.description')}</p>

          {/* Size picker */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-[var(--ink-muted)] font-bold uppercase tracking-wider">{t('marathon.how_many')}</span>
            {SIZE_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => onDraw(n)}
                disabled={isDrawing}
                className="px-3 py-1.5 rounded font-bold bg-[var(--neon-amber)] hover:bg-[var(--neon-amber)]/80 disabled:opacity-40 disabled:cursor-wait text-[var(--bg-void)] shadow-neon-amber flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Dices className={`w-3.5 h-3.5 ${isDrawing ? 'animate-spin' : ''}`} />
                {t('marathon.draw_n', { count: n })}
              </button>
            ))}
            {isDrawing && (
              <span className="flex items-center gap-1.5 text-[var(--neon-cyan)]">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {t('marathon.drawing', { remaining: pendingCount })}
              </span>
            )}
          </div>

          {/* Summary */}
          {ordered.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-[var(--bg-void)] border border-[var(--neon-amber)]/30 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-[var(--neon-amber)] font-bold">
                <Clock className="w-4 h-4" />
                {t('marathon.total', { total: formatMinutes(total), count: ordered.length })}
              </span>
              <span className="text-[var(--ink-muted)]">
                {t('marathon.ends_at', { time: endTime.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' }) })}
              </span>
              <span className="text-[10px] text-[var(--ink-muted)] italic basis-full sm:basis-auto sm:ml-auto">{t('marathon.order_hint')}</span>
            </div>
          )}

          {/* List */}
          {ordered.length === 0 && !isDrawing ? (
            <div className="py-10 text-center text-xs font-mono text-[var(--ink-muted)] border-2 border-dashed border-[var(--ink-muted)]/30 rounded-xl">
              {t('marathon.empty')}
            </div>
          ) : (
            <ol className="space-y-2">
              {ordered.map((m, index) => {
                const year = m.release_date ? m.release_date.slice(0, 4) : '';
                return (
                  <li
                    key={m.id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-[var(--bg-void)] border border-[var(--ink-muted)]/30 hover:border-[var(--neon-amber)]/60 transition-colors"
                  >
                    <span className="w-6 text-center font-display text-xs text-[var(--neon-amber)]">{index + 1}</span>
                    <img
                      src={getImageUrl(m.poster_path, 'w185')}
                      alt=""
                      className="w-10 h-15 aspect-[2/3] object-cover rounded bg-black/40 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => onOpenMovie(m)}
                        className="font-mono text-xs font-bold text-[var(--ink-light)] hover:text-[var(--neon-cyan)] text-left truncate block max-w-full cursor-pointer"
                        title={t('context_menu.details')}
                      >
                        {m.title} {year && <span className="text-[var(--ink-muted)] font-normal">({year})</span>}
                      </button>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] font-mono text-[var(--ink-muted)] mt-0.5">
                        {m.runtime ? <span>{formatMinutes(m.runtime)}</span> : null}
                        {m.vote_average > 0 && (
                          <span className="flex items-center gap-0.5 text-[var(--neon-amber)]">
                            <Star className="w-3 h-3 fill-current" />
                            {m.vote_average.toFixed(1)}
                          </span>
                        )}
                        {m.genres?.slice(0, 2).map((g) => g.name).join(' · ')}
                        {watchedMovieIds.has(m.id) && (
                          <span className="text-[var(--neon-green)] font-bold">{t('sortear.watched_badge')}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onOpenMovie(m)}
                        title={t('context_menu.details')}
                        aria-label={t('context_menu.details')}
                        className="p-1.5 rounded text-[var(--ink-muted)] hover:text-[var(--neon-cyan)] transition-colors cursor-pointer"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onRedrawSlot(m.id)}
                        disabled={isDrawing}
                        title={t('marathon.redraw_slot')}
                        aria-label={t('marathon.redraw_slot')}
                        className="p-1.5 rounded text-[var(--ink-muted)] hover:text-[var(--neon-amber)] disabled:opacity-40 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onRemove(m.id)}
                        title={t('marathon.remove')}
                        aria-label={t('marathon.remove')}
                        className="p-1.5 rounded text-[var(--ink-muted)] hover:text-[var(--neon-magenta)] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          {/* Share / export */}
          {ordered.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--bg-brick)]">
              <button
                onClick={handleCopy}
                className="px-3.5 py-2 rounded-lg font-mono text-xs font-bold bg-[var(--neon-cyan)]/20 hover:bg-[var(--neon-cyan)] text-[var(--neon-cyan)] hover:text-[var(--bg-void)] border border-[var(--neon-cyan)]/40 flex items-center gap-2 transition-all cursor-pointer"
              >
                {justCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {justCopied ? t('sortear.shared_copied') : t('marathon.copy_list')}
              </button>
              <ExportButtons title={heading} filenamePrefix="maraton_cybercafe" rows={exportRows} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
