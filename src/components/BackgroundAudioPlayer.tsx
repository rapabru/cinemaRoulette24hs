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
  const fadeInDoneRef = useRef(false);

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

  // Fade the volume in from 0 whenever a new video starts, instead of jumping
  // straight to the target level — so the background audio doesn't startle
  // whoever's browsing. Reads sound/volume live (not as deps) so it always
  // eases into whatever the current setting is by the time it finishes.
  useEffect(() => {
    if (!videoId) return;
    fadeInDoneRef.current = false;
    const sendCommand = (func: string, args: unknown[] = []) => {
      iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args }), '*');
    };

    const steps = 20;
    const stepDurationMs = 1500 / steps;
    let step = 0;
    let stepTimer: ReturnType<typeof setTimeout>;

    const tick = () => {
      step++;
      const target = isSoundEnabled() ? getVolume() : 0;
      sendCommand('unMute');
      sendCommand('setVolume', [Math.round((target * step) / steps)]);
      if (step < steps) {
        stepTimer = setTimeout(tick, stepDurationMs);
      } else {
        fadeInDoneRef.current = true;
        if (!isSoundEnabled()) sendCommand('mute');
      }
    };
    // The embed only starts accepting commands once its internal player script is
    // ready, which isn't observable without loading the full IFrame API — a short
    // delay before the fade covers that window without needing the extra script.
    const startTimer = setTimeout(tick, 600);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(stepTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  // Live-control mute/volume via the YouTube IFrame postMessage API instead of
  // remounting the iframe, so dragging the volume slider doesn't restart playback.
  // Skipped until the initial fade-in finishes, so it doesn't cut the fade short.
  useEffect(() => {
    if (!videoId || !fadeInDoneRef.current) return;
    const sendCommand = (func: string, args: unknown[] = []) => {
      iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args }), '*');
    };
    sendCommand(soundOn ? 'unMute' : 'mute');
    sendCommand('setVolume', [volume]);
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
