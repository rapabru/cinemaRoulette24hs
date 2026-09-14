import React from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Link2, X } from 'lucide-react';

interface NightDrawBannerProps {
  seed: string;
  link: string;
  onCopyLink: () => void;
  onExit: () => void;
}

/** Shown while a shared-seed draw is active: everyone with this link draws the same movie. */
export const NightDrawBanner: React.FC<NightDrawBannerProps> = ({ seed, link, onCopyLink, onExit }) => {
  const { t } = useTranslation();

  return (
    <div
      role="status"
      className="my-3 p-3 sm:p-4 rounded-xl border-2 border-[var(--neon-magenta)] bg-[var(--neon-magenta)]/10 shadow-neon-magenta flex flex-col sm:flex-row items-center gap-3 font-mono text-xs"
    >
      <Moon className="w-5 h-5 text-[var(--neon-magenta)] shrink-0" />
      <div className="flex-1 text-center sm:text-left space-y-0.5">
        <p className="font-bold text-[var(--ink-light)]">
          {t('night.active', { seed })}
        </p>
        <p className="text-[var(--ink-muted)]">{t('night.active_hint')}</p>
        <p className="text-[10px] text-[var(--ink-muted)] break-all opacity-70">{link}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onCopyLink}
          className="px-3 py-1.5 rounded-lg bg-[var(--neon-magenta)] hover:bg-[var(--neon-magenta)]/80 text-white font-bold flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Link2 className="w-3.5 h-3.5" />
          {t('night.copy_link')}
        </button>
        <button
          onClick={onExit}
          title={t('night.exit')}
          aria-label={t('night.exit')}
          className="p-1.5 rounded-lg border border-[var(--ink-muted)]/40 text-[var(--ink-muted)] hover:text-[var(--neon-magenta)] hover:border-[var(--neon-magenta)] transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
