import { useGym } from '../../state/GymContext';
import { suggestForDay } from '../../lib/suggestions';
import { EmptyText } from '../common';
import { ExerciseCard } from '../ExerciseCard';

export function DayScreen() {
  const { currentDay, addSuggestedExercise } = useGym();
  const d = currentDay;
  const suggestions = d
    ? suggestForDay(
        d.name,
        d.exercises.map((e) => e.name)
      )
    : [];

  return (
    <div className="flex flex-col gap-[14px] px-4 pt-4 pb-2">
      {d?.exercises.map((ex) => (
        <ExerciseCard key={ex.id} exercise={ex} />
      ))}
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
