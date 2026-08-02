import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal, ChevronDown, ChevronUp, User, Clapperboard, RotateCcw, Check } from 'lucide-react';
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

  // Dynamic Country Options according to language
  const countryOptions = [
    { code: '', name: i18n.language === 'en' ? 'Any country of origin' : 'Cualquier país de origen' },
    { code: 'AR', name: '🇦🇷 Argentina' },
    { code: 'US', name: i18n.language === 'en' ? '🇺🇸 United States' : '🇺🇸 Estados Unidos' },
    { code: 'ES', name: i18n.language === 'en' ? '🇪🇸 Spain' : '🇪🇸 España' },
    { code: 'MX', name: i18n.language === 'en' ? '🇲🇽 Mexico' : '🇲🇽 México' },
    { code: 'FR', name: i18n.language === 'en' ? '🇫🇷 France' : '🇫🇷 Francia' },
    { code: 'GB', name: i18n.language === 'en' ? '🇬🇧 United Kingdom' : '🇬🇧 Reino Unido' },
    { code: 'IT', name: i18n.language === 'en' ? '🇮🇹 Italy' : '🇮🇹 Italia' },
    { code: 'DE', name: i18n.language === 'en' ? '🇩🇪 Germany' : '🇩🇪 Alemania' },
    { code: 'JP', name: i18n.language === 'en' ? '🇯🇵 Japan' : '🇯🇵 Japón' },
    { code: 'KR', name: i18n.language === 'en' ? '🇰🇷 South Korea' : '🇰🇷 Corea del Sur' },
    { code: 'BR', name: i18n.language === 'en' ? '🇧🇷 Brazil' : '🇧🇷 Brasil' },
    { code: 'CL', name: '🇨🇱 Chile' },
    { code: 'CO', name: '🇨🇴 Colombia' },
    { code: 'UY', name: '🇺🇾 Uruguay' },
    { code: 'CA', name: i18n.language === 'en' ? '🇨🇦 Canada' : '🇨🇦 Canadá' },
    { code: 'AU', name: '🇦🇺 Australia' },
    { code: 'IN', name: '🇮🇳 India' },
    { code: 'CN', name: '🇨🇳 China' },
    { code: 'SE', name: i18n.language === 'en' ? '🇸🇪 Sweden' : '🇸🇪 Suecia' },
    { code: 'DK', name: i18n.language === 'en' ? '🇩🇰 Denmark' : '🇩🇰 Dinamarca' },
  ];

  // Industry options with labels
  const industryList = [
    { key: 'hollywood', label: i18n.language === 'en' ? '🎬 Hollywood (USA)' : '🎬 Hollywood (EE.UU.)' },
    { key: 'argentina', label: i18n.language === 'en' ? '🇦🇷 Argentine Cinema' : '🇦🇷 Cine Argentino' },
    { key: 'espanol', label: i18n.language === 'en' ? '🇪🇸 Spanish Cinema' : '🇪🇸 Cine Español' },
    { key: 'europeo', label: i18n.language === 'en' ? '🇪🇺 European Cinema' : '🇪🇺 Cine Europeo' },
    { key: 'asiatico', label: i18n.language === 'en' ? '⛩️ Asian Cinema' : '⛩️ Cine Asiático (Japón, Corea, India, China)' },
    { key: 'latin', label: i18n.language === 'en' ? '🌮 Latin Cinema' : '🌮 Cine Latinoamericano' },
    { key: 'shortFilms', label: i18n.language === 'en' ? '🎞️ Short Films (<45m)' : '🎞️ Cortometrajes (Cortos < 45m)' },
    { key: 'others', label: i18n.language === 'en' ? '🌐 Others / Indie' : '🌐 Otros / Independiente' },
  ];

  // Actor search state
  const [actorSearchQuery, setActorSearchQuery] = useState(filters.actorName);
  const [actorResults, setActorResults] = useState<PersonResult[]>([]);
  const [showActorDropdown, setShowActorDropdown] = useState(false);
  const actorSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Director search state
  const [directorSearchQuery, setDirectorSearchQuery] = useState(filters.directorName);
  const [directorResults, setDirectorResults] = useState<PersonResult[]>([]);
  const [showDirectorDropdown, setShowDirectorDropdown] = useState(false);
  const directorSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Local string states for numeric inputs so user can delete all digits and type completely from scratch
  const [yearFromInput, setYearFromInput] = useState<string>(String(filters.yearFrom ?? '1900'));
  const [yearToInput, setYearToInput] = useState<string>(String(filters.yearTo ?? new Date().getFullYear()));
  const [minRatingInput, setMinRatingInput] = useState<string>(String(filters.minRating ?? '6'));
  const [maxRatingInput, setMaxRatingInput] = useState<string>(String(filters.maxRating ?? '10'));
  const [minRuntimeInput, setMinRuntimeInput] = useState<string>(String(filters.minRuntime ?? '60'));
  const [maxRuntimeInput, setMaxRuntimeInput] = useState<string>(String(filters.maxRuntime ?? '300'));

  // Sync local inputs when filters object changes from external actions (like reset)
  useEffect(() => {
    setYearFromInput(filters.yearFrom ? String(filters.yearFrom) : '');
  }, [filters.yearFrom]);

  useEffect(() => {
    setYearToInput(filters.yearTo ? String(filters.yearTo) : '');
  }, [filters.yearTo]);

  useEffect(() => {
    setMinRatingInput(filters.minRating !== undefined ? String(filters.minRating) : '0');
  }, [filters.minRating]);

  useEffect(() => {
    setMaxRatingInput(filters.maxRating !== undefined ? String(filters.maxRating) : '10');
  }, [filters.maxRating]);

  useEffect(() => {
    setMinRuntimeInput(filters.minRuntime !== undefined ? String(filters.minRuntime) : '0');
  }, [filters.minRuntime]);

  useEffect(() => {
    setMaxRuntimeInput(filters.maxRuntime !== undefined ? String(filters.maxRuntime) : '300');
  }, [filters.maxRuntime]);

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

  // Debounced director search
  useEffect(() => {
    if (directorSearchTimeout.current) clearTimeout(directorSearchTimeout.current);

    if (!directorSearchQuery.trim()) {
      setDirectorResults([]);
      setShowDirectorDropdown(false);
      if (filters.directorId !== null) {
        onChange({ ...filters, directorId: null, directorName: '' });
      }
      return;
    }

    if (directorSearchQuery === filters.directorName) return;

    directorSearchTimeout.current = setTimeout(async () => {
      const results = await searchPerson(directorSearchQuery, i18n.language);
      setDirectorResults(results);
      setShowDirectorDropdown(results.length > 0);
    }, 300);

    return () => {
      if (directorSearchTimeout.current) clearTimeout(directorSearchTimeout.current);
    };
  }, [directorSearchQuery, i18n.language]);

  const toggleGenre = (genreId: number) => {
    const isSelected = filters.genreIds.includes(genreId);
    const updated = isSelected
      ? filters.genreIds.filter((id) => id !== genreId)
      : [...filters.genreIds, genreId];
    onChange({ ...filters, genreIds: updated });
  };

  const DEFAULT_BASE_INDUSTRIES = ['hollywood', 'argentina', 'espanol', 'europeo', 'latin'];

  const toggleIndustry = (key: string) => {
    const current = filters.selectedIndustries || DEFAULT_BASE_INDUSTRIES;
    const isChecked = current.includes(key);
    const updated = isChecked
      ? current.filter((k) => k !== key)
      : [...current, key];
    onChange({ ...filters, selectedIndustries: updated });
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

  const handleSelectDirector = (person: PersonResult) => {
    setDirectorSearchQuery(person.name);
    setShowDirectorDropdown(false);
    onChange({ ...filters, directorId: person.id, directorName: person.name });
  };

  const handleClearDirector = () => {
    setDirectorSearchQuery('');
    setDirectorResults([]);
    setShowDirectorDropdown(false);
    onChange({ ...filters, directorId: null, directorName: '' });
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
              {filters.genreIds.length} {t('filters.genres').toLowerCase()} (OR)
            </span>
          )}
          {filters.actorName && (
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono bg-[var(--neon-cyan)] text-[var(--bg-void)] font-bold rounded">
              Actor: {filters.actorName}
            </span>
          )}
          {filters.directorName && (
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono bg-[var(--neon-amber)] text-[var(--bg-void)] font-bold rounded">
              Director: {filters.directorName}
            </span>
          )}
          {filters.country && (
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono bg-[var(--neon-green)] text-[var(--bg-void)] font-bold rounded uppercase">
              Country: {filters.country}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {resultsCount !== undefined && (
            <span className="text-xs font-mono text-[var(--neon-cyan)] hidden sm:inline font-bold">
              {resultsCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} {t('filters.results_count')}
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
          {/* Film Industries & Categories Pre-checked Badges */}
          <div>
            <div className="flex flex-wrap items-baseline justify-between mb-2">
              <label className="text-xs font-mono text-[var(--ink-muted)] uppercase tracking-wider">
                INDUSTRIAS CINEMATOGRÁFICAS / CATEGORÍAS
              </label>
              <span className="text-[11px] font-mono text-[var(--neon-green)] italic">
                (Opciones pre-marcadas por defecto)
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {industryList.map((ind) => {
                const isChecked = (filters.selectedIndustries || DEFAULT_BASE_INDUSTRIES).includes(ind.key);
                return (
                  <button
                    key={ind.key}
                    type="button"
                    onClick={() => toggleIndustry(ind.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-2 cursor-pointer border ${
                      isChecked
                        ? 'bg-[var(--bg-void)] text-[var(--neon-green)] border-[var(--neon-green)] shadow-neon-green font-bold'
                        : 'bg-[var(--bg-void)] text-[var(--ink-muted)] border-[var(--ink-muted)]/30 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[10px] ${
                      isChecked ? 'border-[var(--neon-green)] bg-[var(--neon-green)] text-[var(--bg-void)] font-bold' : 'border-[var(--ink-muted)]'
                    }`}>
                      {isChecked && '✓'}
                    </span>
                    <span>{ind.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Genre Badges (Multi-select OR logic) */}
          <div>
            <div className="flex flex-wrap items-baseline justify-between mb-2">
              <label className="text-xs font-mono text-[var(--ink-muted)] uppercase tracking-wider">
                {t('filters.genres')}
              </label>
              <span className="text-[11px] font-mono text-[var(--neon-cyan)] italic">
                {t('filters.genre_or_hint')}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
              {genres.map((g) => {
                const isSelected = filters.genreIds.includes(g.id);
                let genreName = g.name;
                if (g.id === 0) {
                  genreName = i18n.language === 'en' ? 'Other' : 'Otro';
                } else if (i18n.language === 'es' && (g.id === 53 || g.name.toLowerCase() === 'suspense')) {
                  genreName = 'Suspenso';
                }
                return (
                  <button
                    key={g.id}
                    onClick={() => toggleGenre(g.id)}
                    className={`px-3 py-1 rounded text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--neon-magenta)] text-white border border-[var(--neon-magenta)] shadow-neon-magenta font-semibold'
                        : 'bg-[var(--bg-void)] border border-[var(--ink-muted)]/30 text-[var(--ink-muted)] hover:border-[var(--neon-cyan)] hover:text-[var(--ink-light)]'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    {genreName}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Director Search Input */}
            <div className="relative">
              <label className="block text-xs font-mono text-[var(--ink-muted)] uppercase tracking-wider mb-2">
                {t('filters.director')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={directorSearchQuery}
                  onChange={(e) => setDirectorSearchQuery(e.target.value)}
                  placeholder={t('filters.director_placeholder')}
                  className="w-full bg-[var(--bg-void)] border border-[var(--ink-muted)]/40 focus:border-[var(--neon-amber)] text-[var(--ink-light)] font-mono text-xs px-3 py-2 pr-8 rounded outline-none transition-all"
                />
                <Clapperboard className="w-4 h-4 text-[var(--neon-amber)] absolute right-2.5 top-2.5 pointer-events-none" />
                {directorSearchQuery && (
                  <button
                    onClick={handleClearDirector}
                    className="absolute right-8 top-2 text-xs text-[var(--ink-muted)] hover:text-[var(--neon-magenta)]"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Autocomplete Dropdown */}
              {showDirectorDropdown && (
                <div className="absolute z-30 w-full mt-1 bg-[var(--bg-panel)] border border-[var(--neon-amber)] rounded shadow-neon-amber max-h-48 overflow-y-auto">
                  {directorResults.map((person) => (
                    <div
                      key={person.id}
                      onClick={() => handleSelectDirector(person)}
                      className="px-3 py-2 text-xs font-mono text-[var(--ink-light)] hover:bg-[var(--neon-amber)]/20 hover:text-[var(--neon-amber)] cursor-pointer transition-colors border-b border-[var(--ink-muted)]/10 last:border-0"
                    >
                      {person.name} <span className="text-[10px] text-[var(--ink-muted)]">({person.known_for_department || 'Director'})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

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

            {/* Country of Origin Dropdown */}
            <div>
              <label className="block text-xs font-mono text-[var(--ink-muted)] uppercase tracking-wider mb-2">
                {t('filters.country')}
              </label>
              <select
                value={filters.country}
                onChange={(e) => onChange({ ...filters, country: e.target.value })}
                className="w-full bg-[var(--bg-void)] border border-[var(--ink-muted)]/40 focus:border-[var(--neon-amber)] text-[var(--ink-light)] font-mono text-xs p-2 rounded outline-none cursor-pointer font-bold"
              >
                {countryOptions.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Original Language Dropdown */}
            <div>
              <label className="block text-xs font-mono text-[var(--ink-muted)] uppercase tracking-wider mb-2">
                {t('filters.language')}
              </label>
              <select
                value={filters.language}
                onChange={(e) => onChange({ ...filters, language: e.target.value })}
                className="w-full bg-[var(--bg-void)] border border-[var(--ink-muted)]/40 focus:border-[var(--neon-cyan)] text-[var(--ink-light)] font-mono text-xs p-2 rounded outline-none cursor-pointer font-bold"
              >
                {LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.name || t(opt.nameKey!)}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Range */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-mono text-[var(--ink-muted)] uppercase tracking-wider">
                  {t('filters.year_range')}
                </label>
                <span className="text-xs font-mono text-[var(--neon-amber)] font-bold">
                  {filters.yearFrom || 1900} – {filters.yearTo || new Date().getFullYear()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <span className="text-[10px] font-mono text-[var(--ink-muted)] block mb-1">{t('filters.from_year')}</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="1900"
                    value={yearFromInput}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '');
                      setYearFromInput(raw);
                      if (raw === '') {
                        onChange({ ...filters, yearFrom: 0 });
                      } else {
                        const num = parseInt(raw, 10);
                        if (!isNaN(num)) onChange({ ...filters, yearFrom: num });
                      }
                    }}
                    className="w-full h-9 bg-[var(--bg-void)] border border-[var(--ink-muted)]/40 text-[var(--ink-light)] font-mono text-xs px-2 rounded outline-none text-center font-bold"
                  />
                </div>
                <span className="text-[var(--ink-muted)] mt-4">-</span>
                <div className="flex-1">
                  <span className="text-[10px] font-mono text-[var(--ink-muted)] block mb-1">{t('filters.to_year')}</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="2026"
                    value={yearToInput}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '');
                      setYearToInput(raw);
                      if (raw === '') {
                        onChange({ ...filters, yearTo: 0 });
                      } else {
                        const num = parseInt(raw, 10);
                        if (!isNaN(num)) onChange({ ...filters, yearTo: num });
                      }
                    }}
                    className="w-full h-9 bg-[var(--bg-void)] border border-[var(--ink-muted)]/40 text-[var(--ink-light)] font-mono text-xs px-2 rounded outline-none text-center font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Rating Range (Min & Max Number Inputs) */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-mono text-[var(--ink-muted)] uppercase tracking-wider">
                  {t('filters.rating_range')}
                </label>
                <span className="text-xs font-mono text-[var(--neon-green)] font-bold">
                  ★ {filters.minRating || 0} – {filters.maxRating || 10} / 10
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <span className="text-[10px] font-mono text-[var(--ink-muted)] block mb-1">{t('filters.min_rating_label')}</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    value={minRatingInput}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9.]/g, '');
                      setMinRatingInput(raw);
                      if (raw === '') {
                        onChange({ ...filters, minRating: 0 });
                      } else {
                        const num = parseFloat(raw);
                        if (!isNaN(num)) onChange({ ...filters, minRating: Math.max(0, Math.min(10, num)) });
                      }
                    }}
                    className="w-full h-9 bg-[var(--bg-void)] border border-[var(--ink-muted)]/40 text-[var(--ink-light)] font-mono text-xs px-2 rounded outline-none text-center font-bold"
                  />
                </div>
                <span className="text-[var(--ink-muted)] mt-4">-</span>
                <div className="flex-1">
                  <span className="text-[10px] font-mono text-[var(--ink-muted)] block mb-1">{t('filters.max_rating_label')}</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="10"
                    value={maxRatingInput}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9.]/g, '');
                      setMaxRatingInput(raw);
                      if (raw === '') {
                        onChange({ ...filters, maxRating: 10 });
                      } else {
                        const num = parseFloat(raw);
                        if (!isNaN(num)) onChange({ ...filters, maxRating: Math.max(0, Math.min(10, num)) });
                      }
                    }}
                    className="w-full h-9 bg-[var(--bg-void)] border border-[var(--ink-muted)]/40 text-[var(--ink-light)] font-mono text-xs px-2 rounded outline-none text-center font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Runtime Range (Text/Number Inputs) */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-mono text-[var(--ink-muted)] uppercase tracking-wider">
                  {t('filters.runtime_range')}
                </label>
                <span className="text-xs font-mono text-[var(--neon-amber)] font-bold">
                  {filters.minRuntime || 0}m – {!filters.maxRuntime || filters.maxRuntime >= 300 ? '300m+' : `${filters.maxRuntime}m`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <span className="text-[10px] font-mono text-[var(--ink-muted)] block mb-1">{t('filters.from_min')}</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={minRuntimeInput}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '');
                      setMinRuntimeInput(raw);
                      if (raw === '') {
                        onChange({ ...filters, minRuntime: 0 });
                      } else {
                        const num = parseInt(raw, 10);
                        if (!isNaN(num)) onChange({ ...filters, minRuntime: Math.max(0, num) });
                      }
                    }}
                    className="w-full h-9 bg-[var(--bg-void)] border border-[var(--ink-muted)]/40 text-[var(--ink-light)] font-mono text-xs px-2 rounded outline-none text-center font-bold"
                  />
                </div>
                <span className="text-[var(--ink-muted)] mt-4">-</span>
                <div className="flex-1">
                  <span className="text-[10px] font-mono text-[var(--ink-muted)] block mb-1">{t('filters.to_min')}</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="300"
                    value={maxRuntimeInput}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '');
                      setMaxRuntimeInput(raw);
                      if (raw === '') {
                        onChange({ ...filters, maxRuntime: 300 });
                      } else {
                        const num = parseInt(raw, 10);
                        if (!isNaN(num)) onChange({ ...filters, maxRuntime: Math.max(0, num) });
                      }
                    }}
                    className="w-full h-9 bg-[var(--bg-void)] border border-[var(--ink-muted)]/40 text-[var(--ink-light)] font-mono text-xs px-2 rounded outline-none text-center font-bold"
                  />
                </div>
              </div>
            </div>

            {/* High Contrast Skip Watched Toggle Switch & Clear Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 md:col-span-2 lg:col-span-2">
              <button
                type="button"
                onClick={() => onChange({ ...filters, skipWatched: !filters.skipWatched })}
                className={`px-3.5 py-2.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-3 border cursor-pointer ${
                  filters.skipWatched
                    ? 'bg-[var(--neon-cyan)] text-[var(--bg-void)] border-[var(--neon-cyan)] shadow-neon-cyan'
                    : 'bg-red-950/40 text-red-400 border-red-500/60 shadow-sm hover:bg-red-900/40'
                }`}
              >
                {/* Custom High Contrast Track */}
                <div className={`w-9 h-5 rounded-full relative transition-colors ${
                  filters.skipWatched ? 'bg-[var(--bg-void)]' : 'bg-red-900/80 border border-red-400/50'
                }`}>
                  <div className={`w-3.5 h-3.5 rounded-full absolute top-0.5 transition-transform ${
                    filters.skipWatched
                      ? 'left-4 bg-[var(--neon-cyan)] shadow-neon-cyan'
                      : 'left-0.5 bg-red-400'
                  }`} />
                </div>

                <span className="tracking-wider">
                  {filters.skipWatched ? t('filters.skip_watched_yes') : t('filters.skip_watched_no')}
                </span>
              </button>

              <button
                onClick={() => {
                  setActorSearchQuery('');
                  setDirectorSearchQuery('');
                  onReset();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-mono text-[var(--neon-magenta)] hover:bg-[var(--neon-magenta)]/10 transition-colors border border-[var(--neon-magenta)]/30 cursor-pointer"
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
