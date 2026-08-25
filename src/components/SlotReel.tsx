import React, { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Dices } from 'lucide-react';
import { getImageUrl } from '../lib/tmdb';
import { playReelTick } from '../lib/sound';

interface SlotReelProps {
  posterPaths: (string | null)[];
}

const MIN_TILES = 14;

function buildReelTiles(posterPaths: (string | null)[]): string[] {
  const usable = posterPaths.filter((p): p is string => Boolean(p));
  if (usable.length === 0) return [];

  const shuffled = [...usable].sort(() => Math.random() - 0.5);
  const tiles: string[] = [];
  while (tiles.length < MIN_TILES) {
    tiles.push(...shuffled);
  }
  return tiles.slice(0, MIN_TILES);
}

export const SlotReel: React.FC<SlotReelProps> = ({ posterPaths }) => {
  const { t } = useTranslation();

  // Freeze the shuffled tile order for the lifetime of this spin
  const tiles = useMemo(() => buildReelTiles(posterPaths), [posterPaths]);
  const doubledTiles = useMemo(() => [...tiles, ...tiles], [tiles]);

  const tickTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    tickTimer.current = setInterval(() => playReelTick(), 150);
    return () => {
      if (tickTimer.current) clearInterval(tickTimer.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-5 py-10 sm:py-14 px-4">
      <div className="relative w-48 sm:w-56 aspect-[2/3] rounded-xl overflow-hidden border-2 border-[var(--neon-cyan)] shadow-neon-cyan bg-black">
        {doubledTiles.length > 0 ? (
          <div className="reel-spin-track absolute top-0 left-0 w-full flex flex-col">
            {doubledTiles.map((path, i) => (
              <img
                key={i}
                src={getImageUrl(path, 'w342')}
                alt=""
                className="w-full aspect-[2/3] object-cover shrink-0"
              />
            ))}
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Dices className="w-12 h-12 text-[var(--neon-cyan)] animate-spin" />
          </div>
        )}

        {/* Top/bottom fade + center highlight window, cybercafé slot-machine frame */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-70" />
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-1/3 border-y-2 border-[var(--neon-amber)]/70 shadow-neon-amber" />
      </div>

      <div className="flex items-center gap-2.5 font-display text-xs sm:text-sm text-[var(--neon-amber)] uppercase tracking-wider animate-pulse text-center">
        <Dices className="w-5 h-5 shrink-0" />
        <span>{t('sortear.drawing')}</span>
      </div>
    </div>
  );
};
