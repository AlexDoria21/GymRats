import { describe, expect, it } from 'vitest';
import { currentStreak, weeklyCount } from './stats';
import type { Session } from '../types';

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date(2026, 5, 26, 12, 0, 0).getTime(); // fixed noon

function session(endedAt: number): Session {
  return {
    id: String(endedAt),
    routineId: 'r',
    routineName: 'R',
    startedAt: endedAt - 3600_000,
    endedAt,
  };
}

describe('weeklyCount', () => {
  it('counts sessions within the last 7 days', () => {
    const s = [session(NOW), session(NOW - 3 * DAY), session(NOW - 8 * DAY)];
    expect(weeklyCount(s, NOW)).toBe(2);
  });
  it('is 0 with no sessions', () => {
    expect(weeklyCount([], NOW)).toBe(0);
  });
});

describe('currentStreak', () => {
  it('counts consecutive days ending today', () => {
    const s = [session(NOW), session(NOW - DAY), session(NOW - 2 * DAY)];
    expect(currentStreak(s, NOW)).toBe(3);
  });
  it('still counts when today has no session but yesterday does', () => {
    const s = [session(NOW - DAY), session(NOW - 2 * DAY)];
    expect(currentStreak(s, NOW)).toBe(2);
  });
  it('breaks on a gap', () => {
    const s = [session(NOW), session(NOW - 3 * DAY)];
    expect(currentStreak(s, NOW)).toBe(1);
  });
  it('is 0 when the latest day is too old', () => {
    expect(currentStreak([session(NOW - 3 * DAY)], NOW)).toBe(0);
  });
  it('treats multiple sessions in one day as a single streak day', () => {
    const s = [session(NOW), session(NOW - 3600_000), session(NOW - DAY)];
    expect(currentStreak(s, NOW)).toBe(2);
  });
});
