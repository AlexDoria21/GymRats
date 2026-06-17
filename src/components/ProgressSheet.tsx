import { useGym } from '../state/GymContext';
import { estimate1RM, parseReps, weightStats } from '../lib/progress';
import { Dialog } from './Dialog';
import { WeightChart } from './WeightChart';

function Stat({ label, value, accent }: { label: string; value: string; accent?: 'up' | 'down' }) {
  const color = accent === 'up' ? '#3d9bff' : accent === 'down' ? '#ff6b5e' : '#f3f3f4';
  return (
    <div className="flex-1 rounded-[12px] border border-[#26262b] bg-[#0d0d0f] px-3 py-2.5">
      <div className="text-[9.5px] tracking-[0.06em] text-[#5f5f66] uppercase">{label}</div>
      <div className="mt-1 text-[17px] font-bold" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

export function ProgressSheet() {
  const { chartExercise, state, closeChart } = useGym();
  const ex = chartExercise;
  if (!ex) return null;

  const unit = state.unit;
  const points = ex.weeks.map((w, i) => ({ label: 'S' + (i + 1), value: w.weight }));
  const stats = weightStats(ex.weeks.map((w) => w.weight));
  const deltaText =
    stats.delta === null ? '—' : (stats.delta > 0 ? '+' : '') + stats.delta + ' ' + unit;

  const reps = parseReps(ex.reps);
  const orm = reps ? estimate1RM(stats.max, reps) : 0;

  return (
    <Dialog
      onClose={closeChart}
      ariaLabel={`Progreso de ${ex.name}`}
      z="z-[22]"
      backdrop="bg-black/65"
    >
      <div className="w-full max-w-[480px] animate-[sheetUp_.24s_cubic-bezier(.2,.8,.2,1)] rounded-t-3xl border border-b-0 border-[#2a2a2e] bg-[#161618] px-[18px] pt-[14px] pb-6">
        <div className="mx-auto mb-4 h-1 w-[38px] rounded-[3px] bg-[#2f2f35]" />

        <div className="mb-0.5 text-[11px] tracking-[0.09em] text-[#82828a] uppercase">
          Progreso de carga.
        </div>
        <div className="mb-4 truncate text-[18px] font-bold text-[#f3f3f4]">{ex.name}</div>

        {stats.hasData ? (
          <>
            <div className="rounded-[16px] border border-[#26262b] bg-[#0d0d0f] p-3">
              <WeightChart points={points} unit={unit} />
            </div>

            <div className="mt-3 flex gap-2.5">
              <Stat label="Inicial" value={`${stats.initial} ${unit}`} />
              <Stat label="Actual" value={`${stats.current} ${unit}`} />
              <Stat label="Máx" value={`${stats.max} ${unit}`} />
              <Stat
                label="Progreso"
                value={deltaText}
                accent={
                  stats.delta && stats.delta > 0
                    ? 'up'
                    : stats.delta && stats.delta < 0
                      ? 'down'
                      : undefined
                }
              />
            </div>

            <div className="mt-2.5 flex items-center justify-between rounded-[12px] border border-[#26262b] bg-[#0d0d0f] px-3.5 py-3">
              <div>
                <div className="text-[9.5px] tracking-[0.06em] text-[#5f5f66] uppercase">
                  1RM estimado · PR
                </div>
                <div className="mt-0.5 text-[12px] text-[#82828a]">
                  Fórmula Epley {reps ? `· ${reps} reps` : ''}
                </div>
              </div>
              <div className="text-right text-[18px] font-bold text-[#3d9bff]">
                {orm ? `${orm} ${unit}` : '—'}
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-[16px] border border-[#26262b] bg-[#0d0d0f] px-6 py-10 text-center text-[14px] leading-relaxed text-[#5f5f66]">
            Aún no registras cargas en este ejercicio.
            <br />
            Anota el peso de cada semana para ver tu progreso aquí.
          </div>
        )}

        <button
          onClick={closeChart}
          className="mt-5 w-full cursor-pointer rounded-xl border border-[#2a2a2e] bg-transparent p-[13px] text-[15px] font-semibold text-[#b3b3ba]"
        >
          Cerrar
        </button>
      </div>
    </Dialog>
  );
}
