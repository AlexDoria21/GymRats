import { useGym } from '../state/GymContext';
import type { Exercise } from '../types';

const ACTION =
  'flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border border-line bg-surface-2 px-2 py-2 text-[12px] font-semibold text-ink-2 active:scale-[0.97]';

export function ExerciseCard({ exercise: ex }: { exercise: Exercise }) {
  const {
    state,
    currentDay,
    setWeight,
    toggleSet,
    addWeek,
    deleteWeek,
    linkSuperset,
    unlinkSuperset,
    requestDelete,
    openModal,
    startRest,
    playVideo,
    openChart,
  } = useGym();
  const sub = `${ex.sets} series · ${ex.reps} reps · descanso ${ex.restSeconds}s`;
  const grouped = !!ex.supersetId;
  const idx = currentDay?.exercises.findIndex((e) => e.id === ex.id) ?? -1;
  const hasNext = idx >= 0 && currentDay ? idx + 1 < currentDay.exercises.length : false;

  // Signature charge bar reflects the most recent week's set completion.
  const latest = ex.weeks[ex.weeks.length - 1];
  const doneCount = latest ? latest.doneSets.filter(Boolean).length : 0;

  return (
    <div className="flex flex-col gap-[14px] rounded-2xl border border-line bg-surface p-4">
      {/* title */}
      <div className="min-w-0">
        <div className="text-[16.5px] font-bold tracking-[-0.01em] text-ink">{ex.name}</div>
        <div className="mt-1 text-[12.5px] font-medium text-muted">{sub}</div>
      </div>

      {/* charge bar — this week's progress */}
      {latest && (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="eyebrow">{latest.label} · series</span>
            <span className="text-[12px] font-bold text-ink tabular-nums">
              {doneCount}/{ex.sets}
            </span>
          </div>
          <div className="charge-track">
            {Array.from({ length: ex.sets }).map((_, i) => (
              <span key={i} className={'charge-seg' + (latest.doneSets[i] ? ' on' : '')} />
            ))}
          </div>
        </div>
      )}

      {/* action toolbar */}
      <div className="flex gap-2">
        <button onClick={() => playVideo(ex.videoUrl)} className={ACTION} title="Ver guía en YouTube">
          <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden>
            <polygon points="2,1 11,6 2,11" fill="var(--color-blaze)" />
          </svg>
          Guía
        </button>
        <button onClick={() => openChart(ex.id)} className={ACTION} title="Ver progreso de carga">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <polyline points="3,17 9,11 13,15 21,7" />
            <polyline points="15,7 21,7 21,13" />
          </svg>
          Progreso
        </button>
        <button onClick={() => startRest(ex)} className={ACTION} title="Iniciar descanso">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
          >
            <circle cx="12" cy="13" r="8" />
            <line x1="12" y1="13" x2="12" y2="8.5" />
            <line x1="12" y1="13" x2="15" y2="14.5" />
            <line x1="9.5" y1="2.5" x2="14.5" y2="2.5" />
          </svg>
          Descanso
        </button>
      </div>

      {/* weeks table */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5 px-0.5">
          <div className="eyebrow w-[44px]">Sem</div>
          <div className="eyebrow w-[96px]">Carga</div>
          <div className="eyebrow flex-1">Series hechas</div>
        </div>

        {ex.weeks.map((w) => (
          <div key={w.id} className="flex items-center gap-2.5">
            <div className="w-[44px] text-[13px] font-bold text-ink-2">{w.label}</div>
            <div className="flex w-[96px] items-center gap-[5px] rounded-[10px] border border-line bg-bg px-[9px] py-[7px]">
              <input
                type="number"
                inputMode="decimal"
                key={`${w.id}:${state.unit}`}
                defaultValue={w.weight}
                aria-label={`Carga ${w.label} en ${state.unit}`}
                onBlur={(e) => setWeight(ex.id, w.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                }}
                className="w-full min-w-0 border-none bg-transparent p-0 text-[14px] font-bold text-ink outline-none"
              />
              <span className="flex-none text-[10.5px] font-bold text-faint">{state.unit}</span>
            </div>
            <div className="flex flex-1 flex-wrap gap-1.5">
              {w.doneSets.map((done, i) => (
                <button
                  key={i}
                  onClick={() => toggleSet(ex, w.id, i)}
                  aria-label={`Serie ${i + 1} de ${w.label}${done ? ' (hecha)' : ''}`}
                  className={
                    'h-[32px] w-[32px] flex-none cursor-pointer rounded-[9px] text-[13px] transition-transform active:scale-90 ' +
                    (done
                      ? 'blaze-fill font-bold text-[#2a0710]'
                      : 'border border-line-2 bg-bg font-semibold text-muted')
                  }
                >
                  {i + 1}
                </button>
              ))}
            </div>
            {ex.weeks.length > 1 && (
              <button
                onClick={() => deleteWeek(ex.id, w.id)}
                title={`Eliminar ${w.label}`}
                aria-label={`Eliminar ${w.label}`}
                className="flex h-[28px] w-[28px] flex-none cursor-pointer items-center justify-center rounded-[8px] border border-[#5a2436] bg-transparent text-[16px] leading-none text-danger"
              >
                ×
              </button>
            )}
          </div>
        ))}

        {doneCount === 0 && (
          <div className="px-0.5 text-[11.5px] font-medium text-faint">
            Toca cada número al terminar la serie.
          </div>
        )}

        <button
          onClick={() => addWeek(ex.id)}
          className="mt-0.5 cursor-pointer self-start rounded-[10px] border border-dashed border-line-2 bg-transparent px-3 py-[7px] text-[12.5px] font-semibold text-ink-2"
        >
          ＋ Agregar semana
        </button>
      </div>

      {/* biserie toggle */}
      {(grouped || hasNext) && (
        <button
          onClick={() => (grouped ? unlinkSuperset(ex.id) : linkSuperset(ex.id))}
          className={
            'cursor-pointer self-start rounded-[10px] border px-3 py-[7px] text-[12.5px] font-semibold ' +
            (grouped
              ? 'border-[#5a2436] bg-transparent text-blaze'
              : 'border-dashed border-line-2 bg-transparent text-ink-2')
          }
        >
          {grouped ? '⛓️‍💥 Separar biserie' : '🔗 Biserie con el siguiente'}
        </button>
      )}

      {/* footer actions */}
      <div className="flex gap-2 border-t border-line pt-3">
        <button
          onClick={() =>
            openModal({
              type: 'exercise',
              id: ex.id,
              name: ex.name,
              sets: ex.sets,
              reps: ex.reps,
              rest: ex.restSeconds,
            })
          }
          className="flex-1 cursor-pointer rounded-[10px] border border-line bg-transparent p-[9px] text-[13px] font-semibold text-ink-2"
        >
          Editar
        </button>
        <button
          onClick={() => requestDelete('exercise', ex.id, ex.name)}
          className="flex-1 cursor-pointer rounded-[10px] border border-[#5a2436] bg-transparent p-[9px] text-[13px] font-semibold text-danger"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
