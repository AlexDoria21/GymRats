import { useGym } from '../../state/GymContext';
import { EmptyText } from '../common';
import { ExerciseCard } from '../ExerciseCard';

export function DayScreen() {
  const { currentDay } = useGym();
  const d = currentDay;

  return (
    <div className="flex flex-col gap-[14px] px-4 pt-4 pb-2">
      {d?.exercises.map((ex) => (
        <ExerciseCard key={ex.id} exercise={ex} />
      ))}
      {(!d || d.exercises.length === 0) && (
        <EmptyText text="Agrega ejercicios con sus series y cargas." />
      )}
    </div>
  );
}
