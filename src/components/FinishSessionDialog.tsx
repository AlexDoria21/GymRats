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
      <div className="w-full max-w-[480px] animate-[sheetUp_.24s_cubic-bezier(.2,.8,.2,1)] rounded-t-3xl border border-b-0 border-[#2a2a2e] bg-[#161618] px-[18px] pt-[14px] pb-6">
        <div className="mx-auto mb-4 h-1 w-[38px] rounded-[3px] bg-[#2f2f35]" />
        <div className="text-[18px] font-bold text-[#f3f3f4]">¿Finalizar entrenamiento?</div>
        <div className="mt-2 text-[14px] leading-relaxed text-[#9a9aa1]">
          Llevas <span className="font-semibold text-[#7ed08a]">{fmtDuration(elapsed)}</span> en «
          {routineName}». Se guardará la sesión de hoy.
        </div>

        <div className="mt-[22px] flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 cursor-pointer rounded-xl border border-[#2a2a2e] bg-transparent p-[14px] text-[15px] font-semibold text-[#b3b3ba]"
          >
            Seguir
          </button>
          <button
            onClick={onFinish}
            className="flex-1 cursor-pointer rounded-xl border-none bg-[#4cd964] p-[14px] text-[15px] font-bold text-[#06210d]"
          >
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
