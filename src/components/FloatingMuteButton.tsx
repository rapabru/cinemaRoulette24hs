import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Volume2, VolumeX } from 'lucide-react';
import { isSoundEnabled, setSoundEnabled, SOUND_CHANGED_EVENT } from '../lib/sound';

export const FloatingMuteButton: React.FC = () => {
  const { t } = useTranslation();
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  useEffect(() => {
    const handler = (e: Event) => setSoundOn((e as CustomEvent<boolean>).detail);
    window.addEventListener(SOUND_CHANGED_EVENT, handler);
    return () => window.removeEventListener(SOUND_CHANGED_EVENT, handler);
  }, []);

  return (
    <button
      onClick={() => setSoundEnabled(!soundOn)}
      title={soundOn ? t('nav.sound_on') : t('nav.sound_off')}
      className={`fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-lg transition-all cursor-pointer backdrop-blur-md ${
        soundOn
          ? 'bg-[var(--bg-panel)]/90 border-[var(--neon-cyan)] text-[var(--neon-cyan)] shadow-neon-cyan hover:scale-105'
          : 'bg-[var(--bg-panel)]/90 border-red-500/70 text-red-400 hover:scale-105'
      }`}
    >
      {soundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
    </button>
  );
};
