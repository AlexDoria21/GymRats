import { useEffect, useRef, useState } from 'react';
import { beep } from '../lib/format';

export interface TimerState {
  total: number;
  remaining: number;
  running: boolean;
  label: string;
}

export interface RestTimer {
  timer: TimerState | null;
  open: boolean;
  start: (sec: number, label?: string) => void;
  pauseResume: () => void;
  addTime: (delta: number) => void;
  reset: () => void;
  setPreset: (sec: number) => void;
  minimize: () => void;
  restore: () => void;
  close: () => void;
}

export function useRestTimer(): RestTimer {
  const [timer, setTimer] = useState<TimerState | null>(null);
  const [open, setOpen] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const clear = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const tick = () => {
    setTimer((t) => {
      if (!t) return t;
      const rem = t.remaining - 1;
      if (rem <= 0) {
        clear();
        beep();
        navigator.vibrate?.([200, 100, 200]);
        return { ...t, remaining: 0, running: false };
      }
      return { ...t, remaining: rem };
    });
  };

  const startInterval = () => {
    clear();
    intervalRef.current = window.setInterval(tick, 1000);
  };

  const start = (sec: number, label?: string) => {
    const s = sec || 60;
    setTimer({ total: s, remaining: s, running: true, label: label || 'Descanso' });
    setOpen(true);
    startInterval();
  };

  const pauseResume = () => {
    if (!timer) return;
    if (timer.running) {
      clear();
      setTimer({ ...timer, running: false });
    } else {
      if (timer.remaining <= 0) return;
      setTimer({ ...timer, running: true });
      startInterval();
    }
  };

  const addTime = (delta: number) => {
    if (!timer) return;
    const rem = Math.max(0, timer.remaining + delta);
    setTimer({ ...timer, remaining: rem, total: Math.max(timer.total, rem) });
  };

  const reset = () => {
    if (!timer) return;
    setTimer({ ...timer, remaining: timer.total, running: true });
    startInterval();
  };

  const setPreset = (sec: number) => {
    const label = timer?.label || 'Descanso';
    setTimer({ total: sec, remaining: sec, running: true, label });
    startInterval();
  };

  const minimize = () => setOpen(false);
  const restore = () => setOpen(true);

  const close = () => {
    clear();
    setTimer(null);
    setOpen(false);
  };

  // clear interval on unmount
  useEffect(() => () => clear(), []);

  return { timer, open, start, pauseResume, addTime, reset, setPreset, minimize, restore, close };
}
