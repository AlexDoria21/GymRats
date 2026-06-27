import type { Session } from '../types';

/** Local YYYY-M-D key for a timestamp (used to collapse sessions to a day). */
function dayKey(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** Set of distinct local days (by `endedAt`) on which a session was finished. */
function trainedDays(sessions: Session[]): Set<string> {
  const s = new Set<string>();
  for (const x of sessions) s.add(dayKey(x.endedAt));
  return s;
}

/** Sessions finished within the last 7 days (including today). */
export function weeklyCount(sessions: Session[], now: number = Date.now()): number {
  const since = now - 7 * 24 * 60 * 60 * 1000;
  return sessions.filter((s) => s.endedAt >= since && s.endedAt <= now).length;
}

/**
 * Consecutive-day training streak ending today (or yesterday — so an unfinished
 * "today" doesn't break a run). 0 when the most recent trained day is older.
 */
export function currentStreak(sessions: Session[], now: number = Date.now()): number {
  if (sessions.length === 0) return 0;
  const days = trainedDays(sessions);
  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);

  const key = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  // Allow the streak to start at today or yesterday.
  if (!days.has(key(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(key(cursor))) return 0;
  }
  let streak = 0;
  while (days.has(key(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
