import type { GymData } from '../types';

const KEY = 'gymApp_v2';
const LEGACY_KEY = 'gymApp_v1';

/** Ensure a parsed object has the current GymData shape (fills new fields). */
function normalize(raw: unknown): GymData | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Partial<GymData>;
  if (!Array.isArray(o.routines)) return null;
  return {
    routines: o.routines,
    unit: o.unit === 'lb' ? 'lb' : 'kg',
    sessions: Array.isArray(o.sessions) ? o.sessions : [],
    active: o.active ?? null,
  };
}

export function loadData(): GymData | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return normalize(JSON.parse(raw));
    // migrate from the v1 schema (routines + unit only)
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const migrated = normalize(JSON.parse(legacy));
      if (migrated) saveData(migrated);
      return migrated;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveData(data: GymData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* storage unavailable (private mode, quota) — ignore */
  }
}
