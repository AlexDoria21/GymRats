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
      <div className="w-full max-w-[480px] animate-[sheetUp_.24s_cubic-bezier(.2,.8,.2,1)] rounded-t-3xl border border-b-0 border-[#2a2a2e] bg-[#161618] px-[18px] pt-[14px] pb-6">
        <div className="mx-auto mb-4 h-1 w-[38px] rounded-[3px] bg-[#2f2f35]" />
        <div className="text-[18px] font-bold text-[#f3f3f4]">¿Eliminar {noun}?</div>
        <div className="mt-2 text-[14px] leading-relaxed text-[#9a9aa1]">
          Se eliminará <span className="font-semibold text-[#cfcfd4]">«{c.name}»</span>
          {c.kind !== 'exercise' && ' y todo su contenido'}. Esta acción no se puede deshacer.
        </div>

        <div className="mt-[22px] flex gap-2.5">
          <button
            onClick={cancelDelete}
            className="flex-1 cursor-pointer rounded-xl border border-[#2a2a2e] bg-transparent p-[14px] text-[15px] font-semibold text-[#b3b3ba]"
          >
            Cancelar
          </button>
          <button
            onClick={confirmDelete}
            className="flex-1 cursor-pointer rounded-xl border-none bg-[#ff6b5e] p-[14px] text-[15px] font-bold text-[#2a0d0a]"
          >
            Eliminar
          </button>
        </div>
      </div>
    </Dialog>
  );
}
