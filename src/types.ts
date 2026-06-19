export type Unit = 'kg' | 'lb';

export interface WeekEntry {
  id: string;
  label: string;
  weight: number;
  doneSets: boolean[];
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  videoUrl: string;
  weeks: WeekEntry[];
  /** Exercises that share this id (and are adjacent) form a superset/biserie. */
  supersetId?: string;
}

export interface Day {
  id: string;
  name: string;
  exercises: Exercise[];
}

export interface Routine {
  id: string;
  name: string;
  days: Day[];
}

/** A day-training session currently in progress. */
export interface ActiveSession {
  routineId: string;
  routineName: string;
  startedAt: number;
}

/** A completed day-training session. */
export interface Session {
  id: string;
  routineId: string;
  routineName: string;
  startedAt: number;
  endedAt: number;
}

export interface GymData {
  routines: Routine[];
  unit: Unit;
  sessions: Session[];
  active: ActiveSession | null;
}

export type Screen = 'home' | 'routine' | 'day';

export type ModalState =
  | { type: 'routine'; id?: string; name: string }
  | { type: 'day'; id?: string; name: string }
  | {
      type: 'exercise';
      id?: string;
      name: string;
      sets: number | string;
      reps: string;
      rest: number | string;
    };

export type ModalField = 'name' | 'sets' | 'reps' | 'rest';
