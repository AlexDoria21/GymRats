import { describe, expect, it } from 'vitest';
import { convertWeight, round1 } from './convert';

describe('convertWeight', () => {
  it('keeps 0 and same-unit unchanged', () => {
    expect(convertWeight(0, 'kg', 'lb')).toBe(0);
    expect(convertWeight(60, 'kg', 'kg')).toBe(60);
  });

  it('converts kg -> lb', () => {
    expect(convertWeight(100, 'kg', 'lb')).toBeCloseTo(220.5, 1);
  });

  it('converts lb -> kg', () => {
    expect(convertWeight(220.5, 'lb', 'kg')).toBeCloseTo(100, 0);
  });

  it('round-trips within rounding tolerance', () => {
    const there = convertWeight(60, 'kg', 'lb');
    const back = convertWeight(there, 'lb', 'kg');
    expect(back).toBeCloseTo(60, 0);
  });

  it('round1 rounds to one decimal', () => {
    expect(round1(132.277)).toBe(132.3);
  });
});
