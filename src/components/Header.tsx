import { useEffect, useState } from 'react';
import { useGym } from '../state/GymContext';
import { fmtElapsed, fmtTime } from '../lib/format';

/** Live "time since the routine started" chip; tap to finish the session. */
function SessionChip({ startedAt, onFinish }: { startedAt: number; onFinish: () => void }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const elapsed = Math.floor((now - startedAt) / 1000);

  return (
    <button
      onClick={onFinish}
      aria-label="Finalizar rutina"
      title="Finalizar rutina"
      className="flex flex-none items-center gap-1.5 rounded-[20px] border border-[#2b4a2f] bg-[#10210f] px-2.5 py-1.5 text-[13px] font-bold text-[#7ed08a] tabular-nums"
    >
      <span className="inline-block h-[7px] w-[7px] rounded-full bg-[#4cd964]" />
      {fmtElapsed(elapsed)}
      <span className="text-[11px] font-semibold opacity-80">Finalizar</span>
    </button>
  );
}

export function Header() {
  const {
    state,
    title,
    back,
    toggleUnit,
    openSettings,
    timer,
    startSession,
    requestFinishSession,
  } = useGym();
  const showChip = timer.timer && !timer.open;

  return (
    <div className="flex flex-none items-center gap-2.5 border-b border-[#1f1f23] bg-[#0d0d0f] px-4 pt-4 pb-[14px]">
      {state.screen !== 'home' && (
        <button
          onClick={back}
          aria-label="Atrás"
          className="flex h-[38px] w-[38px] flex-none cursor-pointer items-center justify-center rounded-full border border-[#2a2a2e] bg-[#1a1a1d] pb-[3px] text-2xl leading-none text-[#e6e6ea]"
        >
          ‹
        </button>
      )}
      <div className="min-w-0 flex-1">
        <div className="overflow-hidden text-[21px] font-bold tracking-[-0.015em] text-ellipsis whitespace-nowrap text-[#f3f3f4]">
          {title}
        </div>
      </div>

      {state.active ? (
        <SessionChip startedAt={state.active.startedAt} onFinish={requestFinishSession} />
      ) : (
        state.screen === 'routine' && (
          <button
            onClick={startSession}
            aria-label="Iniciar rutina"
            className="flex flex-none cursor-pointer items-center gap-1.5 rounded-[20px] border border-[#2b4a2f] bg-[#10210f] px-3 py-1.5 text-[13px] font-bold text-[#7ed08a]"
          >
            <svg width="11" height="11" viewBox="0 0 12 12">
              <polygon points="2,1 11,6 2,11" fill="#7ed08a" />
            </svg>
            Iniciar
          </button>
        )
      )}

      {showChip && timer.timer && (
        <button
          onClick={timer.restore}
          aria-label="Abrir temporizador de descanso"
          className="flex flex-none items-center gap-1.5 rounded-[20px] border border-[#2a4a6a] bg-[#11243a] px-2.5 py-1.5 text-[13px] font-bold text-[#7fc0ff] tabular-nums"
        >
          <span
            className="inline-block h-[7px] w-[7px] rounded-full"
            style={{ background: timer.timer.running ? '#3d9bff' : '#5f5f66' }}
          />
          {fmtTime(timer.timer.remaining)}
        </button>
      )}

      <button
        onClick={toggleUnit}
        aria-label="Cambiar unidad de peso"
        className="flex-none cursor-pointer rounded-[20px] border border-[#2a2a2e] bg-[#1a1a1d] px-[13px] py-2 text-xs font-bold tracking-[0.04em] text-[#cfcfd4] uppercase"
      >
        {state.unit}
      </button>
      <button
        onClick={openSettings}
        aria-label="Datos y ajustes"
        className="flex h-[36px] w-[36px] flex-none cursor-pointer items-center justify-center rounded-full border border-[#2a2a2e] bg-[#1a1a1d] text-[#cfcfd4]"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="12" cy="19" r="1.8" />
        </svg>
      </button>
    </div>
  );
}
