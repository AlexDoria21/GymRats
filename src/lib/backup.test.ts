import { describe, expect, it } from 'vitest';
import { buildBackup, parseBackup } from './backup';
import { seed } from './seed';

describe('backup', () => {
  it('round-trips build -> stringify -> parse', () => {
    const data = { routines: seed(), unit: 'kg' as const };
    const text = JSON.stringify(buildBackup(data));
    const parsed = parseBackup(text);
    expect(parsed.unit).toBe('kg');
    expect(parsed.routines).toHaveLength(1);
    expect(parsed.routines[0].days).toHaveLength(3);
    expect(parsed.routines[0].days[0].exercises[0].name).toBe('Press de banca');
  });

  it('throws on invalid JSON', () => {
    expect(() => parseBackup('{not json')).toThrow();
  });

  it('throws when there are no routines', () => {
    expect(() => parseBackup('{"foo":1}')).toThrow();
  });

  it('sanitizes a partial routine (fills ids and defaults)', () => {
    const text = JSON.stringify({
      routines: [{ name: 'Mínima', days: [{ name: 'Día', exercises: [{ name: 'Sentadilla' }] }] }],
    });
    const parsed = parseBackup(text);
    const ex = parsed.routines[0].days[0].exercises[0];
    expect(ex.id).toBeTruthy();
    expect(ex.sets).toBeGreaterThanOrEqual(1);
    expect(ex.reps).toBe('8-12');
    expect(ex.weeks.length).toBeGreaterThanOrEqual(1);
    expect(ex.weeks[0].doneSets).toHaveLength(ex.sets);
  });
});
