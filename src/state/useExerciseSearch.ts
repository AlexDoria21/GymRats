import { useEffect, useState } from 'react';
import { searchExercises } from '../lib/exerciseDb';
import type { DbExercise } from '../lib/exerciseDb';

/** Debounced search over the local exercise database. */
export function useExerciseSearch(query: string): { results: DbExercise[]; loading: boolean } {
  const [results, setResults] = useState<DbExercise[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();
    let cancelled = false;

    // All state updates happen asynchronously (inside the timeout), never
    // synchronously in the effect body, to avoid cascading renders.
    const handle = window.setTimeout(() => {
      if (cancelled) return;
      if (q.length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      searchExercises(q, 8)
        .then((r) => {
          if (!cancelled) setResults(r);
        })
        .catch(() => {
          if (!cancelled) setResults([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 150);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query]);

  return { results, loading };
}
