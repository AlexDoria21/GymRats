import type { Unit } from '../types';

const LB_PER_KG = 2.20462;

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Convert a weight between units, rounded to 1 decimal. 0 stays 0. */
export function convertWeight(value: number, from: Unit, to: Unit): number {
  if (from === to || !value) return value;
  return round1(from === 'kg' ? value * LB_PER_KG : value / LB_PER_KG);
}
