import { useEffect, useState } from 'react';
import { useGym } from '../state/GymContext';
import { fmtDuration } from '../lib/format';
import { Dialog } from './Dialog';

function Body({
  startedAt,
  routineName,
  onFinish,
  onCancel,
}: {
  startedAt: number;
  routineName: string;
  onFinish: () => void;
  onCancel: () => void;
}) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const elapsed = Math.floor((now - startedAt) / 1000);

  return (
    <Dialog onClose={onCancel} ariaLabel="Confirmar fin de rutina" z="z-30" backdrop="bg-black/70">
      <div className="sheet px-[18px] pt-[14px] pb-6">
        <div className="grabber" />
        <div className="display text-[22px] text-ink">¿Finalizar entrenamiento?</div>
        <div className="mt-2 text-[14px] leading-relaxed text-ink-2">
          Llevas <span className="font-bold text-blaze">{fmtDuration(elapsed)}</span> en «
          {routineName}». Se guardará la sesión de hoy.
        </div>

        <div className="mt-[22px] flex gap-2.5">
          <button onClick={onCancel} className="btn btn-ghost flex-1">
            Seguir
          </button>
          <button onClick={onFinish} className="btn btn-primary flex-1">
            Finalizar
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export function FinishSessionDialog() {
  const { state, finishSession, cancelFinishSession } = useGym();
  if (!state.finishConfirmOpen || !state.active) return null;

  return (
    <Body
      startedAt={state.active.startedAt}
      routineName={state.active.routineName}
      onFinish={finishSession}
      onCancel={cancelFinishSession}
    />
  );
}
