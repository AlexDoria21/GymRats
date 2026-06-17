export interface WeightStats {
  hasData: boolean;
  initial: number | null; // first week with a load
  current: number | null; // last week with a load
  max: number;
  delta: number | null; // current - initial
}

/** Summary stats over per-week weights (0 = not logged yet). */
export function weightStats(weights: number[]): WeightStats {
  const nonzero = weights.filter((w) => w > 0);
  if (nonzero.length === 0) {
    return { hasData: false, initial: null, current: null, max: 0, delta: null };
  }
  const initial = nonzero[0];
  const current = nonzero[nonzero.length - 1];
  const max = Math.max(...nonzero);
  const delta = +(current - initial).toFixed(2);
  return { hasData: true, initial, current, max, delta };
}

/** First integer found in a reps string like "8-12" -> 8. */
export function parseReps(reps: string): number | null {
  const m = reps.match(/\d+/);
  return m ? parseInt(m[0], 10) : null;
}

/** Estimated 1RM via the Epley formula. */
export function estimate1RM(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  return +(weight * (1 + reps / 30)).toFixed(1);
}
