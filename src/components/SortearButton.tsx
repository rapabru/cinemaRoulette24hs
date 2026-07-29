import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dices, Sparkles } from 'lucide-react';

interface SortearButtonProps {
  onDraw: () => void;
  isLoading: boolean;
}

export const SortearButton: React.FC<SortearButtonProps> = ({ onDraw, isLoading }) => {
  const { t } = useTranslation();

  return (
    <div className="w-full flex justify-center py-4 my-2">
      <button
        onClick={onDraw}
        disabled={isLoading}
        className={`
          neon-marquee-btn
          group relative inline-flex items-center justify-center gap-3
          px-8 py-4 sm:px-12 sm:py-5 rounded-xl
          font-display text-sm sm:text-base tracking-wider uppercase
          cursor-pointer overflow-hidden select-none
          ${isLoading ? 'opacity-80 cursor-wait animate-pulse' : ''}
        `}
      >
        {/* Glow halo backing layer */}
        <span className="absolute inset-0 bg-gradient-to-r from-[var(--neon-magenta)]/20 via-[var(--neon-amber)]/20 to-[var(--neon-cyan)]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Dice Icon with Spinning Animation when Loading */}
        <Dices className={`w-6 h-6 sm:w-7 sm:h-7 text-[var(--neon-cyan)] group-hover:text-[var(--neon-amber)] transition-colors ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />

        <span>
          {isLoading ? t('sortear.drawing') : t('sortear.button')}
        </span>

        <Sparkles className="w-5 h-5 text-[var(--neon-amber)] group-hover:text-[var(--neon-magenta)] transition-colors" />

        {/* Small corner neon screws/fixtures */}
        <span className="absolute top-1 left-1.5 w-1.5 h-1.5 rounded-full bg-[var(--neon-cyan)] opacity-70" />
        <span className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-[var(--neon-cyan)] opacity-70" />
        <span className="absolute bottom-1 left-1.5 w-1.5 h-1.5 rounded-full bg-[var(--neon-cyan)] opacity-70" />
        <span className="absolute bottom-1 right-1.5 w-1.5 h-1.5 rounded-full bg-[var(--neon-cyan)] opacity-70" />
      </button>
    </div>
  );
};
