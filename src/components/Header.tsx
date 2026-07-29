import React from 'react';
import { useTranslation } from 'react-i18next';
import { Film, Eye, Moon, Sun, Globe, Key, Tv, ShieldAlert } from 'lucide-react';
import { getStoredApiKey } from '../lib/tmdb';

interface HeaderProps {
  activeTab: 'catalog' | 'watched';
  setActiveTab: (tab: 'catalog' | 'watched') => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  onOpenApiKeyModal: () => void;
  watchedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isDark,
  setIsDark,
  onOpenApiKeyModal,
  watchedCount,
}) => {
  const { t, i18n } = useTranslation();
  const hasKey = Boolean(getStoredApiKey());

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(nextLang);
  };

  return (
    <header className="sticky top-0 z-40 brick-wall-bg border-b-2 border-[var(--neon-magenta)] shadow-lg">
      {!hasKey && (
        <div className="bg-[var(--bg-panel)] border-b border-[var(--neon-amber)]/30 px-4 py-1.5 text-center text-xs font-mono text-[var(--neon-amber)] flex items-center justify-center gap-2 flex-wrap">
          <ShieldAlert className="w-4 h-4 text-[var(--neon-amber)] animate-pulse" />
          <span>Modo Demo Activo — Usando catálogo local.</span>
          <button
            onClick={onOpenApiKeyModal}
            className="underline text-[var(--neon-cyan)] font-bold hover:text-white transition-colors ml-1"
          >
            [ Ingresar API Key de TMDB para +1.000.000 películas ]
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[var(--bg-panel)] border border-[var(--neon-cyan)] flex items-center justify-center shadow-neon-cyan relative overflow-hidden group">
            <Tv className="w-6 h-6 text-[var(--neon-cyan)] group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 bg-[var(--neon-cyan)]/10 animate-pulse pointer-events-none" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-sm sm:text-base text-neon-amber tracking-wider uppercase">
                {t('app.title')}
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold tracking-widest text-[var(--bg-void)] bg-[var(--neon-cyan)] rounded shadow-neon-cyan uppercase">
                {t('app.open_24h')}
              </span>
            </div>
            <p className="text-[10px] font-mono text-[var(--ink-muted)] tracking-widest uppercase">
              {t('app.subtitle')}
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 bg-[var(--bg-panel)] p-1 rounded border border-[var(--ink-muted)]/30">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all ${
              activeTab === 'catalog'
                ? 'bg-[var(--neon-magenta)] text-white shadow-neon-magenta'
                : 'text-[var(--ink-muted)] hover:text-[var(--ink-light)]'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>{t('nav.catalog')}</span>
          </button>

          <button
            onClick={() => setActiveTab('watched')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all relative ${
              activeTab === 'watched'
                ? 'bg-[var(--neon-green)] text-[var(--bg-void)] shadow-neon-green font-bold'
                : 'text-[var(--ink-muted)] hover:text-[var(--ink-light)]'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>{t('nav.watched')}</span>
            {watchedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-[var(--bg-void)] text-[var(--neon-green)] font-mono font-bold border border-[var(--neon-green)]">
                {watchedCount}
              </span>
            )}
          </button>
        </div>

        {/* Utilities: Language, Theme, API Key */}
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            title="Cambiar Idioma / Switch Language"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[var(--bg-panel)] border border-[var(--neon-cyan)]/40 hover:border-[var(--neon-cyan)] text-xs font-mono text-[var(--ink-light)] hover:text-[var(--neon-cyan)] transition-all"
          >
            <Globe className="w-3.5 h-3.5 text-[var(--neon-cyan)]" />
            <span className="font-bold uppercase">{i18n.language}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            title={isDark ? t('nav.theme_midday') : t('nav.theme_night')}
            className="flex items-center justify-center w-9 h-9 rounded bg-[var(--bg-panel)] border border-[var(--neon-amber)]/40 hover:border-[var(--neon-amber)] text-[var(--neon-amber)] hover:shadow-neon-amber transition-all"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* API Key Modal Button */}
          <button
            onClick={onOpenApiKeyModal}
            title={t('nav.api_key')}
            className="flex items-center justify-center w-9 h-9 rounded bg-[var(--bg-panel)] border border-[var(--ink-muted)]/40 hover:border-[var(--neon-cyan)] text-[var(--ink-muted)] hover:text-[var(--neon-cyan)] transition-all"
          >
            <Key className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
