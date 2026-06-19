import { useEffect, useRef, useState } from 'react';
import { beep } from '../lib/format';
import { cancelScheduled, notify, scheduleNotification } from '../lib/notify';

const FINISH_TITLE = 'Descanso finalizado';

export interface TimerState {
  total: number;
  remaining: number;
  running: boolean;
  label: string;
  /** Absolute epoch ms when the timer hits zero (only while running). */
  endsAt?: number;
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
  const timerRef = useRef<TimerState | null>(null);
  const firedRef = useRef(false);

  // Mirror latest timer into a ref for event handlers / the visibility listener.
  useEffect(() => {
    timerRef.current = timer;
  }, [timer]);

  const clear = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Fire the end-of-rest alerts exactly once per rest period.
  const fireFinish = (label: string) => {
    if (firedRef.current) return;
    firedRef.current = true;
    beep();
    navigator.vibrate?.([200, 100, 200]);
    // Show the alert now. Do NOT cancel the scheduled notification here: on native
    // that would dismiss the notification we just posted (same id), and on web the
    // shared tag means the triggered one replaces this rather than duplicating it.
    void notify(FINISH_TITLE, label);
  };

  const tick = () => {
    setTimer((t) => {
      if (!t || !t.running) return t;
      const rem = t.endsAt ? Math.round((t.endsAt - Date.now()) / 1000) : t.remaining - 1;
      if (rem <= 0) {
        clear();
        fireFinish(t.label);
        return { ...t, remaining: 0, running: false, endsAt: undefined };
      }
      return { ...t, remaining: rem };
    });
  };

  const startInterval = () => {
    clear();
    intervalRef.current = window.setInterval(tick, 1000);
  };

  // Start (or restart) a running countdown anchored to an absolute end time.
  const arm = (sec: number, label: string, total: number) => {
    const endsAt = Date.now() + sec * 1000;
    firedRef.current = false;
    setTimer({ total, remaining: sec, running: true, label, endsAt });
    void scheduleNotification(FINISH_TITLE, label, endsAt);
    startInterval();
  };

  const start = (sec: number, label?: string) => {
    const s = sec || 60;
    setOpen(true);
    arm(s, label || 'Descanso', s);
  };

  const pauseResume = () => {
    const t = timerRef.current;
    if (!t) return;
    if (t.running) {
      clear();
      const rem = t.endsAt ? Math.max(0, Math.round((t.endsAt - Date.now()) / 1000)) : t.remaining;
      void cancelScheduled();
      setTimer({ ...t, running: false, remaining: rem, endsAt: undefined });
    } else {
      if (t.remaining <= 0) return;
      arm(t.remaining, t.label, t.total);
    }
  };

  const addTime = (delta: number) => {
    const t = timerRef.current;
    if (!t) return;
    const rem = Math.max(0, t.remaining + delta);
    const total = Math.max(t.total, rem);
    if (t.running) {
      const endsAt = Date.now() + rem * 1000;
      firedRef.current = false;
      void scheduleNotification(FINISH_TITLE, t.label, endsAt);
      setTimer({ ...t, remaining: rem, total, endsAt });
    } else {
      setTimer({ ...t, remaining: rem, total });
    }
  };

  const reset = () => {
    const t = timerRef.current;
    if (!t) return;
    arm(t.total, t.label, t.total);
  };

  const setPreset = (sec: number) => {
    const label = timerRef.current?.label || 'Descanso';
    arm(sec, label, sec);
  };

  const minimize = () => setOpen(false);
  const restore = () => setOpen(true);

  const close = () => {
    clear();
    void cancelScheduled();
    setTimer(null);
    setOpen(false);
  };

  // Re-sync when the tab/app returns to the foreground (intervals are throttled
  // while backgrounded, so recompute from the absolute end time).
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      const t = timerRef.current;
      if (!t || !t.running || !t.endsAt) return;
      const rem = Math.round((t.endsAt - Date.now()) / 1000);
      if (rem <= 0) {
        clear();
        fireFinish(t.label);
        setTimer({ ...t, remaining: 0, running: false, endsAt: undefined });
      } else {
        setTimer({ ...t, remaining: rem });
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  // clear interval on unmount
  useEffect(() => () => clear(), []);

  return { timer, open, start, pauseResume, addTime, reset, setPreset, minimize, restore, close };
}
