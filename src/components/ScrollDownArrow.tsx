import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';

interface ScrollDownArrowProps {
  targetId: string;
}

/** Big bouncing arrow inviting the visitor to scroll down into the content below. */
export const ScrollDownArrow: React.FC<ScrollDownArrowProps> = ({ targetId }) => {
  const { t } = useTranslation();

  return (
    <div className="w-full flex justify-center py-2">
      <button
        onClick={() => document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        title={t('app.scroll_down_hint')}
        className="flex flex-col items-center gap-0.5 text-[var(--neon-cyan)] hover:text-[var(--neon-amber)] transition-colors cursor-pointer group"
      >
        <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--ink-muted)] group-hover:text-[var(--neon-amber)] transition-colors">
          {t('app.scroll_down_hint')}
        </span>
        <ChevronDown className="w-9 h-9 animate-bounce" />
      </button>
    </div>
  );
};
