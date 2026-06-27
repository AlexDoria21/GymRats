import { useGym } from '../../state/GymContext';
import { PALETTE } from '../../lib/palette';
import { EmptyState, ListRow } from '../common';
import { ActivityCalendar } from '../ActivityCalendar';
import { StatBand } from '../StatBand';

export function HomeScreen() {
  const { state, openRoutine, openModal, duplicateRoutine, requestDelete } = useGym();
  const hasRoutines = state.routines.length > 0;

  return (
    <div className="flex flex-col gap-3 px-4 pt-4 pb-2">
      <StatBand />

      <div className="eyebrow mt-2 px-0.5">Rutinas</div>
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
      {!hasRoutines && (
        <EmptyState
          title="Crea tu primera rutina"
          body="Una rutina organiza tu entrenamiento en tres niveles. Así se arma:"
          steps={[
            'Crea una rutina (p. ej. Hipertrofia)',
            'Añade días: Push, Pull, Legs…',
            'Añade ejercicios con series y cargas',
          ]}
          ctaLabel="＋  Crear rutina"
          onCta={() => openModal({ type: 'routine', name: '' })}
        />
      )}

      <div className="eyebrow mt-3 px-0.5">Actividad</div>
      <ActivityCalendar />
    </div>
  );
}
