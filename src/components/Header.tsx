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
      className="blaze-fill flex flex-none cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-bold text-[#2a0710] tabular-nums"
    >
      <span className="inline-block h-[7px] w-[7px] rounded-full bg-[#2a0710]" />
      {fmtElapsed(elapsed)}
      <span className="text-[11px] font-bold opacity-70">Finalizar</span>
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
    openHelp,
    timer,
    startSession,
    requestFinishSession,
  } = useGym();
  const showChip = timer.timer && !timer.open;
  const isHome = state.screen === 'home';

  return (
    <div className="flex flex-none items-center gap-2.5 border-b border-line bg-bg px-4 pt-4 pb-[14px]">
      {!isHome && (
        <button
          onClick={back}
          aria-label="Atrás"
          className="flex h-[38px] w-[38px] flex-none cursor-pointer items-center justify-center rounded-full border border-line-2 bg-surface-2 pb-[3px] text-2xl leading-none text-ink"
        >
          ‹
        </button>
      )}
      <div className="min-w-0 flex-1">
        {isHome && <div className="eyebrow mb-0.5">Gym Rats</div>}
        <div className="display overflow-hidden text-[26px] text-ellipsis whitespace-nowrap text-ink">
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
            className="flex flex-none cursor-pointer items-center gap-1.5 rounded-full border border-[#5a2436] bg-[#23121a] px-3 py-1.5 text-[13px] font-bold text-blaze"
          >
            <svg width="11" height="11" viewBox="0 0 12 12">
              <polygon points="2,1 11,6 2,11" fill="currentColor" />
            </svg>
            Iniciar
          </button>
        )
      )}

      {showChip && timer.timer && (
        <button
          onClick={timer.restore}
          aria-label="Abrir temporizador de descanso"
          className="flex flex-none items-center gap-1.5 rounded-full border border-line-2 bg-surface-2 px-2.5 py-1.5 text-[13px] font-bold text-ink tabular-nums"
        >
          <span
            className="inline-block h-[7px] w-[7px] rounded-full"
            style={{
              background: timer.timer.running ? 'var(--color-blaze)' : 'var(--color-faint)',
            }}
          />
          {fmtTime(timer.timer.remaining)}
        </button>
      )}

      <button
        onClick={toggleUnit}
        aria-label="Cambiar unidad de peso"
        className="flex-none cursor-pointer rounded-full border border-line-2 bg-surface-2 px-[13px] py-2 text-xs font-bold tracking-[0.06em] text-ink-2 uppercase"
      >
        {state.unit}
      </button>
      <button
        onClick={openHelp}
        aria-label="Cómo funciona"
        className="flex h-[36px] w-[36px] flex-none cursor-pointer items-center justify-center rounded-full border border-line-2 bg-surface-2 text-[15px] font-bold text-ink-2"
      >
        ?
      </button>
      <button
        onClick={openSettings}
        aria-label="Datos y ajustes"
        className="flex h-[36px] w-[36px] flex-none cursor-pointer items-center justify-center rounded-full border border-line-2 bg-surface-2 text-ink-2"
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
