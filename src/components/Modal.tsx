import { useGym } from '../state/GymContext';
import { youtubeSearch } from '../lib/exerciseDb';
import { Dialog } from './Dialog';
import { ExerciseSearchInput } from './ExerciseSearchInput';

const LABEL = 'mt-4 mb-1.5 block text-[10.5px] tracking-[0.06em] text-[#5f5f66] uppercase';
const INPUT =
  'w-full rounded-[11px] border border-[#2a2a2e] bg-[#0d0d0f] p-[13px] text-[15px] text-[#f3f3f4] outline-none';

export function Modal() {
  const { state, setModalField, saveModal, closeModal } = useGym();
  const m = state.modal;
  if (!m) return null;

  const verb = m.id ? 'Editar ' : 'Nuevo ';
  const noun = m.type === 'routine' ? 'rutina' : m.type === 'day' ? 'día' : 'ejercicio';

  return (
    <Dialog onClose={closeModal} ariaLabel={`${verb}${noun}`} z="z-20" backdrop="bg-black/60">
      <div className="w-full max-w-[480px] animate-[sheetUp_.24s_cubic-bezier(.2,.8,.2,1)] rounded-t-3xl border border-b-0 border-[#2a2a2e] bg-[#161618] px-[18px] pt-[14px] pb-6">
        <div className="mx-auto mb-4 h-1 w-[38px] rounded-[3px] bg-[#2f2f35]" />
        <div className="mb-1.5 text-[18px] font-bold text-[#f3f3f4]">
          {verb}
          {noun}
        </div>

        <label className={LABEL}>Nombre</label>
        {m.type === 'exercise' ? (
          <ExerciseSearchInput
            value={m.name}
            onChange={(name) => setModalField('name', name)}
            onPick={(ex) => {
              setModalField('name', ex.name);
              if (!m.videoUrl.trim()) setModalField('videoUrl', youtubeSearch(ex.name));
            }}
          />
        ) : (
          <input
            value={m.name}
            onChange={(e) => setModalField('name', e.target.value)}
            placeholder="Ej. Push · Pecho/Hombro"
            className={INPUT}
            autoFocus
          />
        )}

        {m.type === 'exercise' && (
          <>
            <label className={LABEL}>Enlace de video (guía) · opcional</label>
            <input
              value={m.videoUrl}
              onChange={(e) => setModalField('videoUrl', e.target.value)}
              placeholder="https://youtube.com/... o tiktok.com/..."
              className={INPUT + ' text-[14px]'}
            />
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
