import { useGym } from '../../state/GymContext';
import { PALETTE } from '../../lib/palette';
import { EmptyHome, ListRow } from '../common';

export function HomeScreen() {
  const { state, openRoutine, openModal, duplicateRoutine, requestDelete } = useGym();

  return (
    <div className="flex flex-col gap-3 px-4 pt-4 pb-2">
      {state.routines.map((r, i) => {
        const exercises = r.days.reduce((a, d) => a + d.exercises.length, 0);
        const meta = `${r.days.length} días · ${exercises} ejercicios`;
        return (
          <ListRow
            key={r.id}
            name={r.name}
            meta={meta}
            accent={PALETTE[i % PALETTE.length]}
            onOpen={() => openRoutine(r.id)}
            onEdit={() => openModal({ type: 'routine', id: r.id, name: r.name })}
            onDuplicate={() => duplicateRoutine(r.id)}
            onDelete={() => requestDelete('routine', r.id, r.name)}
          />
        );
      })}
      {state.routines.length === 0 && (
        <EmptyHome text="Crea tu primera rutina con el botón de abajo." />
      )}
    </div>
  );
}
