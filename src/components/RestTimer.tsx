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
      <div className="sheet flex flex-col items-center px-[18px] pt-[14px] pb-[26px]">
        <div className="grabber" />
        <div className="eyebrow mb-1">Descanso</div>
        <div className="mb-[18px] max-w-[90%] overflow-hidden text-center text-[14px] font-semibold text-ellipsis whitespace-nowrap text-ink-2">
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
            <defs>
              <linearGradient id="rt-ring" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--color-blaze)" />
                <stop offset="100%" stopColor="var(--color-blaze-2)" />
              </linearGradient>
            </defs>
            <circle cx="70" cy="70" r="52" fill="none" stroke="var(--color-line)" strokeWidth="9" />
            <circle
              cx="70"
              cy="70"
              r="52"
              fill="none"
              stroke="url(#rt-ring)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={ringDashOffset(t.total, t.remaining)}
              style={{ transition: 'stroke-dashoffset .95s linear' }}
            />
          </svg>
          <div className="display text-[44px] text-ink tabular-nums">{fmtTime(t.remaining)}</div>
        </div>

        <div className="mb-[18px] flex gap-2">
          {PRESETS.map((sec) => (
            <button
              key={sec}
              onClick={() => rest.setPreset(sec)}
              className="cursor-pointer rounded-[20px] border border-line-2 bg-surface-2 px-4 py-2 text-[13px] font-bold text-ink-2"
            >
              {sec}s
            </button>
          ))}
        </div>

        <div className="flex w-full items-center gap-3">
          <button
            onClick={() => rest.addTime(-15)}
            className="h-[54px] w-[54px] flex-none cursor-pointer rounded-[14px] border border-line-2 bg-surface-2 text-[14px] font-bold text-ink-2"
          >
            −15
          </button>
          <button onClick={onToggle} className="btn btn-primary h-[54px] flex-1 text-[16px]">
            {toggleLabel}
          </button>
          <button
            onClick={() => rest.addTime(15)}
            className="h-[54px] w-[54px] flex-none cursor-pointer rounded-[14px] border border-line-2 bg-surface-2 text-[14px] font-bold text-ink-2"
          >
            +15
          </button>
        </div>

        <div className="mt-4 flex gap-6">
          <button
            onClick={() => rest.reset()}
            className="cursor-pointer border-none bg-transparent text-[13px] font-semibold text-muted"
          >
            Reiniciar
          </button>
          <button
            onClick={() => rest.minimize()}
            className="cursor-pointer border-none bg-transparent text-[13px] font-semibold text-muted"
          >
            Minimizar
          </button>
          <button
            onClick={() => rest.close()}
            className="cursor-pointer border-none bg-transparent text-[13px] font-semibold text-muted"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Dialog>
  );
}
