import { useGym } from '../state/GymContext';
import { Dialog } from './Dialog';

const LABEL = 'mt-4 mb-1.5 block text-[10.5px] tracking-[0.06em] text-[#5f5f66] uppercase';
const INPUT =
  'w-full rounded-[11px] border border-[#2a2a2e] bg-[#0d0d0f] p-[13px] text-[15px] text-[#f3f3f4] outline-none';

const NAME_PLACEHOLDER: Record<string, string> = {
  routine: 'Ej. Hipertrofia · Mes 1',
  day: 'Ej. Push · Pecho/Hombro',
  exercise: 'Ej. Press de banca',
};

const DAY_PRESETS = [
  'Push',
  'Pull',
  'Legs',
  'Pecho',
  'Espalda',
  'Bícep',
  'Tríceps',
  'Pierna',
  'Pecho/Bícep',
  'Espalda/Tríceps',
];

export function Modal() {
  const { state, setModalField, saveModal, closeModal } = useGym();
  const m = state.modal;
  if (!m) return null;

  const verb = m.id ? 'Editar ' : 'Nueva ';
  const noun = m.type === 'routine' ? 'rutina' : m.type === 'day' ? 'día' : 'ejercicio';

  return (
    <Dialog onClose={closeModal} ariaLabel={`${verb}${noun}`} z="z-20" backdrop="bg-black/60">
      <div className="w-full max-w-[480px] animate-[sheetUp_.24s_cubic-bezier(.2,.8,.2,1)] rounded-t-3xl border border-b-0 border-[#2a2a2e] bg-[#161618] px-[18px] pt-[14px] pb-6">
        <div className="mx-auto mb-4 h-1 w-[38px] rounded-[3px] bg-[#2f2f35]" />
        <div className="mb-1.5 text-[18px] font-bold text-[#f3f3f4]">
          {verb}
          {noun}
        </div>

        {m.type === 'day' && (
          <div className="mb-1 flex flex-wrap gap-1.5">
            {DAY_PRESETS.map((preset) => {
              const active = m.name.trim() === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setModalField('name', preset)}
                  className={
                    'cursor-pointer rounded-full border px-3 py-1.5 text-[12.5px] font-medium ' +
                    (active
                      ? 'border-[#3d9bff] bg-[#3d9bff] text-[#06121f]'
                      : 'border-[#2a2a2e] bg-[#0d0d0f] text-[#b3b3ba]')
                  }
                >
                  {preset}
                </button>
              );
            })}
          </div>
        )}

        <label className={LABEL}>Nombre</label>
        <input
          value={m.name}
          onChange={(e) => setModalField('name', e.target.value)}
          placeholder={NAME_PLACEHOLDER[m.type]}
          className={INPUT}
          autoFocus
        />

        {m.type === 'exercise' && (
          <>
            <div className="flex gap-2.5">
              <div className="flex-1">
                <label className={LABEL}>Series</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={m.sets}
                  onChange={(e) => setModalField('sets', e.target.value)}
                  className={INPUT}
                />
              </div>
              <div className="flex-1">
                <label className={LABEL}>Reps</label>
                <input
                  value={m.reps}
                  onChange={(e) => setModalField('reps', e.target.value)}
                  placeholder="8-12"
                  className={INPUT}
                />
              </div>
            </div>
            <div className="flex gap-2.5">
              <div className="flex-1">
                <label className={LABEL}>Descanso (seg)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={m.rest}
                  onChange={(e) => setModalField('rest', e.target.value)}
                  className={INPUT}
                />
              </div>
              <div className="flex-1">
                <label className={LABEL}>Semanas</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={m.weeks}
                  onChange={(e) => setModalField('weeks', e.target.value)}
                  className={INPUT}
                />
              </div>
            </div>
          </>
        )}

        <div className="mt-[22px] flex gap-2.5">
          <button
            onClick={closeModal}
            className="flex-1 cursor-pointer rounded-xl border border-[#2a2a2e] bg-transparent p-[14px] text-[15px] font-semibold text-[#b3b3ba]"
          >
            Cancelar
          </button>
          <button
            onClick={saveModal}
            className="flex-1 cursor-pointer rounded-xl border-none bg-[#3d9bff] p-[14px] text-[15px] font-bold text-[#06121f]"
          >
            Guardar
          </button>
        </div>
      </div>
    </Dialog>
  );
}
