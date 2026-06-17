import { describe, expect, it } from 'vitest';
import { estimate1RM, parseReps, weightStats } from './progress';

describe('parseReps / estimate1RM', () => {
  it('parses the first integer from a reps range', () => {
    expect(parseReps('8-12')).toBe(8);
    expect(parseReps('10')).toBe(10);
    expect(parseReps('al fallo')).toBeNull();
  });

  it('estimates 1RM with the Epley formula', () => {
    // 100 * (1 + 10/30) = 133.3
    expect(estimate1RM(100, 10)).toBeCloseTo(133.3, 1);
    expect(estimate1RM(0, 10)).toBe(0);
    expect(estimate1RM(100, 0)).toBe(0);
  });
});

describe('weightStats', () => {
  it('reports no data when all weights are zero', () => {
    const s = weightStats([0, 0, 0]);
    expect(s.hasData).toBe(false);
    expect(s.initial).toBeNull();
    expect(s.delta).toBeNull();
    expect(s.max).toBe(0);
  });

  it('computes initial/current/max/delta over logged weeks', () => {
    const s = weightStats([60, 62.5, 65, 67.5]);
    expect(s.hasData).toBe(true);
    expect(s.initial).toBe(60);
    expect(s.current).toBe(67.5);
    expect(s.max).toBe(67.5);
    expect(s.delta).toBe(7.5);
  });

  it('ignores leading/trailing zero weeks for initial/current', () => {
    const s = weightStats([0, 50, 55, 0]);
    expect(s.initial).toBe(50);
    expect(s.current).toBe(55);
    expect(s.delta).toBe(5);
  });

  it('handles a negative delta (deload)', () => {
    const s = weightStats([80, 70]);
    expect(s.delta).toBe(-10);
  });
});
