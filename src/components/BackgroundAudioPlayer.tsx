import React, { useEffect, useState } from 'react';
import { findThemeOrSceneVideoId } from '../lib/youtube';
import { isSoundEnabled, SOUND_CHANGED_EVENT } from '../lib/sound';

interface BackgroundAudioPlayerProps {
  movieId: number;
  title: string;
  year: string;
  /** YouTube video key of the movie's trailer, used as the final fallback. */
  trailerKey: string | null;
  /** Only plays while true — caller should gate this on "ficha visible, not mid-spin, not in the player tab". */
  active: boolean;
}

/**
 * Invisible background audio: tries the movie's theme/soundtrack, then a classic scene
 * (both via YouTube search, requires a configured YouTube API key), then falls back to
 * the movie's own trailer audio. Renders nothing visible.
 */
export const BackgroundAudioPlayer: React.FC<BackgroundAudioPlayerProps> = ({
  movieId,
  title,
  year,
  trailerKey,
  active,
}) => {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  useEffect(() => {
    const handler = (e: Event) => setSoundOn((e as CustomEvent<boolean>).detail);
    window.addEventListener(SOUND_CHANGED_EVENT, handler);
    return () => window.removeEventListener(SOUND_CHANGED_EVENT, handler);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setVideoId(null);
    findThemeOrSceneVideoId(title, year).then((found) => {
      if (!cancelled) setVideoId(found || trailerKey || null);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieId]);

  if (!active || !videoId) return null;

  const src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${soundOn ? 0 : 1}&controls=0&loop=1&playlist=${videoId}&playsinline=1`;

  return (
    <iframe
      key={`${videoId}-${soundOn}`}
      src={src}
      allow="autoplay"
      title="background-audio"
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        width: 1,
        height: 1,
        opacity: 0,
        border: 0,
        pointerEvents: 'none',
      }}
    />
  );
};
