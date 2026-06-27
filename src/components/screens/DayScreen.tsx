import { useGym } from '../../state/GymContext';
import { suggestForDay } from '../../lib/suggestions';
import type { Exercise } from '../../types';
import { EmptyState } from '../common';
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
  const { currentDay, addSuggestedExercise, openModal } = useGym();
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
            className="flex flex-col gap-2.5 rounded-[18px] border border-[#5a2436] bg-[#1c0e14] p-2.5"
          >
            <div className="flex items-center gap-1.5 px-1 pt-0.5 text-[10.5px] font-bold tracking-[0.08em] text-blaze uppercase">
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
        <EmptyState
          title="Añade ejercicios"
          body="Cada ejercicio guarda sus series, reps y descanso. Anota la carga de cada semana y marca las series al completarlas."
          ctaLabel="＋  Agregar ejercicio"
          onCta={() => openModal({ type: 'exercise', name: '', sets: 4, reps: '8-12', rest: 90 })}
        />
      )}

      {suggestions.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="eyebrow px-0.5">Sugerencias para {d!.name}</div>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => addSuggestedExercise(name)}
                className="cursor-pointer rounded-full border border-line bg-bg px-3 py-1.5 text-[12.5px] font-semibold text-ink-2 active:scale-[0.97]"
              >
                {name} <span className="text-blaze">＋</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
