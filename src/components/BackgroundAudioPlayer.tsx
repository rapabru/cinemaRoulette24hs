import React, { useEffect, useRef, useState } from 'react';
import { findThemeOrSceneVideoId } from '../lib/youtube';
import { isSoundEnabled, getVolume, SOUND_CHANGED_EVENT, VOLUME_CHANGED_EVENT } from '../lib/sound';

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
  const [volume, setVolumeState] = useState(getVolume());
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const soundHandler = (e: Event) => setSoundOn((e as CustomEvent<boolean>).detail);
    const volumeHandler = (e: Event) => setVolumeState((e as CustomEvent<number>).detail);
    window.addEventListener(SOUND_CHANGED_EVENT, soundHandler);
    window.addEventListener(VOLUME_CHANGED_EVENT, volumeHandler);
    return () => {
      window.removeEventListener(SOUND_CHANGED_EVENT, soundHandler);
      window.removeEventListener(VOLUME_CHANGED_EVENT, volumeHandler);
    };
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

  // Live-control mute/volume via the YouTube IFrame postMessage API instead of
  // remounting the iframe, so dragging the volume slider doesn't restart playback.
  useEffect(() => {
    if (!videoId) return;
    const sendCommand = (func: string, args: unknown[] = []) => {
      iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args }), '*');
    };
    const sync = () => {
      sendCommand(soundOn ? 'unMute' : 'mute');
      sendCommand('setVolume', [volume]);
    };
    sync();
    // The embed only starts accepting commands once its internal player script is
    // ready, which isn't observable without loading the full IFrame API — a short
    // retry after load covers that window without needing the extra script.
    const timer = setTimeout(sync, 600);
    return () => clearTimeout(timer);
  }, [videoId, soundOn, volume]);

  if (!active || !videoId) return null;

  const src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${soundOn ? 0 : 1}&controls=0&loop=1&playlist=${videoId}&playsinline=1&enablejsapi=1`;

  return (
    <iframe
      ref={iframeRef}
      key={videoId}
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
