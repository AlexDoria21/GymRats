import { useGym } from '../state/GymContext';
import { estimate1RM, parseReps, weightStats } from '../lib/progress';
import { Dialog } from './Dialog';
import { WeightChart } from './WeightChart';

function Stat({ label, value, accent }: { label: string; value: string; accent?: 'up' | 'down' }) {
  const color =
    accent === 'up'
      ? 'var(--color-blaze)'
      : accent === 'down'
        ? 'var(--color-danger)'
        : 'var(--color-ink)';
  return (
    <div className="flex-1 rounded-[12px] border border-line bg-bg px-3 py-2.5">
      <div className="eyebrow">{label}</div>
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
      <div className="sheet px-[18px] pt-[14px] pb-6">
        <div className="grabber" />

        <div className="eyebrow mb-0.5">Progreso de carga</div>
        <div className="display mb-4 truncate text-[22px] text-ink">{ex.name}</div>

        {stats.hasData ? (
          <>
            <div className="rounded-[16px] border border-line bg-bg p-3">
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

            <div className="mt-2.5 flex items-center justify-between rounded-[12px] border border-line bg-bg px-3.5 py-3">
              <div>
                <div className="eyebrow">1RM estimado · PR</div>
                <div className="mt-0.5 text-[12px] text-muted">
                  Fórmula Epley {reps ? `· ${reps} reps` : ''}
                </div>
              </div>
              <div className="text-right text-[18px] font-bold text-blaze">
                {orm ? `${orm} ${unit}` : '—'}
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-[16px] border border-line bg-bg px-6 py-10 text-center text-[14px] leading-relaxed text-muted">
            Aún no registras cargas en este ejercicio.
            <br />
            Anota el peso de cada semana para ver tu progreso aquí.
          </div>
        )}

        <button onClick={closeChart} className="btn btn-ghost mt-5 w-full">
          Cerrar
        </button>
      </div>
    </Dialog>
  );
}
