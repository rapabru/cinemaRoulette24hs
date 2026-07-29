import React from 'react';
import { useTranslation } from 'react-i18next';
import { Film, Eye, History, Moon, Sun, Globe, Key, Tv, ShieldAlert, LogOut } from 'lucide-react';
import { getStoredApiKey } from '../lib/tmdb';
import type { GoogleUser } from '../lib/auth';

interface HeaderProps {
  activeTab: 'catalog' | 'watched' | 'history';
  setActiveTab: (tab: 'catalog' | 'watched' | 'history') => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  onOpenApiKeyModal: () => void;
  watchedCount: number;
  historyCount: number;
  googleUser: GoogleUser | null;
  onOpenGoogleLogin: () => void;
  onLogoutGoogle: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isDark,
  setIsDark,
  onOpenApiKeyModal,
  watchedCount,
  historyCount,
  googleUser,
  onOpenGoogleLogin,
  onLogoutGoogle,
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
        {/* Brand Logo & Title Link to https://cinemaroulette.vercel.app/ */}
        <a
          href="https://cinemaroulette.vercel.app/"
          onClick={() => {
            if (window.location.hostname.includes('vercel.app') || window.location.hostname === 'localhost') {
              // Smooth tab switch to catalog
              setActiveTab('catalog');
            }
          }}
          className="flex items-center gap-3 group cursor-pointer select-none no-underline"
          title="Ir a https://cinemaroulette.vercel.app/"
        >
          <div className="w-10 h-10 rounded bg-[var(--bg-panel)] border border-[var(--neon-cyan)] flex items-center justify-center shadow-neon-cyan relative overflow-hidden group-hover:border-[var(--neon-amber)] transition-colors">
            <Tv className="w-6 h-6 text-[var(--neon-cyan)] group-hover:scale-110 group-hover:text-[var(--neon-amber)] transition-all" />
            <div className="absolute inset-0 bg-[var(--neon-cyan)]/10 animate-pulse pointer-events-none" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-sm sm:text-base text-neon-amber tracking-wider uppercase group-hover:text-[var(--neon-cyan)] transition-colors">
                {t('app.title')}
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold tracking-widest text-[var(--bg-void)] bg-[var(--neon-cyan)] rounded shadow-neon-cyan uppercase group-hover:bg-[var(--neon-amber)] transition-colors">
                {t('app.open_24h')}
              </span>
            </div>
            <p className="text-[10px] font-mono text-[var(--ink-muted)] tracking-widest uppercase group-hover:text-[var(--ink-light)] transition-colors">
              {t('app.subtitle')}
            </p>
          </div>
        </a>

        {/* View Switcher Tabs: Catálogo | La Vi | Historial */}
        <div className="flex items-center gap-1.5 bg-[var(--bg-panel)] p-1 rounded border border-[var(--ink-muted)]/30">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all ${
              activeTab === 'catalog'
                ? 'bg-[var(--neon-magenta)] text-white shadow-neon-magenta'
                : 'text-[var(--ink-muted)] hover:text-[var(--ink-light)]'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>{t('nav.catalog')}</span>
          </button>

          <button
            onClick={() => setActiveTab('watched')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all relative ${
              activeTab === 'watched'
                ? 'bg-[var(--neon-green)] text-[var(--bg-void)] shadow-neon-green font-bold'
                : 'text-[var(--ink-muted)] hover:text-[var(--ink-light)]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{t('nav.watched')}</span>
            {watchedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-[var(--bg-void)] text-[var(--neon-green)] font-mono font-bold border border-[var(--neon-green)]">
                {watchedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all relative ${
              activeTab === 'history'
                ? 'bg-[var(--neon-amber)] text-[var(--bg-void)] shadow-neon-amber font-bold'
                : 'text-[var(--ink-muted)] hover:text-[var(--ink-light)]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historial</span>
            {historyCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-[var(--bg-void)] text-[var(--neon-amber)] font-mono font-bold border border-[var(--neon-amber)]">
                {historyCount}
              </span>
            )}
          </button>
        </div>

        {/* Utilities & Google Auth */}
        <div className="flex items-center gap-2">
          {/* Google Sign-In Widget */}
          {googleUser ? (
            <div className="flex items-center gap-2 bg-[var(--bg-panel)] p-1 pl-2 rounded border border-[var(--neon-green)]/60 text-xs font-mono">
              <img
                src={googleUser.photoURL}
                alt={googleUser.displayName}
                className="w-6 h-6 rounded-full border border-[var(--neon-green)]"
              />
              <span className="text-[var(--ink-light)] font-semibold hidden md:inline max-w-[120px] truncate">
                {googleUser.displayName}
              </span>
              <button
                onClick={onLogoutGoogle}
                title="Cerrar Sesión Google"
                className="p-1 text-[var(--ink-muted)] hover:text-red-400 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenGoogleLogin}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-white hover:bg-gray-100 text-gray-900 font-mono text-xs font-bold transition-all shadow-md"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="hidden sm:inline">Google Login</span>
            </button>
          )}

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            title="Cambiar Idioma / Switch Language"
            className="flex items-center gap-1.5 px-2 py-1.5 rounded bg-[var(--bg-panel)] border border-[var(--neon-cyan)]/40 hover:border-[var(--neon-cyan)] text-xs font-mono text-[var(--ink-light)] hover:text-[var(--neon-cyan)] transition-all"
          >
            <Globe className="w-3.5 h-3.5 text-[var(--neon-cyan)]" />
            <span className="font-bold uppercase">{i18n.language}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            title={isDark ? t('nav.theme_midday') : t('nav.theme_night')}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded bg-[var(--bg-panel)] border border-[var(--neon-amber)]/40 hover:border-[var(--neon-amber)] text-[var(--neon-amber)] hover:shadow-neon-amber transition-all"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* API Key Modal Button */}
          <button
            onClick={onOpenApiKeyModal}
            title={t('nav.api_key')}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded bg-[var(--bg-panel)] border border-[var(--ink-muted)]/40 hover:border-[var(--neon-cyan)] text-[var(--ink-muted)] hover:text-[var(--neon-cyan)] transition-all"
          >
            <Key className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
