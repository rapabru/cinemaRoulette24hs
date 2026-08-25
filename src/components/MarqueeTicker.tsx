import React from 'react';
import { useTranslation } from 'react-i18next';
import type { DrawnHistoryItem } from '../lib/history';

interface MarqueeTickerProps {
  historyList: DrawnHistoryItem[];
}

const WELCOME_PHRASES_ES = [
  '🎬 CYBERCAFÉ 24HS — ABIERTO TODA LA NOCHE',
  '🎰 PRESIONÁ SORTEAR Y DESCUBRÍ TU PRÓXIMA PELÍCULA',
  '💬 VEMOS PELÍCULAS JUNTOS EN EL DISCORD, TODAS LAS NOCHES',
];

const WELCOME_PHRASES_EN = [
  '🎬 CYBERCAFÉ 24HS — OPEN ALL NIGHT',
  '🎰 HIT RANDOM DRAW AND FIND YOUR NEXT MOVIE',
  '💬 WE WATCH MOVIES TOGETHER ON DISCORD, EVERY NIGHT',
];

export const MarqueeTicker: React.FC<MarqueeTickerProps> = ({ historyList }) => {
  const { t, i18n } = useTranslation();

  const items =
    historyList.length > 0
      ? historyList.slice(0, 10).map((m) => `🎲 ${m.title}${m.release_date ? ` (${m.release_date.split('-')[0]})` : ''}`)
      : i18n.language === 'en'
        ? WELCOME_PHRASES_EN
        : WELCOME_PHRASES_ES;

  const text = items.join('   •   ');

  return (
    <div
      className="w-full overflow-hidden bg-[var(--bg-void)] border-b border-[var(--neon-magenta)]/30 py-1.5"
      aria-label={t('marquee.label')}
    >
      <div className="flex whitespace-nowrap w-max marquee-track">
        <span className="px-4 font-mono text-[11px] text-[var(--neon-magenta)] tracking-wider">
          {text}
        </span>
        <span className="px-4 font-mono text-[11px] text-[var(--neon-magenta)] tracking-wider" aria-hidden="true">
          {text}
        </span>
      </div>
    </div>
  );
};
