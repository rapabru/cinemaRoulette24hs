import React from 'react';
import { useTranslation } from 'react-i18next';
import { Film, Eye, History, Moon, Sun, Globe, Key, Tv, ShieldAlert, LogOut } from 'lucide-react';
import { getStoredApiKey } from '../lib/tmdb';
import { VolumeControl } from './VolumeControl';
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

  const LANGUAGE_CYCLE = ['es', 'en', 'pt'];

  const toggleLanguage = () => {
    const currentIndex = LANGUAGE_CYCLE.indexOf(i18n.language);
    const nextLang = LANGUAGE_CYCLE[(currentIndex + 1) % LANGUAGE_CYCLE.length];
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 space-y-2.5">
        {/* Row 1: Brand Logo & Title Link, alone */}
        <div className="flex justify-center">
          <a
            href="https://cinemaroulette.vercel.app/"
            onClick={() => {
              if (window.location.hostname.includes('vercel.app') || window.location.hostname === 'localhost') {
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
        </div>

        {/* Row 2: Tabs (left) + Utilities (right) */}
        <div className="flex flex-wrap items-center justify-between gap-3">
        {/* View Switcher Tabs: Catálogo | La Vi | Historial */}
        <div className="h-9 flex items-center gap-1.5 bg-[var(--bg-panel)] p-1 rounded-lg border border-[var(--ink-muted)]/30">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`h-7 flex items-center gap-1.5 px-3 rounded text-xs font-mono font-semibold transition-all cursor-pointer ${
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
            className={`h-7 flex items-center gap-1.5 px-3 rounded text-xs font-mono font-semibold transition-all relative cursor-pointer ${
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
            className={`h-7 flex items-center gap-1.5 px-3 rounded text-xs font-mono font-semibold transition-all relative cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[var(--neon-amber)] text-[var(--bg-void)] shadow-neon-amber font-bold'
                : 'text-[var(--ink-muted)] hover:text-[var(--ink-light)]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{t('nav.history')}</span>
            {historyCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-[var(--bg-void)] text-[var(--neon-amber)] font-mono font-bold border border-[var(--neon-amber)]">
                {historyCount}
              </span>
            )}
          </button>
        </div>

        {/* Right Utilities: Discord -> Language -> Theme -> Volume -> API Key -> Google Login */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* 1. Discord Cybercafé 24HS Link */}
          <a
            href="https://discord.gg/dfSD65dgx"
            target="_blank"
            rel="noopener noreferrer"
            title={t('nav.discord_tooltip')}
            className="h-9 flex items-center justify-center gap-1.5 px-3 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white font-mono text-xs font-bold transition-all shadow-md cursor-pointer shrink-0 no-underline"
          >
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 127.14 96.36">
              <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22c2.72-27.47-5.59-51.27-18.9-72.15ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.92,53.86,53,48.73,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.92,96.1,53,91,65.69,84.69,65.69Z" />
            </svg>
            <span className="hidden sm:inline">Discord 24HS</span>
          </a>

          {/* 2. Language Toggle Button */}
          <button
            onClick={toggleLanguage}
            title="Cambiar Idioma / Switch Language"
            className="h-9 flex items-center justify-center gap-1.5 px-2.5 rounded-lg bg-[var(--bg-panel)] border border-[var(--neon-cyan)]/40 hover:border-[var(--neon-cyan)] text-xs font-mono text-[var(--ink-light)] hover:text-[var(--neon-cyan)] transition-all cursor-pointer shrink-0"
          >
            <Globe className="w-3.5 h-3.5 text-[var(--neon-cyan)] shrink-0" />
            <span className="font-bold uppercase">{i18n.language}</span>
          </button>

          {/* 3. Theme Toggle Button */}
          <button
            onClick={() => setIsDark(!isDark)}
            title={isDark ? t('nav.theme_midday') : t('nav.theme_night')}
            className="h-9 w-9 flex items-center justify-center rounded-lg bg-[var(--bg-panel)] border border-[var(--neon-amber)]/40 hover:border-[var(--neon-amber)] text-[var(--neon-amber)] hover:shadow-neon-amber transition-all cursor-pointer shrink-0"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* 3b. Volume Control (mute + slider) */}
          <VolumeControl className="h-9 shrink-0" />

          {/* 4. API Key Modal Button */}
          <button
            onClick={onOpenApiKeyModal}
            title={t('nav.api_key')}
            className="h-9 w-9 flex items-center justify-center rounded-lg bg-[var(--bg-panel)] border border-[var(--ink-muted)]/40 hover:border-[var(--neon-cyan)] text-[var(--ink-muted)] hover:text-[var(--neon-cyan)] transition-all cursor-pointer shrink-0"
          >
            <Key className="w-4 h-4" />
          </button>

          {/* 5. Google Sign-In / User Profile Widget (Far Right) */}
          {googleUser ? (
            <div className="h-9 flex items-center gap-2 bg-[var(--bg-panel)] px-2.5 rounded-lg border border-[var(--neon-green)]/60 text-xs font-mono">
              <img
                src={googleUser.photoURL}
                alt={googleUser.displayName}
                className="w-5 h-5 rounded-full border border-[var(--neon-green)] shrink-0"
              />
              <span className="text-[var(--ink-light)] font-semibold hidden md:inline max-w-[110px] truncate">
                {googleUser.displayName}
              </span>
              <button
                onClick={onLogoutGoogle}
                title="Cerrar Sesión Google"
                className="p-1 text-[var(--ink-muted)] hover:text-red-400 transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenGoogleLogin}
              className="h-9 flex items-center justify-center gap-1.5 px-3 rounded-lg bg-white hover:bg-gray-100 text-gray-900 font-mono text-xs font-bold transition-all shadow-md cursor-pointer shrink-0"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
        </div>
        </div>
      </div>
    </header>
  );
};
