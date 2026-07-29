import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal, ChevronDown, ChevronUp, User, RotateCcw, Check } from 'lucide-react';
import { searchPerson } from '../lib/tmdb';
import type { Genre, FilterState, PersonResult } from '../lib/tmdb';

interface FilterPanelProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  genres: Genre[];
  onReset: () => void;
  resultsCount?: number;
}

const LANGUAGE_OPTIONS = [
  { code: '', nameKey: 'filters.all_languages' },
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
  { code: 'de', name: 'Deutsch' },
  { code: 'ja', name: '日本語 (Japanese)' },
  { code: 'ko', name: '한국어 (Korean)' },
  { code: 'zh', name: '中文 (Chinese)' },
  { code: 'pt', name: 'Português' },
];

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onChange,
  genres,
  onReset,
  resultsCount,
}) => {
  const { t, i18n } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);

  // Actor search state
  const [actorSearchQuery, setActorSearchQuery] = useState(filters.actorName);
  const [actorResults, setActorResults] = useState<PersonResult[]>([]);
  const [showActorDropdown, setShowActorDropdown] = useState(false);
  const actorSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced actor search
  useEffect(() => {
    if (actorSearchTimeout.current) clearTimeout(actorSearchTimeout.current);

    if (!actorSearchQuery.trim()) {
      setActorResults([]);
      setShowActorDropdown(false);
      if (filters.actorId !== null) {
        onChange({ ...filters, actorId: null, actorName: '' });
      }
      return;
    }

    if (actorSearchQuery === filters.actorName) return;

    actorSearchTimeout.current = setTimeout(async () => {
      const results = await searchPerson(actorSearchQuery, i18n.language);
      setActorResults(results);
      setShowActorDropdown(results.length > 0);
    }, 300);

    return () => {
      if (actorSearchTimeout.current) clearTimeout(actorSearchTimeout.current);
    };
  }, [actorSearchQuery, i18n.language]);

  const toggleGenre = (genreId: number) => {
    const isSelected = filters.genreIds.includes(genreId);
    const updated = isSelected
      ? filters.genreIds.filter((id) => id !== genreId)
      : [...filters.genreIds, genreId];
    onChange({ ...filters, genreIds: updated });
  };

  const handleSelectActor = (person: PersonResult) => {
    setActorSearchQuery(person.name);
    setShowActorDropdown(false);
    onChange({ ...filters, actorId: person.id, actorName: person.name });
  };

  const handleClearActor = () => {
    setActorSearchQuery('');
    setActorResults([]);
    setShowActorDropdown(false);
    onChange({ ...filters, actorId: null, actorName: '' });
  };

  return (
    <div className="w-full bg-[var(--bg-panel)] border-2 border-[var(--bg-brick)] hover:border-[var(--neon-cyan)]/60 rounded-xl transition-all shadow-md overflow-hidden mb-6">
      {/* Header Toggle */}
      <div className="flex items-center justify-between p-4 bg-[var(--bg-brick)]/60 cursor-pointer select-none" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-[var(--bg-void)] border border-[var(--neon-cyan)] flex items-center justify-center text-[var(--neon-cyan)]">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <h2 className="font-display text-xs sm:text-sm text-[var(--neon-amber)] uppercase tracking-wider">
            {t('filters.title')}
          </h2>

          {/* Active filters badge count */}
          {filters.genreIds.length > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-mono bg-[var(--neon-magenta)] text-white font-bold rounded-full">
              {filters.genreIds.length} {t('filters.genres').toLowerCase()}
            </span>
          )}
          {filters.actorName && (
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono bg-[var(--neon-cyan)] text-[var(--bg-void)] font-bold rounded">
              Actor: {filters.actorName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {resultsCount !== undefined && (
            <span className="text-xs font-mono text-[var(--neon-cyan)] hidden sm:inline">
              {resultsCount} {t('filters.results_count')}
            </span>
          )}
          <button className="text-[var(--ink-muted)] hover:text-[var(--ink-light)] p-1">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expanded Controls */}
      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-6">
          {/* Genre Badges (Multi-select) */}
          <div>
            <label className="block text-xs font-mono text-[var(--ink-muted)] uppercase tracking-wider mb-2.5">
              {t('filters.genres')}
            </label>
            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
              {genres.map((g) => {
                const isSelected = filters.genreIds.includes(g.id);
                return (
                  <button
                    key={g.id}
                    onClick={() => toggleGenre(g.id)}
                    className={`px-3 py-1 rounded text-xs font-mono transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[var(--neon-magenta)] text-white border border-[var(--neon-magenta)] shadow-neon-magenta font-semibold'
                        : 'bg-[var(--bg-void)] border border-[var(--ink-muted)]/30 text-[var(--ink-muted)] hover:border-[var(--neon-cyan)] hover:text-[var(--ink-light)]'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    {g.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Actor Search Input */}
            <div className="relative">
              <label className="block text-xs font-mono text-[var(--ink-muted)] uppercase tracking-wider mb-2">
                {t('filters.actor')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={actorSearchQuery}
                  onChange={(e) => setActorSearchQuery(e.target.value)}
                  placeholder={t('filters.actor_placeholder')}
                  className="w-full bg-[var(--bg-void)] border border-[var(--ink-muted)]/40 focus:border-[var(--neon-cyan)] text-[var(--ink-light)] font-mono text-xs px-3 py-2 pr-8 rounded outline-none transition-all"
                />
                <User className="w-4 h-4 text-[var(--ink-muted)] absolute right-2.5 top-2.5 pointer-events-none" />
                {actorSearchQuery && (
                  <button
                    onClick={handleClearActor}
                    className="absolute right-8 top-2 text-xs text-[var(--ink-muted)] hover:text-[var(--neon-magenta)]"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Autocomplete Dropdown */}
              {showActorDropdown && (
                <div className="absolute z-30 w-full mt-1 bg-[var(--bg-panel)] border border-[var(--neon-cyan)] rounded shadow-neon-cyan max-h-48 overflow-y-auto">
                  {actorResults.map((person) => (
                    <div
                      key={person.id}
                      onClick={() => handleSelectActor(person)}
                      className="px-3 py-2 text-xs font-mono text-[var(--ink-light)] hover:bg-[var(--neon-cyan)]/20 hover:text-[var(--neon-cyan)] cursor-pointer transition-colors border-b border-[var(--ink-muted)]/10 last:border-0"
                    >
                      {person.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Year Range */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-mono text-[var(--ink-muted)] uppercase tracking-wider">
                  {t('filters.year_range')}
                </label>
                <span className="text-xs font-mono text-[var(--neon-amber)] font-bold">
                  {filters.yearFrom} – {filters.yearTo}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1900"
                  max={filters.yearTo}
                  value={filters.yearFrom}
                  onChange={(e) => onChange({ ...filters, yearFrom: Number(e.target.value) })}
                  className="w-1/2 bg-[var(--bg-void)] border border-[var(--ink-muted)]/40 text-[var(--ink-light)] font-mono text-xs p-2 rounded outline-none text-center"
                />
                <span className="text-[var(--ink-muted)]">-</span>
                <input
                  type="number"
                  min={filters.yearFrom}
                  max={new Date().getFullYear()}
                  value={filters.yearTo}
                  onChange={(e) => onChange({ ...filters, yearTo: Number(e.target.value) })}
                  className="w-1/2 bg-[var(--bg-void)] border border-[var(--ink-muted)]/40 text-[var(--ink-light)] font-mono text-xs p-2 rounded outline-none text-center"
                />
              </div>
            </div>

            {/* Original Language Dropdown */}
            <div>
              <label className="block text-xs font-mono text-[var(--ink-muted)] uppercase tracking-wider mb-2">
                {t('filters.language')}
              </label>
              <select
                value={filters.language}
                onChange={(e) => onChange({ ...filters, language: e.target.value })}
                className="w-full bg-[var(--bg-void)] border border-[var(--ink-muted)]/40 focus:border-[var(--neon-cyan)] text-[var(--ink-light)] font-mono text-xs p-2 rounded outline-none cursor-pointer"
              >
                {LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.name || t(opt.nameKey!)}
                  </option>
                ))}
              </select>
            </div>

            {/* Minimum Rating Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-mono text-[var(--ink-muted)] uppercase tracking-wider">
                  {t('filters.min_rating')}
                </label>
                <span className="text-xs font-mono text-[var(--neon-green)] font-bold">
                  ★ {filters.minRating} / 10
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="9"
                step="0.5"
                value={filters.minRating}
                onChange={(e) => onChange({ ...filters, minRating: Number(e.target.value) })}
                className="w-full accent-[var(--neon-cyan)] cursor-pointer"
              />
            </div>

            {/* Runtime Range */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-mono text-[var(--ink-muted)] uppercase tracking-wider">
                  {t('filters.runtime_range')}
                </label>
                <span className="text-xs font-mono text-[var(--neon-amber)] font-bold">
                  {filters.minRuntime}m – {filters.maxRuntime >= 300 ? '300m+' : `${filters.maxRuntime}m`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="240"
                  step="15"
                  value={filters.minRuntime}
                  onChange={(e) => onChange({ ...filters, minRuntime: Number(e.target.value) })}
                  className="w-full accent-[var(--neon-amber)] cursor-pointer"
                />
              </div>
            </div>

            {/* Skip Watched Switch & Clear Button */}
            <div className="flex items-center justify-between pt-4 md:col-span-2 lg:col-span-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filters.skipWatched}
                  onChange={(e) => onChange({ ...filters, skipWatched: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[var(--bg-void)] border border-[var(--ink-muted)]/40 rounded-full peer peer-checked:bg-[var(--neon-cyan)] peer-checked:border-[var(--neon-cyan)] relative transition-all">
                  <div className="w-3.5 h-3.5 bg-[var(--ink-light)] rounded-full absolute top-0.5 left-0.5 peer-checked:translate-x-4 transition-transform" />
                </div>
                <span className="text-xs font-mono text-[var(--ink-light)]">
                  {t('filters.skip_watched')}
                </span>
              </label>

              <button
                onClick={() => {
                  setActorSearchQuery('');
                  onReset();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono text-[var(--neon-magenta)] hover:bg-[var(--neon-magenta)]/10 transition-colors border border-[var(--neon-magenta)]/30"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {t('filters.clear_filters')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
