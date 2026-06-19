import { useGym } from '../state/GymContext';
import type { Exercise } from '../types';

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

  return (
    <div className="flex flex-col gap-[14px] rounded-2xl border border-[#26262b] bg-[#161618] p-4">
      {/* title row */}
      <div className="flex items-start gap-2.5">
        <div className="min-w-0 flex-1">
          <div className="text-[16px] font-semibold text-[#f3f3f4]">{ex.name}</div>
          <div className="mt-1 text-[12.5px] text-[#82828a]">{sub}</div>
        </div>
        <button
          onClick={() => playVideo(ex.videoUrl)}
          title="Ver guía"
          className="flex h-[37px] w-[37px] flex-none cursor-pointer items-center justify-center rounded-[10px] border border-[#2a2a2e] bg-[#1a1a1d]"
        >
          <svg width="13" height="13" viewBox="0 0 12 12">
            <polygon points="2,1 11,6 2,11" fill="#3d9bff" />
          </svg>
        </button>
        <button
          onClick={() => openChart(ex.id)}
          title="Ver progreso"
          className="flex h-[37px] w-[37px] flex-none cursor-pointer items-center justify-center rounded-[10px] border border-[#2a2a2e] bg-[#1a1a1d]"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#cfcfd4"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3,17 9,11 13,15 21,7" />
            <polyline points="15,7 21,7 21,13" />
          </svg>
        </button>
        <button
          onClick={() => startRest(ex)}
          title="Iniciar descanso"
          className="flex h-[37px] w-[37px] flex-none cursor-pointer items-center justify-center rounded-[10px] border border-[#2a2a2e] bg-[#1a1a1d]"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#cfcfd4"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="12" cy="13" r="8" />
            <line x1="12" y1="13" x2="12" y2="8.5" />
            <line x1="12" y1="13" x2="15" y2="14.5" />
            <line x1="9.5" y1="2.5" x2="14.5" y2="2.5" />
          </svg>
        </button>
      </div>

      {/* weeks table */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5 px-0.5 text-[10.5px] tracking-[0.06em] text-[#5a5a61] uppercase">
          <div className="w-[44px]">Sem</div>
          <div className="w-[96px]">Carga</div>
          <div className="flex-1">Series hechas</div>
        </div>

        {ex.weeks.map((w) => (
          <div key={w.id} className="flex items-center gap-2.5">
            <div className="w-[44px] text-[13px] font-semibold text-[#b3b3ba]">{w.label}</div>
            <div className="flex w-[96px] items-center gap-[5px] rounded-[10px] border border-[#2a2a2e] bg-[#0d0d0f] px-[9px] py-[7px]">
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
                className="w-full min-w-0 border-none bg-transparent p-0 text-[14px] font-semibold text-[#f3f3f4] outline-none"
              />
              <span className="flex-none text-[10.5px] font-semibold text-[#5a5a61]">
                {state.unit}
              </span>
            </div>
            <div className="flex flex-1 flex-wrap gap-1.5">
              {w.doneSets.map((done, i) => (
                <button
                  key={i}
                  onClick={() => toggleSet(ex, w.id, i)}
                  className={
                    'h-[32px] w-[32px] flex-none cursor-pointer rounded-[9px] text-[13px] ' +
                    (done
                      ? 'border border-[#3d9bff] bg-[#3d9bff] font-bold text-[#06121f]'
                      : 'border border-[#313137] bg-[#0d0d0f] font-semibold text-[#6a6a72]')
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
                className="flex h-[28px] w-[28px] flex-none cursor-pointer items-center justify-center rounded-[8px] border border-[#3a2422] bg-transparent text-[16px] leading-none text-[#ff6b5e]"
              >
                ×
              </button>
            )}
          </div>
        ))}

        <button
          onClick={() => addWeek(ex.id)}
          className="mt-0.5 cursor-pointer self-start rounded-[10px] border border-dashed border-[#2f2f35] bg-transparent px-3 py-[7px] text-[12.5px] font-medium text-[#b3b3ba]"
        >
          ＋ Agregar semana
        </button>
      </div>

      {/* biserie toggle */}
      {(grouped || hasNext) && (
        <button
          onClick={() => (grouped ? unlinkSuperset(ex.id) : linkSuperset(ex.id))}
          className={
            'cursor-pointer self-start rounded-[10px] border px-3 py-[7px] text-[12.5px] font-medium ' +
            (grouped
              ? 'border-[#3a3320] bg-transparent text-[#e0b85e]'
              : 'border-dashed border-[#2f2f35] bg-transparent text-[#b3b3ba]')
          }
        >
          {grouped ? '⛓️‍💥 Separar biserie' : '🔗 Biserie con el siguiente'}
        </button>
      )}

      {/* footer actions */}
      <div className="flex gap-2 border-t border-[#232327] pt-3">
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
          className="flex-1 cursor-pointer rounded-[10px] border border-[#2a2a2e] bg-transparent p-[9px] text-[13px] font-medium text-[#b3b3ba]"
        >
          Editar
        </button>
        <button
          onClick={() => requestDelete('exercise', ex.id, ex.name)}
          className="flex-1 cursor-pointer rounded-[10px] border border-[#3a2422] bg-transparent p-[9px] text-[13px] font-medium text-[#ff6b5e]"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
