import { describe, expect, it } from 'vitest';
import { suggestForDay } from './suggestions';

describe('suggestForDay', () => {
  it('matches a single category from the day name', () => {
    const out = suggestForDay('Push', []);
    expect(out).toContain('Press de banca');
    expect(out).toContain('Elevaciones laterales');
  });

  it('unions multiple categories for combined day names', () => {
    const out = suggestForDay('Pecho/Bícep', []);
    expect(out).toContain('Press de banca'); // pecho
    expect(out).toContain('Curl de bíceps con barra'); // biceps
  });

  it('excludes exercises already present (by normalized name)', () => {
    const out = suggestForDay('Espalda', ['remo en t']);
    expect(out).not.toContain('Remo en T');
    expect(out).toContain('Jalón al pecho');
  });

  it('returns nothing when no category keyword is found', () => {
    expect(suggestForDay('Cardio', [])).toEqual([]);
    expect(suggestForDay('', [])).toEqual([]);
  });

  it('does not repeat an exercise shared by two matched categories', () => {
    const out = suggestForDay('Pecho/Tríceps', []);
    // "Fondos en paralelas" is only in pecho here, ensure no duplicates overall
    expect(out.length).toBe(new Set(out).size);
  });
});
