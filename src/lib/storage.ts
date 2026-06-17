import type { GymData } from '../types';

const KEY = 'gymApp_v1';

export function loadData(): GymData | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GymData;
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
