import { uid } from './id';
import type { Day, Exercise, Routine } from '../types';

/** Deep clone an exercise with fresh ids; checkmarks reset, weights kept. */
function cloneExercise(e: Exercise): Exercise {
  return {
    ...e,
    id: uid(),
    weeks: e.weeks.map((w) => ({
      ...w,
      id: uid(),
      doneSets: w.doneSets.map(() => false),
    })),
  };
}

export function cloneDay(d: Day): Day {
  return { id: uid(), name: d.name, exercises: d.exercises.map(cloneExercise) };
}

export function cloneRoutine(r: Routine): Routine {
  return { id: uid(), name: r.name, days: r.days.map(cloneDay) };
}
