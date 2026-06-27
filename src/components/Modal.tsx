import { useGym } from '../state/GymContext';
import { Dialog } from './Dialog';

const LABEL = 'eyebrow mt-4 mb-1.5 block';
const INPUT =
  'w-full rounded-[11px] border border-line bg-bg p-[13px] text-[15px] font-medium text-ink outline-none focus:border-line-2';

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
      <div className="sheet px-[18px] pt-[14px] pb-6">
        <div className="grabber" />
        <div className="display mb-2 text-[22px] text-ink">
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
                    'cursor-pointer rounded-full border px-3 py-1.5 text-[12.5px] font-semibold ' +
                    (active
                      ? 'blaze-fill border-transparent text-[#2a0710]'
                      : 'border-line bg-bg text-ink-2')
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
            <div>
              <label className={LABEL}>Descanso (seg)</label>
              <input
                type="number"
                inputMode="numeric"
                value={m.rest}
                onChange={(e) => setModalField('rest', e.target.value)}
                className={INPUT}
              />
            </div>
          </>
        )}

        <div className="mt-[22px] flex gap-2.5">
          <button onClick={closeModal} className="btn btn-ghost flex-1">
            Cancelar
          </button>
          <button onClick={saveModal} className="btn btn-primary flex-1">
            Guardar
          </button>
        </div>
      </div>
    </Dialog>
  );
}
