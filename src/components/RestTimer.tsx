import { useGym } from '../state/GymContext';
import { RING_CIRCUMFERENCE, fmtTime, ringDashOffset } from '../lib/format';
import { Dialog } from './Dialog';

const PRESETS = [60, 90, 120];

export function RestTimer() {
  const { timer: rest } = useGym();
  const t = rest.timer;
  if (!t || !rest.open) return null;

  const toggleLabel = t.running ? 'Pausar' : t.remaining <= 0 ? 'Reiniciar' : 'Reanudar';
  const onToggle = () => (t.remaining <= 0 ? rest.reset() : rest.pauseResume());

  return (
    <Dialog
      onClose={rest.minimize}
      ariaLabel="Temporizador de descanso"
      z="z-[25]"
      backdrop="bg-black/70"
    >
      <div className="flex w-full max-w-[480px] animate-[sheetUp_.24s_cubic-bezier(.2,.8,.2,1)] flex-col items-center rounded-t-3xl border border-b-0 border-[#2a2a2e] bg-[#161618] px-[18px] pt-[14px] pb-[26px]">
        <div className="mx-auto mb-3 h-1 w-[38px] rounded-[3px] bg-[#2f2f35]" />
        <div className="mb-1 text-[11px] tracking-[0.09em] text-[#82828a] uppercase">Descanso</div>
        <div className="mb-[18px] max-w-[90%] overflow-hidden text-center text-[14px] font-semibold text-ellipsis whitespace-nowrap text-[#cfcfd4]">
          {t.label}
        </div>

        <div className="relative mb-[18px] flex h-[158px] w-[158px] items-center justify-center">
          <svg
            width="158"
            height="158"
            viewBox="0 0 140 140"
            className="absolute inset-0"
            style={{ transform: 'rotate(-90deg)' }}
          >
            <circle cx="70" cy="70" r="52" fill="none" stroke="#26262b" strokeWidth="9" />
            <circle
              cx="70"
              cy="70"
              r="52"
              fill="none"
              stroke="#3d9bff"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={ringDashOffset(t.total, t.remaining)}
              style={{ transition: 'stroke-dashoffset .95s linear' }}
            />
          </svg>
          <div className="text-[40px] font-bold tracking-[-0.02em] text-[#f3f3f4] tabular-nums">
            {fmtTime(t.remaining)}
          </div>
        </div>

        <div className="mb-[18px] flex gap-2">
          {PRESETS.map((sec) => (
            <button
              key={sec}
              onClick={() => rest.setPreset(sec)}
              className="cursor-pointer rounded-[20px] border border-[#2a2a2e] bg-[#1a1a1d] px-4 py-2 text-[13px] font-semibold text-[#cfcfd4]"
            >
              {sec}s
            </button>
          ))}
        </div>

        <div className="flex w-full items-center gap-3">
          <button
            onClick={() => rest.addTime(-15)}
            className="h-[54px] w-[54px] flex-none cursor-pointer rounded-[14px] border border-[#2a2a2e] bg-[#1a1a1d] text-[14px] font-bold text-[#cfcfd4]"
          >
            −15
          </button>
          <button
            onClick={onToggle}
            className="h-[54px] flex-1 cursor-pointer rounded-[14px] border-none bg-[#3d9bff] text-[16px] font-bold text-[#06121f]"
          >
            {toggleLabel}
          </button>
          <button
            onClick={() => rest.addTime(15)}
            className="h-[54px] w-[54px] flex-none cursor-pointer rounded-[14px] border border-[#2a2a2e] bg-[#1a1a1d] text-[14px] font-bold text-[#cfcfd4]"
          >
            +15
          </button>
        </div>

        <div className="mt-4 flex gap-6">
          <button
            onClick={() => rest.reset()}
            className="cursor-pointer border-none bg-transparent text-[13px] font-medium text-[#82828a]"
          >
            Reiniciar
          </button>
          <button
            onClick={() => rest.minimize()}
            className="cursor-pointer border-none bg-transparent text-[13px] font-medium text-[#82828a]"
          >
            Minimizar
          </button>
          <button
            onClick={() => rest.close()}
            className="cursor-pointer border-none bg-transparent text-[13px] font-medium text-[#82828a]"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Dialog>
  );
}
