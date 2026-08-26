import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Volume1, Volume2, VolumeX } from 'lucide-react';
import {
  isSoundEnabled,
  setSoundEnabled,
  getVolume,
  setVolume,
  SOUND_CHANGED_EVENT,
  VOLUME_CHANGED_EVENT,
} from '../lib/sound';

interface VolumeControlProps {
  className?: string;
}

/** Compact mute + volume slider — controls both the background audio and the SFX. Reused in the header, the floating corner button, and the movie modal. */
export const VolumeControl: React.FC<VolumeControlProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const [soundOn, setSoundOnState] = useState(isSoundEnabled());
  const [volume, setVolumeState] = useState(getVolume());

  useEffect(() => {
    const soundHandler = (e: Event) => setSoundOnState((e as CustomEvent<boolean>).detail);
    const volumeHandler = (e: Event) => setVolumeState((e as CustomEvent<number>).detail);
    window.addEventListener(SOUND_CHANGED_EVENT, soundHandler);
    window.addEventListener(VOLUME_CHANGED_EVENT, volumeHandler);
    return () => {
      window.removeEventListener(SOUND_CHANGED_EVENT, soundHandler);
      window.removeEventListener(VOLUME_CHANGED_EVENT, volumeHandler);
    };
  }, []);

  const Icon = !soundOn || volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

  return (
    <div className={`flex items-center gap-2 bg-[var(--bg-void)] border border-[var(--neon-cyan)]/30 rounded-full pl-2 pr-3 py-1 ${className}`}>
      <button
        onClick={() => setSoundEnabled(!soundOn)}
        title={soundOn ? t('nav.sound_on') : t('nav.sound_off')}
        className="text-[var(--neon-cyan)] hover:text-[var(--neon-amber)] transition-colors cursor-pointer shrink-0"
      >
        <Icon className="w-4 h-4" />
      </button>
      <input
        type="range"
        min={0}
        max={100}
        value={soundOn ? volume : 0}
        onChange={(e) => {
          const next = Number(e.target.value);
          setVolume(next);
          if (!soundOn && next > 0) setSoundEnabled(true);
        }}
        title={t('sortear.volume_label')}
        className="w-16 sm:w-20 accent-[var(--neon-cyan)] cursor-pointer"
      />
    </div>
  );
};
