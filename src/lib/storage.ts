// Shared localStorage helpers: JSON read/write that never throw (private
// mode, quota, corrupted values) and a one-shot migration runner so data
// fix-ups don't re-run on every read.

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch (err) {
    console.error(`Error reading "${key}" from localStorage:`, err);
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving "${key}" to localStorage:`, err);
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error(`Error removing "${key}" from localStorage:`, err);
  }
}

/**
 * Runs `migrate` once per browser, keyed by `migrationKey`. The flag is only
 * written after the migration completes, so a crash mid-way retries next time.
 */
export function runMigrationOnce(migrationKey: string, migrate: () => void): void {
  try {
    if (localStorage.getItem(migrationKey) === 'done') return;
    migrate();
    localStorage.setItem(migrationKey, 'done');
  } catch (err) {
    console.error(`Migration "${migrationKey}" failed:`, err);
  }
}
