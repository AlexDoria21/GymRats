import { useMemo } from 'react';
import { useGym } from '../state/GymContext';
import { currentStreak, weeklyCount } from '../lib/stats';

/** Poster-style hero: this week's training count + current day streak. */
export function StatBand() {
  const { state } = useGym();
  const { week, streak } = useMemo(
    () => ({
      week: weeklyCount(state.sessions),
      streak: currentStreak(state.sessions),
    }),
    [state.sessions]
  );

  return (
    <div className="rise flex items-stretch gap-3">
      <div className="relative flex-1 overflow-hidden rounded-2xl border border-line bg-surface p-4">
        <span aria-hidden className="blaze-fill absolute top-0 left-0 h-full w-[3px]" />
        <div className="eyebrow">Esta semana</div>
        <div className="mt-2 flex items-end gap-2">
          <span className="display blaze-text text-[64px]">{week}</span>
          <span className="mb-2 text-[13px] leading-tight font-semibold text-ink-2">
            {week === 1 ? 'entreno' : 'entrenos'}
          </span>
        </div>
      </div>

      <div className="relative flex w-[112px] flex-none flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface p-4">
        <div className="eyebrow">Racha</div>
        <div className="flex items-end gap-1.5">
          <span className="display text-[44px] text-ink">{streak}</span>
          <span className="mb-1.5 text-[18px]" aria-hidden>
            🔥
          </span>
        </div>
        <div className="text-[11px] font-semibold text-muted">
          {streak === 1 ? '1 día' : `${streak} días`}
        </div>
      </div>
    </div>
  );
}
