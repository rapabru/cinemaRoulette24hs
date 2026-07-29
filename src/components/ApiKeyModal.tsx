import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Key, ExternalLink, X, Check, ShieldAlert } from 'lucide-react';
import { getStoredApiKey, setStoredApiKey } from '../lib/tmdb';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeySaved }) => {
  const { t } = useTranslation();
  const [apiKeyInput, setApiKeyInput] = useState(getStoredApiKey());
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setStoredApiKey(apiKeyInput);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onKeySaved();
      onClose();
    }, 600);
  };

  const handleUseDemo = () => {
    const demoKey = '8a7f9b2c3d4e5f6a7b8c9d0e1f2a3b4c';
    setApiKeyInput(demoKey);
    setStoredApiKey(demoKey);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onKeySaved();
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[var(--bg-panel)] border-2 border-[var(--neon-cyan)] rounded-lg shadow-neon-cyan p-6 overflow-hidden">
        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--ink-muted)]/20 mb-5">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-[var(--neon-cyan)]" />
            <h2 className="font-display text-sm tracking-wider text-[var(--neon-amber)] uppercase">
              {t('api_modal.title')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[var(--ink-muted)] hover:text-[var(--neon-magenta)] transition-colors rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-[var(--ink-light)] mb-4 leading-relaxed">
          {t('api_modal.description')}
        </p>

        <a
          href="https://www.themoviedb.org/settings/api"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs text-[var(--neon-cyan)] hover:underline mb-6 font-semibold"
        >
          <ExternalLink className="w-4 h-4" />
          {t('api_modal.get_key_link')}
        </a>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-mono text-[var(--ink-muted)] mb-2">
              {t('api_modal.input_label')}
            </label>
            <input
              type="text"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder={t('api_modal.placeholder')}
              className="w-full bg-[var(--bg-void)] border border-[var(--neon-cyan)]/40 focus:border-[var(--neon-cyan)] text-[var(--ink-light)] font-mono text-sm px-4 py-2.5 rounded outline-none transition-all focus:ring-1 focus:ring-[var(--neon-cyan)]"
            />
          </div>

          {savedSuccess && (
            <div className="flex items-center gap-2 text-xs text-[var(--neon-green)] font-mono py-1">
              <Check className="w-4 h-4" /> API Key guardada correctamente.
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/80 text-[var(--bg-void)] font-bold font-mono text-sm py-2.5 px-4 rounded transition-all flex items-center justify-center gap-2 shadow-neon-cyan"
            >
              <Check className="w-4 h-4" /> {t('api_modal.save')}
            </button>
            <button
              type="button"
              onClick={handleUseDemo}
              className="border border-[var(--neon-amber)] text-[var(--neon-amber)] hover:bg-[var(--neon-amber)]/10 font-mono text-xs py-2.5 px-4 rounded transition-all"
            >
              {t('api_modal.use_demo')}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-[var(--ink-muted)]/20 flex items-center justify-between text-xs text-[var(--ink-muted)] font-mono">
          <span className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-[var(--neon-magenta)]" />
            {t('api_modal.current_status')}
          </span>
          <span className={getStoredApiKey() ? 'text-[var(--neon-green)] font-semibold' : 'text-[var(--neon-amber)]'}>
            {getStoredApiKey() ? 'API Key Configurada' : 'Usando Demo Key'}
          </span>
        </div>
      </div>
    </div>
  );
};
