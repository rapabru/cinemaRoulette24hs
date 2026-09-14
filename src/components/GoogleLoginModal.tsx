import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, UserCheck, UserRound, AlertTriangle } from 'lucide-react';
import { createLocalProfile, createGoogleSessionFromCredential, getStoredGoogleUser, GOOGLE_CLIENT_ID } from '../lib/auth';
import type { GoogleUser } from '../lib/auth';
import { useModalA11y } from '../hooks/useModalA11y';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface GoogleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: GoogleUser) => void;
}

const GoogleLogo: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={`${className} shrink-0`} viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

/**
 * Two honest ways to put a name on this browser's data: the official Google
 * Identity Services button (verified identity), or a local profile that is
 * plainly labelled as such — no Google branding, nothing sent anywhere.
 */
export const GoogleLoginModal: React.FC<GoogleLoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const { t } = useTranslation();
  const existingUser = getStoredGoogleUser();
  const [mode, setMode] = useState<'google' | 'local'>('google');
  const [nameInput, setNameInput] = useState(existingUser?.provider === 'local' ? existingUser.displayName : '');
  const [emailInput, setEmailInput] = useState(existingUser?.provider === 'local' ? existingUser.email : '');
  const [googleError, setGoogleError] = useState(false);
  const [gisAvailable, setGisAvailable] = useState(true);
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const dialogRef = useModalA11y<HTMLDivElement>(isOpen, onClose);

  useEffect(() => {
    if (!isOpen || mode !== 'google') return;
    setGoogleError(false);

    // The GIS script is loaded async from index.html; give it a beat before rendering the button.
    const timer = setTimeout(() => {
      const gis = window.google?.accounts?.id;
      if (!gis || !googleBtnRef.current) {
        setGisAvailable(false);
        return;
      }
      setGisAvailable(true);
      try {
        gis.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response: { credential: string }) => {
            const user = response?.credential ? createGoogleSessionFromCredential(response.credential) : null;
            if (!user) {
              setGoogleError(true);
              return;
            }
            onLoginSuccess(user);
            onClose();
          },
        });
        googleBtnRef.current.innerHTML = '';
        gis.renderButton(googleBtnRef.current, {
          theme: 'filled_blue',
          size: 'large',
          type: 'standard',
          shape: 'pill',
          text: 'continue_with',
          logo_alignment: 'left',
          width: 320,
        });
      } catch (err) {
        console.error('Error rendering official Google Sign-In button:', err);
        setGisAvailable(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [isOpen, mode, onLoginSuccess, onClose]);

  if (!isOpen) return null;

  const handleSubmitLocal = (e: React.FormEvent) => {
    e.preventDefault();
    const name = nameInput.trim();
    if (!name) return;
    onLoginSuccess(createLocalProfile(name, emailInput));
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[var(--bg-panel)] border-2 border-[var(--neon-cyan)] rounded-2xl shadow-neon-cyan overflow-hidden p-6 space-y-5 outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--ink-muted)]/20 pb-4">
          <div className="flex items-center gap-3">
            {mode === 'google' ? <GoogleLogo /> : <UserRound className="w-5 h-5 text-[var(--neon-cyan)] shrink-0" />}
            <h2 id="login-modal-title" className="font-display text-xs sm:text-sm tracking-wider text-[var(--neon-amber)] uppercase">
              {mode === 'google' ? t('login.google_title') : t('login.local_title')}
            </h2>
          </div>
          <button
            onClick={onClose}
            title={t('sortear.close')}
            aria-label={t('sortear.close')}
            className="p-1 text-[var(--ink-muted)] hover:text-[var(--neon-magenta)] transition-colors rounded cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs font-mono text-[var(--ink-muted)] leading-relaxed">{t('login.purpose')}</p>

        {mode === 'google' ? (
          <div className="py-2 flex flex-col items-center justify-center space-y-3">
            <div ref={googleBtnRef} className="min-h-[44px] flex items-center justify-center" />
            {!gisAvailable && (
              <p className="flex items-center gap-2 text-[11px] font-mono text-[var(--neon-amber)]">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                {t('login.google_unavailable')}
              </p>
            )}
            {googleError && (
              <p className="flex items-center gap-2 text-[11px] font-mono text-[var(--neon-magenta)]">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                {t('login.google_error')}
              </p>
            )}
            <p className="text-[11px] font-mono text-[var(--ink-muted)] text-center">{t('login.google_disclaimer')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmitLocal} className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[var(--bg-void)] border border-[var(--ink-muted)]/30">
              <img
                src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(emailInput.trim() || nameInput.trim() || 'cybercafe')}`}
                alt=""
                className="w-10 h-10 rounded-full border border-[var(--neon-cyan)] bg-black/40 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-mono font-semibold text-xs text-[var(--ink-light)] truncate">
                  {nameInput.trim() || t('login.local_name_placeholder')}
                </h3>
                <p className="font-mono text-[11px] text-[var(--ink-muted)] truncate">{t('login.local_badge')}</p>
              </div>
            </div>

            <div>
              <label htmlFor="local-profile-name" className="block text-xs font-mono font-bold text-[var(--ink-light)]/90 uppercase tracking-wider mb-1">
                {t('login.local_name_label')}
              </label>
              <input
                id="local-profile-name"
                type="text"
                required
                maxLength={40}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder={t('login.local_name_placeholder')}
                className="w-full bg-[var(--bg-void)] border border-[var(--neon-cyan)]/40 focus:border-[var(--neon-cyan)] text-[var(--ink-light)] font-mono text-xs px-3.5 py-2.5 rounded-lg outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="local-profile-email" className="block text-xs font-mono font-bold text-[var(--ink-light)]/90 uppercase tracking-wider mb-1">
                {t('login.local_email_label')}
              </label>
              <input
                id="local-profile-email"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder={t('login.local_email_placeholder')}
                className="w-full bg-[var(--bg-void)] border border-[var(--ink-muted)]/40 focus:border-[var(--neon-cyan)] text-[var(--ink-light)] font-mono text-xs px-3.5 py-2.5 rounded-lg outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={!nameInput.trim()}
              className="w-full bg-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/80 disabled:opacity-40 disabled:cursor-not-allowed text-[var(--bg-void)] font-mono font-bold text-xs py-2.5 px-4 rounded-lg shadow-neon-cyan flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>{t('login.local_submit')}</span>
            </button>
          </form>
        )}

        {/* Mode switch */}
        <div className="border-t border-[var(--ink-muted)]/20 pt-4 text-center">
          <button
            type="button"
            onClick={() => setMode(mode === 'google' ? 'local' : 'google')}
            className="text-xs font-mono text-[var(--neon-cyan)] hover:text-[var(--neon-amber)] underline underline-offset-2 transition-colors cursor-pointer"
          >
            {mode === 'google' ? t('login.switch_to_local') : t('login.switch_to_google')}
          </button>
          <p className="text-[11px] font-mono text-[var(--ink-muted)] mt-2">{t('login.storage_note')}</p>
        </div>
      </div>
    </div>
  );
};
