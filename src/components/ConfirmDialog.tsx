import { useGym } from '../state/GymContext';
import { Dialog } from './Dialog';

const NOUN: Record<string, string> = {
  routine: 'la rutina',
  day: 'el día',
  exercise: 'el ejercicio',
};

export function ConfirmDialog() {
  const { state, confirmDelete, cancelDelete } = useGym();
  const c = state.confirm;
  if (!c) return null;

  const noun = NOUN[c.kind] ?? 'el elemento';

  return (
    <Dialog
      onClose={cancelDelete}
      ariaLabel="Confirmar eliminación"
      z="z-30"
      backdrop="bg-black/70"
    >
      <div className="sheet px-[18px] pt-[14px] pb-6">
        <div className="grabber" />
        <div className="display text-[22px] text-ink">¿Eliminar {noun}?</div>
        <div className="mt-2 text-[14px] leading-relaxed text-ink-2">
          Se eliminará <span className="font-bold text-ink">«{c.name}»</span>
          {c.kind !== 'exercise' && ' y todo su contenido'}. Esta acción no se puede deshacer.
        </div>

        <div className="mt-[22px] flex gap-2.5">
          <button onClick={cancelDelete} className="btn btn-ghost flex-1">
            Cancelar
          </button>
          <button onClick={confirmDelete} className="btn btn-danger flex-1">
            Eliminar
          </button>
        </div>
      </div>
    </Dialog>
  );
}
