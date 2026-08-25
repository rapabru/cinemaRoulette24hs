import type { FilterState } from './tmdb';

export interface FilterPreset {
  name: string;
  filters: FilterState;
}

const PRESETS_STORAGE_KEY = 'cyber_filter_presets_v1';

export function getPresets(): FilterPreset[] {
  try {
    const raw = localStorage.getItem(PRESETS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading filter presets from localStorage:', err);
    return [];
  }
}

function savePresetsList(list: FilterPreset[]): void {
  try {
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Error saving filter presets to localStorage:', err);
  }
}

export function savePreset(name: string, filters: FilterState): FilterPreset[] {
  const list = getPresets().filter((p) => p.name !== name);
  const updated = [...list, { name, filters }];
  savePresetsList(updated);
  return updated;
}

export function deletePreset(name: string): FilterPreset[] {
  const updated = getPresets().filter((p) => p.name !== name);
  savePresetsList(updated);
  return updated;
}
