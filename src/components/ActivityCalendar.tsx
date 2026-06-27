import { useMemo, useState } from 'react';
import { useGym } from '../state/GymContext';
import { fmtDuration } from '../lib/format';

const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];
const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const dayKey = (y: number, m: number, d: number) => `${y}-${m}-${d}`;

interface DayInfo {
  count: number;
  totalSec: number;
}

export function ActivityCalendar() {
  const { state } = useGym();
  const today = new Date();
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [selected, setSelected] = useState<string | null>(null);

  // Per-day aggregate (count of sessions + total trained seconds) keyed by date.
  const byDay = useMemo(() => {
    const map = new Map<string, DayInfo>();
    for (const s of state.sessions) {
      const d = new Date(s.endedAt);
      const k = dayKey(d.getFullYear(), d.getMonth(), d.getDate());
      const sec = Math.max(0, Math.floor((s.endedAt - s.startedAt) / 1000));
      const cur = map.get(k) ?? { count: 0, totalSec: 0 };
      map.set(k, { count: cur.count + 1, totalSec: cur.totalSec + sec });
    }
    return map;
  }, [state.sessions]);

  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  // Monday-first leading offset.
  const firstOffset = (new Date(view.y, view.m, 1).getDay() + 6) % 7;
  const todayKey = dayKey(today.getFullYear(), today.getMonth(), today.getDate());
  const monthCount = Array.from(byDay.keys()).filter((k) =>
    k.startsWith(`${view.y}-${view.m}-`)
  ).length;

  const shift = (delta: number) => {
    const d = new Date(view.y, view.m + delta, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
    setSelected(null);
  };
  const goToday = () => {
    setView({ y: today.getFullYear(), m: today.getMonth() });
    setSelected(null);
  };

  const selInfo = selected ? byDay.get(selected) : undefined;
  const selDate = selected ? new Date(view.y, view.m, Number(selected.split('-')[2])) : null;
  const selLabel = selDate
    ? selDate.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })
    : '';

  const cells: (number | null)[] = [
    ...Array.from({ length: firstOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-bold text-ink capitalize">
            {MONTHS[view.m]} {view.y}
          </div>
          <div className="text-[12px] font-medium text-muted">
            {monthCount === 0
              ? 'Sin entrenamientos este mes'
              : `${monthCount} día${monthCount === 1 ? '' : 's'} entrenado${monthCount === 1 ? '' : 's'}`}
          </div>
        </div>
        <button
          onClick={goToday}
          className="cursor-pointer rounded-[9px] border border-line bg-bg px-2.5 py-1.5 text-[12px] font-semibold text-ink-2"
        >
          Hoy
        </button>
        <button
          onClick={() => shift(-1)}
          aria-label="Mes anterior"
          className="flex h-[32px] w-[32px] flex-none cursor-pointer items-center justify-center rounded-[9px] border border-line bg-bg pb-[2px] text-lg leading-none text-ink-2"
        >
          ‹
        </button>
        <button
          onClick={() => shift(1)}
          aria-label="Mes siguiente"
          className="flex h-[32px] w-[32px] flex-none cursor-pointer items-center justify-center rounded-[9px] border border-line bg-bg pb-[2px] text-lg leading-none text-ink-2"
        >
          ›
        </button>
      </div>

      <div className="mb-1.5 grid grid-cols-7 gap-1 text-center text-[10.5px] font-bold tracking-[0.06em] text-faint uppercase">
        {WEEKDAYS.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <div key={`b${i}`} />;
          const k = dayKey(view.y, view.m, d);
          const done = byDay.has(k);
          const isToday = k === todayKey;
          const isSel = k === selected;
          return (
            <button
              key={k}
              onClick={() => setSelected((cur) => (cur === k ? null : k))}
              className={
                'relative flex aspect-square cursor-pointer items-center justify-center rounded-[9px] text-[13px] ' +
                (done ? 'bg-[#2a0f16] font-bold text-blaze' : 'font-medium text-ink-2') +
                (isSel
                  ? ' ring-2 ring-[var(--color-blaze-2)]'
                  : isToday
                    ? ' ring-1 ring-blaze'
                    : '')
              }
            >
              {d}
              {done && (
                <span className="blaze-fill absolute bottom-[5px] inline-block h-[4px] w-[4px] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {selDate && (
        <div className="mt-3 rounded-[11px] border border-line bg-bg p-3 text-[13px]">
          <span className="font-bold text-ink capitalize">{selLabel}</span>
          {selInfo ? (
            <span className="text-muted">
              {' · '}
              <span className="font-bold text-blaze">{fmtDuration(selInfo.totalSec)}</span>
              {selInfo.count > 1 ? ` · ${selInfo.count} sesiones` : ''}
            </span>
          ) : (
            <span className="text-muted"> · Sin entrenamiento</span>
          )}
        </div>
      )}
    </div>
  );
}
