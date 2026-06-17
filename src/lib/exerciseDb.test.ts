import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { buildIndex, searchIndex } from './exerciseDb';
import type { DbExercise } from './exerciseDb';

let index: ReturnType<typeof buildIndex>;

beforeAll(() => {
  const raw = readFileSync(resolve(process.cwd(), 'public/exercises.json'), 'utf8');
  const data = JSON.parse(raw) as DbExercise[];
  index = buildIndex(data);
});

function names(q: string, n = 5): string[] {
  return searchIndex(index, q, n).map((e) => e.name.toLowerCase());
}

describe('exercise search (Spanish-aware)', () => {
  it('returns nothing for short queries', () => {
    expect(searchIndex(index, 'a', 5)).toHaveLength(0);
  });

  it('matches English names directly', () => {
    expect(names('bench press').some((n) => n.includes('bench press'))).toBe(true);
  });

  it('maps Spanish movement synonyms', () => {
    expect(names('sentadilla').some((n) => n.includes('squat'))).toBe(true);
    expect(names('dominadas').some((n) => n.includes('pull'))).toBe(true);
    expect(names('press banca').some((n) => n.includes('bench press'))).toBe(true);
  });

  it('matches by Spanish muscle name', () => {
    expect(names('gemelos').some((n) => n.includes('calf'))).toBe(true);
  });

  it('is accent-insensitive', () => {
    expect(names('tríceps').length).toBeGreaterThan(0);
    expect(names('triceps').length).toBeGreaterThan(0);
  });
});
