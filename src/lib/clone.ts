import { uid } from './id';
import type { Day, Exercise, Routine } from '../types';

/** Deep clone an exercise with fresh ids; checkmarks reset, weights kept. */
function cloneExercise(e: Exercise, supersetId?: string): Exercise {
  return {
    ...e,
    id: uid(),
    supersetId,
    weeks: e.weeks.map((w) => ({
      ...w,
      id: uid(),
      doneSets: w.doneSets.map(() => false),
    })),
  };
}

export function cloneDay(d: Day): Day {
  // remap superset ids so the copy has its own biserie groups
  const idMap = new Map<string, string>();
  const exercises = d.exercises.map((e) => {
    let gid: string | undefined;
    if (e.supersetId) {
      gid = idMap.get(e.supersetId);
      if (!gid) {
        gid = uid();
        idMap.set(e.supersetId, gid);
      }
    }
    return cloneExercise(e, gid);
  });
  return { id: uid(), name: d.name, exercises };
}

export function cloneRoutine(r: Routine): Routine {
  return { id: uid(), name: r.name, days: r.days.map(cloneDay) };
}
