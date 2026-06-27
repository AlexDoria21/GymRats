import { describe, expect, it } from 'vitest';
import { buildBackup, parseBackup } from './backup';
import { sampleRoutines } from '../test/fixtures';

describe('backup', () => {
  it('round-trips build -> stringify -> parse', () => {
    const data = {
      routines: sampleRoutines(),
      unit: 'kg' as const,
      sessions: [
        { id: 's1', routineId: 'r1', routineName: 'Rutina', startedAt: 1000, endedAt: 5000 },
      ],
      active: null,
    };
    const text = JSON.stringify(buildBackup(data));
    const parsed = parseBackup(text);
    expect(parsed.unit).toBe('kg');
    expect(parsed.routines).toHaveLength(1);
    expect(parsed.routines[0].days).toHaveLength(3);
    expect(parsed.routines[0].days[0].exercises[0].name).toBe('Press de banca');
    expect(parsed.sessions).toHaveLength(1);
    expect(parsed.sessions[0].endedAt).toBe(5000);
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
