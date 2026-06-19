import { useGym } from '../../state/GymContext';
import { suggestForDay } from '../../lib/suggestions';
import type { Exercise } from '../../types';
import { EmptyText } from '../common';
import { ExerciseCard } from '../ExerciseCard';

/** Group adjacent exercises that share a supersetId into biserie runs. */
function groupExercises(exercises: Exercise[]): Exercise[][] {
  const groups: Exercise[][] = [];
  for (const ex of exercises) {
    const last = groups[groups.length - 1];
    if (last && ex.supersetId && last[0].supersetId === ex.supersetId) last.push(ex);
    else groups.push([ex]);
  }
  return groups;
}

export function DayScreen() {
  const { currentDay, addSuggestedExercise } = useGym();
  const d = currentDay;
  const suggestions = d
    ? suggestForDay(
        d.name,
        d.exercises.map((e) => e.name)
      )
    : [];
  const groups = d ? groupExercises(d.exercises) : [];

  return (
    <div className="flex flex-col gap-[14px] px-4 pt-4 pb-2">
      {groups.map((group) =>
        group.length > 1 && group[0].supersetId ? (
          <div
            key={group[0].supersetId}
            className="flex flex-col gap-2.5 rounded-[18px] border border-[#3a3320] bg-[#15130c] p-2.5"
          >
            <div className="flex items-center gap-1.5 px-1 pt-0.5 text-[10.5px] font-semibold tracking-[0.06em] text-[#e0b85e] uppercase">
              🔗 Biserie · {group.length} ejercicios
            </div>
            {group.map((ex) => (
              <ExerciseCard key={ex.id} exercise={ex} />
            ))}
          </div>
        ) : (
          <ExerciseCard key={group[0].id} exercise={group[0]} />
        )
      )}
      {(!d || d.exercises.length === 0) && (
        <EmptyText text="Agrega ejercicios con sus series y cargas." />
      )}

      {suggestions.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="px-0.5 text-[10.5px] tracking-[0.06em] text-[#5f5f66] uppercase">
            Sugerencias para {d!.name}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => addSuggestedExercise(name)}
                className="cursor-pointer rounded-full border border-[#2a2a2e] bg-[#0d0d0f] px-3 py-1.5 text-[12.5px] font-medium text-[#b3b3ba]"
              >
                {name} ＋
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
