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

export interface GymData {
  routines: Routine[];
  unit: Unit;
}

export type Screen = 'home' | 'routine' | 'day';

export type ModalState =
  | { type: 'routine'; id?: string; name: string }
  | { type: 'day'; id?: string; name: string }
  | {
      type: 'exercise';
      id?: string;
      name: string;
      videoUrl: string;
      sets: number | string;
      reps: string;
      rest: number | string;
      weeks: number | string;
    };

export type ModalField = 'name' | 'videoUrl' | 'sets' | 'reps' | 'rest' | 'weeks';
