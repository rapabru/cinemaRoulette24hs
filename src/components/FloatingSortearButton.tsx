import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dices } from 'lucide-react';

interface FloatingSortearButtonProps {
  onDraw: () => void;
  isLoading: boolean;
  className?: string;
}

/**
 * Always-reachable "Sortear" trigger, fixed to a corner of the viewport like
 * VolumeControl's floating instance. Solves having to scroll all the way back
 * up to the big marquee button after browsing down through a long catalog.
 */
export const FloatingSortearButton: React.FC<FloatingSortearButtonProps> = ({ onDraw, isLoading, className = '' }) => {
  const { t } = useTranslation();

  return (
    <button
      onClick={onDraw}
      disabled={isLoading}
      title={isLoading ? t('sortear.drawing') : t('sortear.floating_hint')}
      aria-label={isLoading ? t('sortear.drawing') : t('sortear.floating_hint')}
      className={`w-14 h-14 rounded-full bg-[var(--neon-amber)] hover:bg-[var(--neon-amber)]/80 disabled:opacity-70 disabled:cursor-wait text-[var(--bg-void)] shadow-neon-amber border-2 border-[var(--bg-void)]/20 flex items-center justify-center transition-all cursor-pointer active:scale-95 ${className}`}
    >
      <Dices className={`w-6 h-6 ${isLoading ? 'animate-spin' : ''}`} />
    </button>
  );
};
