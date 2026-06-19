import { uid } from './id';
import type { Day, Exercise, GymData, Routine, Session, Unit, WeekEntry } from '../types';

export interface BackupFile {
  app: 'rutinas-gym';
  version: number;
  exportedAt: string;
  unit: Unit;
  routines: Routine[];
  sessions: Session[];
}

export function buildBackup(data: GymData): BackupFile {
  return {
    app: 'rutinas-gym',
    version: 2,
    exportedAt: new Date().toISOString(),
    unit: data.unit,
    routines: data.routines,
    sessions: data.sessions,
  };
}

function toNumber(v: unknown, fallback: number): number {
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : fallback;
}

function sanitizeWeek(raw: unknown, sets: number, i: number): WeekEntry {
  const w = (raw ?? {}) as Record<string, unknown>;
  const done = Array.isArray(w.doneSets) ? w.doneSets.map(Boolean) : [];
  while (done.length < sets) done.push(false);
  return {
    id: typeof w.id === 'string' ? w.id : uid(),
    label: typeof w.label === 'string' ? w.label : 'Sem ' + (i + 1),
    weight: toNumber(w.weight, 0),
    doneSets: done.slice(0, sets),
  };
}

function sanitizeExercise(raw: unknown): Exercise {
  const e = (raw ?? {}) as Record<string, unknown>;
  const sets = Math.max(1, Math.round(toNumber(e.sets, 4)));
  const weeksRaw = Array.isArray(e.weeks) ? e.weeks : [];
  const weeks = (weeksRaw.length ? weeksRaw : [{}]).map((w, i) => sanitizeWeek(w, sets, i));
  return {
    id: typeof e.id === 'string' ? e.id : uid(),
    name: typeof e.name === 'string' && e.name.trim() ? e.name : 'Ejercicio',
    sets,
    reps: typeof e.reps === 'string' && e.reps.trim() ? e.reps : '8-12',
    restSeconds: Math.max(5, Math.round(toNumber(e.restSeconds, 60))),
    videoUrl: typeof e.videoUrl === 'string' ? e.videoUrl : '',
    weeks,
    ...(typeof e.supersetId === 'string' ? { supersetId: e.supersetId } : {}),
  };
}

function sanitizeDay(raw: unknown): Day {
  const d = (raw ?? {}) as Record<string, unknown>;
  return {
    id: typeof d.id === 'string' ? d.id : uid(),
    name: typeof d.name === 'string' && d.name.trim() ? d.name : 'Día',
    exercises: Array.isArray(d.exercises) ? d.exercises.map(sanitizeExercise) : [],
  };
}

function sanitizeRoutine(raw: unknown): Routine {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    id: typeof r.id === 'string' ? r.id : uid(),
    name: typeof r.name === 'string' && r.name.trim() ? r.name : 'Rutina',
    days: Array.isArray(r.days) ? r.days.map(sanitizeDay) : [],
  };
}

function sanitizeSession(raw: unknown): Session | null {
  const x = (raw ?? {}) as Record<string, unknown>;
  const startedAt = toNumber(x.startedAt, NaN);
  const endedAt = toNumber(x.endedAt, NaN);
  if (!Number.isFinite(startedAt) || !Number.isFinite(endedAt)) return null;
  return {
    id: typeof x.id === 'string' ? x.id : uid(),
    routineId: typeof x.routineId === 'string' ? x.routineId : '',
    routineName: typeof x.routineName === 'string' ? x.routineName : 'Rutina',
    startedAt,
    endedAt,
  };
}

/** Parse + sanitize a backup file. Throws on clearly invalid input. */
export function parseBackup(text: string): GymData {
  let obj: unknown;
  try {
    obj = JSON.parse(text);
  } catch {
    throw new Error('El archivo no es un JSON válido.');
  }
  const o = obj as Record<string, unknown>;
  if (!o || typeof o !== 'object' || !Array.isArray(o.routines)) {
    throw new Error('El archivo no contiene rutinas.');
  }
  const unit: Unit = o.unit === 'lb' ? 'lb' : 'kg';
  const routines = o.routines.map(sanitizeRoutine);
  const sessions = Array.isArray(o.sessions)
    ? o.sessions.map(sanitizeSession).filter((s): s is Session => s !== null)
    : [];
  return { routines, unit, sessions, active: null };
}
