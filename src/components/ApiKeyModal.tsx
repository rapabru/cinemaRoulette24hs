import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Key, ExternalLink, X, Check, ShieldAlert, Star, Music, Database, Download, Upload } from 'lucide-react';
import { getStoredApiKey, setStoredApiKey, OFFICIAL_DEMO_KEY } from '../lib/tmdb';
import { getStoredOmdbKey, setStoredOmdbKey, OFFICIAL_DEMO_OMDB_KEY } from '../lib/omdb';
import { getStoredYoutubeKey, setStoredYoutubeKey, OFFICIAL_DEMO_YOUTUBE_KEY } from '../lib/youtube';
import { useModalA11y } from '../hooks/useModalA11y';
import { buildBackup, backupFilename, parseBackup, importBackup } from '../lib/backup';
import { triggerDownload } from '../lib/exportUtils';
import { showToast } from '../lib/toast';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: () => void;
  /** Called after a backup was merged so the app can re-read watched/history from storage. */
  onDataImported?: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeySaved, onDataImported }) => {
  const { t } = useTranslation();
  const [apiKeyInput, setApiKeyInput] = useState(getStoredApiKey());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [omdbKeyInput, setOmdbKeyInput] = useState(getStoredOmdbKey());
  const [omdbSavedSuccess, setOmdbSavedSuccess] = useState(false);
  const [youtubeKeyInput, setYoutubeKeyInput] = useState(getStoredYoutubeKey());
  const [youtubeSavedSuccess, setYoutubeSavedSuccess] = useState(false);
  const dialogRef = useModalA11y<HTMLDivElement>(isOpen, onClose);
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleExportBackup = () => {
    const backup = buildBackup();
    triggerDownload(backupFilename(), new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }));
    showToast(t('backup.exported', { watched: backup.watched.length, history: backup.history.length }), 'success');
  };

  const handleImportBackup = async (file: File | undefined) => {
    if (!file) return;
    try {
      const backup = parseBackup(JSON.parse(await file.text()));
      if (!backup) {
        showToast(t('backup.invalid'), 'error');
        return;
      }
      const summary = importBackup(backup);
      onDataImported?.();
      showToast(t('backup.imported', { ...summary }), 'success');
    } catch {
      showToast(t('backup.invalid'), 'error');
    } finally {
      if (importInputRef.current) importInputRef.current.value = '';
    }
  };

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

  const handleUseOfficialDemoKey = () => {
    setApiKeyInput(OFFICIAL_DEMO_KEY);
    setStoredApiKey(OFFICIAL_DEMO_KEY);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onKeySaved();
      onClose();
    }, 600);
  };

  const handleSaveOmdb = (e: React.FormEvent) => {
    e.preventDefault();
    setStoredOmdbKey(omdbKeyInput);
    setOmdbSavedSuccess(true);
    setTimeout(() => setOmdbSavedSuccess(false), 1500);
  };

  const handleUseOfficialDemoOmdbKey = () => {
    setOmdbKeyInput(OFFICIAL_DEMO_OMDB_KEY);
    setStoredOmdbKey(OFFICIAL_DEMO_OMDB_KEY);
    setOmdbSavedSuccess(true);
    setTimeout(() => setOmdbSavedSuccess(false), 1500);
  };

  const handleSaveYoutube = (e: React.FormEvent) => {
    e.preventDefault();
    setStoredYoutubeKey(youtubeKeyInput);
    setYoutubeSavedSuccess(true);
    setTimeout(() => setYoutubeSavedSuccess(false), 1500);
  };

  const handleUseOfficialDemoYoutubeKey = () => {
    setYoutubeKeyInput(OFFICIAL_DEMO_YOUTUBE_KEY);
    setStoredYoutubeKey(OFFICIAL_DEMO_YOUTUBE_KEY);
    setYoutubeSavedSuccess(true);
    setTimeout(() => setYoutubeSavedSuccess(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="api-modal-title"
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[var(--bg-panel)] border-2 border-[var(--neon-cyan)] rounded-lg shadow-neon-cyan p-6 outline-none"
      >
        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--ink-muted)]/20 mb-5">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-[var(--neon-cyan)]" />
            <h2 id="api-modal-title" className="font-display text-sm tracking-wider text-[var(--neon-amber)] uppercase">
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
            <div className="flex items-center gap-2 text-xs text-[var(--neon-green)] font-mono py-1 font-bold">
              <Check className="w-4 h-4" /> API Key guardada correctamente.
            </div>
          )}

          <div className="space-y-3 pt-2">
            <button
              type="submit"
              className="w-full bg-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/80 text-[var(--bg-void)] font-bold font-mono text-sm py-2.5 px-4 rounded transition-all flex items-center justify-center gap-2 shadow-neon-cyan cursor-pointer"
            >
              <Check className="w-4 h-4" /> {t('api_modal.save')}
            </button>

            {/* Official Demo API Key Button */}
            <button
              type="button"
              onClick={handleUseOfficialDemoKey}
              className="w-full bg-[var(--neon-green)] hover:bg-[var(--neon-green)]/80 text-[var(--bg-void)] font-bold font-mono text-xs py-3 px-4 rounded shadow-neon-green flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{t('api_modal.add_official_demo')}</span>
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-[var(--ink-muted)]/20 flex items-center justify-between text-xs text-[var(--ink-muted)] font-mono">
          <span className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-[var(--neon-green)]" />
            {t('api_modal.current_status')}
          </span>
          <span className="text-[var(--neon-green)] font-semibold">
            API Key Configurada
          </span>
        </div>

        {/* OMDb API Key Section (optional extra ratings: IMDb / Rotten Tomatoes / Metacritic) */}
        <div className="mt-6 pt-5 border-t-2 border-dashed border-[var(--ink-muted)]/30">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-5 h-5 text-[var(--neon-amber)]" />
            <h2 className="font-display text-sm tracking-wider text-[var(--neon-amber)] uppercase">
              {t('api_modal.omdb_title')}
            </h2>
          </div>

          <p className="text-sm text-[var(--ink-light)] mb-4 leading-relaxed">
            {t('api_modal.omdb_description')}
          </p>

          <a
            href="https://www.omdbapi.com/apikey.aspx"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-[var(--neon-amber)] hover:underline mb-6 font-semibold"
          >
            <ExternalLink className="w-4 h-4" />
            {t('api_modal.omdb_get_key_link')}
          </a>

          <form onSubmit={handleSaveOmdb} className="space-y-4">
            <div>
              <label className="block text-xs uppercase font-mono text-[var(--ink-muted)] mb-2">
                {t('api_modal.omdb_input_label')}
              </label>
              <input
                type="text"
                value={omdbKeyInput}
                onChange={(e) => setOmdbKeyInput(e.target.value)}
                placeholder={t('api_modal.omdb_placeholder')}
                className="w-full bg-[var(--bg-void)] border border-[var(--neon-amber)]/40 focus:border-[var(--neon-amber)] text-[var(--ink-light)] font-mono text-sm px-4 py-2.5 rounded outline-none transition-all focus:ring-1 focus:ring-[var(--neon-amber)]"
              />
            </div>

            {omdbSavedSuccess && (
              <div className="flex items-center gap-2 text-xs text-[var(--neon-green)] font-mono py-1 font-bold">
                <Check className="w-4 h-4" /> {t('api_modal.omdb_saved')}
              </div>
            )}

            <div className="space-y-3 pt-2">
              <button
                type="submit"
                className="w-full bg-[var(--neon-amber)] hover:bg-[var(--neon-amber)]/80 text-[var(--bg-void)] font-bold font-mono text-sm py-2.5 px-4 rounded transition-all flex items-center justify-center gap-2 shadow-neon-amber cursor-pointer"
              >
                <Check className="w-4 h-4" /> {t('api_modal.omdb_save')}
              </button>

              {OFFICIAL_DEMO_OMDB_KEY && (
                <button
                  type="button"
                  onClick={handleUseOfficialDemoOmdbKey}
                  className="w-full bg-[var(--neon-green)] hover:bg-[var(--neon-green)]/80 text-[var(--bg-void)] font-bold font-mono text-xs py-3 px-4 rounded shadow-neon-green flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{t('api_modal.omdb_use_demo')}</span>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* YouTube Data API Key Section (optional background audio: theme/scene search) */}
        <div className="mt-6 pt-5 border-t-2 border-dashed border-[var(--ink-muted)]/30">
          <div className="flex items-center gap-2 mb-3">
            <Music className="w-5 h-5 text-[var(--neon-magenta)]" />
            <h2 className="font-display text-sm tracking-wider text-[var(--neon-magenta)] uppercase">
              {t('api_modal.youtube_title')}
            </h2>
          </div>

          <p className="text-sm text-[var(--ink-light)] mb-4 leading-relaxed">
            {t('api_modal.youtube_description')}
          </p>

          <a
            href="https://console.cloud.google.com/apis/library/youtube.googleapis.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-[var(--neon-magenta)] hover:underline mb-6 font-semibold"
          >
            <ExternalLink className="w-4 h-4" />
            {t('api_modal.youtube_get_key_link')}
          </a>

          <form onSubmit={handleSaveYoutube} className="space-y-4">
            <div>
              <label className="block text-xs uppercase font-mono text-[var(--ink-muted)] mb-2">
                {t('api_modal.youtube_input_label')}
              </label>
              <input
                type="text"
                value={youtubeKeyInput}
                onChange={(e) => setYoutubeKeyInput(e.target.value)}
                placeholder={t('api_modal.youtube_placeholder')}
                className="w-full bg-[var(--bg-void)] border border-[var(--neon-magenta)]/40 focus:border-[var(--neon-magenta)] text-[var(--ink-light)] font-mono text-sm px-4 py-2.5 rounded outline-none transition-all focus:ring-1 focus:ring-[var(--neon-magenta)]"
              />
            </div>

            {youtubeSavedSuccess && (
              <div className="flex items-center gap-2 text-xs text-[var(--neon-green)] font-mono py-1 font-bold">
                <Check className="w-4 h-4" /> {t('api_modal.youtube_saved')}
              </div>
            )}

            <div className="space-y-3 pt-2">
              <button
                type="submit"
                className="w-full bg-[var(--neon-magenta)] hover:bg-[var(--neon-magenta)]/80 text-white font-bold font-mono text-sm py-2.5 px-4 rounded transition-all flex items-center justify-center gap-2 shadow-neon-magenta cursor-pointer"
              >
                <Check className="w-4 h-4" /> {t('api_modal.youtube_save')}
              </button>

              {OFFICIAL_DEMO_YOUTUBE_KEY && (
                <button
                  type="button"
                  onClick={handleUseOfficialDemoYoutubeKey}
                  className="w-full bg-[var(--neon-green)] hover:bg-[var(--neon-green)]/80 text-[var(--bg-void)] font-bold font-mono text-xs py-3 px-4 rounded shadow-neon-green flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{t('api_modal.youtube_use_demo')}</span>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Backup / restore of everything stored in this browser */}
        <div className="mt-8 pt-6 border-t border-[var(--ink-muted)]/20">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-5 h-5 text-[var(--neon-green)]" />
            <h2 className="font-display text-sm tracking-wider text-[var(--neon-green)] uppercase">
              {t('backup.title')}
            </h2>
          </div>
          <p className="text-xs font-mono text-[var(--ink-muted)] leading-relaxed mb-4">{t('backup.description')}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleExportBackup}
              className="flex-1 bg-[var(--neon-green)] hover:bg-[var(--neon-green)]/80 text-[var(--bg-void)] font-bold font-mono text-xs py-2.5 px-4 rounded shadow-neon-green flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{t('backup.export')}</span>
            </button>
            <button
              type="button"
              onClick={() => importInputRef.current?.click()}
              className="flex-1 bg-[var(--bg-void)] hover:bg-[var(--neon-green)]/15 text-[var(--neon-green)] border border-[var(--neon-green)]/50 font-bold font-mono text-xs py-2.5 px-4 rounded flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>{t('backup.import')}</span>
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              aria-label={t('backup.import')}
              onChange={(e) => handleImportBackup(e.target.files?.[0])}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
