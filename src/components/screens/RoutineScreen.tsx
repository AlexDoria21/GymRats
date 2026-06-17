import { useGym } from '../../state/GymContext';
import { EmptyText, ListRow } from '../common';

export function RoutineScreen() {
  const { currentRoutine, openDay, openModal, duplicateDay, requestDelete } = useGym();
  const r = currentRoutine;
  const subtitle = r ? `${r.days.length}${r.days.length === 1 ? ' día' : ' días'}` : '';

  return (
    <div className="flex flex-col gap-3 px-4 pt-4 pb-2">
      <div className="px-0.5 pb-0.5 text-xs tracking-[0.07em] text-[#5f5f66] uppercase">
        {subtitle}
      </div>
      {r?.days.map((d) => (
        <ListRow
          key={d.id}
          name={d.name}
          meta={`${d.exercises.length}${d.exercises.length === 1 ? ' ejercicio' : ' ejercicios'}`}
          onOpen={() => openDay(d.id)}
          onEdit={() => openModal({ type: 'day', id: d.id, name: d.name })}
          onDuplicate={() => duplicateDay(d.id)}
          onDelete={() => requestDelete('day', d.id, d.name)}
        />
      ))}
      {(!r || r.days.length === 0) && (
        <EmptyText text="Agrega los días de esta rutina (Push, Pull, Legs...)." />
      )}
    </div>
  );
}
