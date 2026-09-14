import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dices } from 'lucide-react';
import { getImageUrl } from '../lib/tmdb';
import { playReelTick } from '../lib/sound';

interface SlotReelProps {
  posterPaths: (string | null)[];
  /**
   * Once the real result is known, pass its poster here: the reel plays a
   * short deceleration and comes to rest exactly on it, instead of freezing
   * on whatever random poster happened to be passing by.
   */
  landingPosterPath?: string | null;
}

const MIN_TILES = 14;
// Total tiles in the final approach (filler + the real result last). More
// tiles means more travel distance in the same duration, i.e. a faster
// "whoosh" before the hard stop — the number doesn't affect pacing/duration.
const LANDING_TILE_COUNT = 6;
/** How long the deceleration takes. Exported so the caller can keep its own
 *  "still showing the reel" window in sync with when it visually settles. */
export const LANDING_DURATION_MS = 750;

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

export const SlotReel: React.FC<SlotReelProps> = ({ posterPaths, landingPosterPath = null }) => {
  const { t } = useTranslation();

  // Freeze the shuffled tile order for the lifetime of this spin
  const spinTiles = useMemo(() => buildReelTiles(posterPaths), [posterPaths]);
  const doubledSpinTiles = useMemo(() => [...spinTiles, ...spinTiles], [spinTiles]);

  // A short, deterministic run ending on the real result: a few filler
  // posters (for a continued sense of motion) then the winner, last.
  const landingTiles = useMemo(() => {
    if (!landingPosterPath) return null;
    const filler =
      spinTiles.length > 0
        ? Array.from({ length: LANDING_TILE_COUNT - 1 }, (_, i) => spinTiles[i % spinTiles.length])
        : [];
    return [...filler, landingPosterPath];
  }, [landingPosterPath, spinTiles]);

  const isLanding = !!landingTiles;
  const tiles = isLanding ? landingTiles! : doubledSpinTiles;

  // CSS transitions don't animate on mount — the landing track has to render
  // once at its start position, then get nudged to its target on the next
  // frame so the browser has something to transition *from*.
  const [landingSettled, setLandingSettled] = useState(false);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!isLanding) {
      setLandingSettled(false);
      return;
    }
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => setLandingSettled(true));
    });
    return () => cancelAnimationFrame(rafRef.current);
  }, [isLanding, landingTiles]);

  // Regular reel-spin ticking while the outcome is still unknown; one last
  // emphasized tick timed to the moment it actually lands on the result.
  useEffect(() => {
    if (isLanding) {
      const timer = setTimeout(() => playReelTick(), LANDING_DURATION_MS - 80);
      return () => clearTimeout(timer);
    }
    const tickTimer = setInterval(() => playReelTick(), 150);
    return () => clearInterval(tickTimer);
  }, [isLanding]);

  const landingTransform =
    isLanding && landingSettled && tiles.length > 0
      ? `translateY(-${((tiles.length - 1) / tiles.length) * 100}%)`
      : 'translateY(0%)';

  return (
    <div className="flex flex-col items-center justify-center gap-5 py-10 sm:py-14 px-4">
      <div className="relative w-48 sm:w-56 aspect-[2/3] rounded-xl overflow-hidden border-2 border-[var(--neon-cyan)] shadow-neon-cyan bg-black">
        {tiles.length > 0 ? (
          <div
            className={isLanding ? 'absolute top-0 left-0 w-full flex flex-col' : 'reel-spin-track absolute top-0 left-0 w-full flex flex-col'}
            style={
              isLanding
                ? {
                    transform: landingTransform,
                    transition: `transform ${LANDING_DURATION_MS}ms cubic-bezier(0.12, 0.85, 0.32, 1)`,
                  }
                : undefined
            }
          >
            {tiles.map((path, i) => (
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
