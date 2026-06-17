import { produce } from 'immer';
import { uid } from '../lib/id';
import { loadData } from '../lib/storage';
import { seed } from '../lib/seed';
import { convertWeight } from '../lib/convert';
import { cloneDay, cloneRoutine } from '../lib/clone';
import type { Day, Exercise, ModalField, ModalState, Routine, Screen, Unit } from '../types';

export type DeleteKind = 'routine' | 'day' | 'exercise';

export interface ConfirmState {
  kind: DeleteKind;
  id: string;
  name: string;
}

export interface GymState {
  routines: Routine[];
  unit: Unit;
  screen: Screen;
  routineId: string | null;
  dayId: string | null;
  modal: ModalState | null;
  chartExId: string | null;
  confirm: ConfirmState | null;
  settingsOpen: boolean;
}

export type Action =
  | { type: 'OPEN_ROUTINE'; id: string }
  | { type: 'OPEN_DAY'; id: string }
  | { type: 'BACK' }
  | { type: 'TOGGLE_UNIT' }
  | { type: 'OPEN_MODAL'; modal: ModalState }
  | { type: 'CLOSE_MODAL' }
  | { type: 'SET_MODAL_FIELD'; field: ModalField; value: string }
  | { type: 'SET_WEIGHT'; exId: string; wkId: string; value: string }
  | { type: 'TOGGLE_SET'; exId: string; wkId: string; idx: number }
  | { type: 'DELETE_ROUTINE'; id: string }
  | { type: 'DELETE_DAY'; id: string }
  | { type: 'DELETE_EXERCISE'; id: string }
  | { type: 'REQUEST_DELETE'; kind: DeleteKind; id: string; name: string }
  | { type: 'CONFIRM_DELETE' }
  | { type: 'CANCEL_DELETE' }
  | { type: 'DUPLICATE_ROUTINE'; id: string }
  | { type: 'DUPLICATE_DAY'; id: string }
  | { type: 'IMPORT_DATA'; routines: Routine[]; unit: Unit }
  | { type: 'OPEN_SETTINGS' }
  | { type: 'CLOSE_SETTINGS' }
  | { type: 'OPEN_CHART'; id: string }
  | { type: 'CLOSE_CHART' }
  | { type: 'SAVE_MODAL' };

export function initState(): GymState {
  const data = loadData();
  const routines = data && data.routines && data.routines.length ? data.routines : seed();
  const unit: Unit = data?.unit ?? 'kg';
  return {
    routines,
    unit,
    screen: 'home',
    routineId: null,
    dayId: null,
    modal: null,
    chartExId: null,
    confirm: null,
    settingsOpen: false,
  };
}

// --- draft helpers (operate on the immer draft) ---
function draftRoutine(s: GymState): Routine | undefined {
  return s.routines.find((r) => r.id === s.routineId);
}
function draftDay(s: GymState): Day | undefined {
  return draftRoutine(s)?.days.find((d) => d.id === s.dayId);
}
function draftExercise(s: GymState, exId: string): Exercise | undefined {
  return draftDay(s)?.exercises.find((e) => e.id === exId);
}

function applySaveModal(s: GymState): void {
  const m = s.modal;
  if (!m) return;

  if (m.type === 'routine') {
    const name = (m.name || '').trim() || 'Rutina nueva';
    if (m.id) {
      const r = s.routines.find((x) => x.id === m.id);
      if (r) r.name = name;
    } else {
      s.routines.push({ id: uid(), name, days: [] });
    }
  } else if (m.type === 'day') {
    const name = (m.name || '').trim() || 'Día nuevo';
    const r = draftRoutine(s);
    if (!r) return;
    if (m.id) {
      const d = r.days.find((x) => x.id === m.id);
      if (d) d.name = name;
    } else {
      r.days.push({ id: uid(), name, exercises: [] });
    }
  } else {
    const name = (m.name || '').trim() || 'Ejercicio';
    const sets = Math.max(1, parseInt(String(m.sets), 10) || 1);
    const wkCount = Math.max(1, parseInt(String(m.weeks), 10) || 1);
    const rest = Math.max(5, parseInt(String(m.rest), 10) || 60);
    const reps = (m.reps || '').trim() || '8-12';
    const video = (m.videoUrl || '').trim();
    const d = draftDay(s);
    if (!d) return;

    if (m.id) {
      const e = d.exercises.find((x) => x.id === m.id);
      if (!e) return;
      e.name = name;
      e.sets = sets;
      e.reps = reps;
      e.restSeconds = rest;
      e.videoUrl = video;
      const old = e.weeks;
      const weeks = [];
      for (let i = 0; i < wkCount; i++) {
        const prev = old[i];
        const doneSets = prev ? prev.doneSets.slice(0, sets) : [];
        while (doneSets.length < sets) doneSets.push(false);
        weeks.push({
          id: prev ? prev.id : uid(),
          label: 'Sem ' + (i + 1),
          weight: prev ? prev.weight : 0,
          doneSets,
        });
      }
      e.weeks = weeks;
    } else {
      d.exercises.push({
        id: uid(),
        name,
        sets,
        reps,
        restSeconds: rest,
        videoUrl: video,
        weeks: Array.from({ length: wkCount }, (_, i) => ({
          id: uid(),
          label: 'Sem ' + (i + 1),
          weight: 0,
          doneSets: new Array(sets).fill(false),
        })),
      });
    }
  }
  s.modal = null;
}

// --- deletion helpers (operate on the immer draft) ---
function deleteRoutineDraft(s: GymState, id: string): void {
  const i = s.routines.findIndex((r) => r.id === id);
  if (i >= 0) s.routines.splice(i, 1);
}
function deleteDayDraft(s: GymState, id: string): void {
  const r = draftRoutine(s);
  if (!r) return;
  const i = r.days.findIndex((x) => x.id === id);
  if (i >= 0) r.days.splice(i, 1);
}
function deleteExerciseDraft(s: GymState, id: string): void {
  const day = draftDay(s);
  if (!day) return;
  const i = day.exercises.findIndex((x) => x.id === id);
  if (i >= 0) day.exercises.splice(i, 1);
  if (s.chartExId === id) s.chartExId = null;
}
function deleteByKind(s: GymState, kind: DeleteKind, id: string): void {
  if (kind === 'routine') deleteRoutineDraft(s, id);
  else if (kind === 'day') deleteDayDraft(s, id);
  else deleteExerciseDraft(s, id);
}

export function reducer(state: GymState, action: Action): GymState {
  switch (action.type) {
    case 'OPEN_ROUTINE':
      return { ...state, screen: 'routine', routineId: action.id, chartExId: null };
    case 'OPEN_DAY':
      return { ...state, screen: 'day', dayId: action.id, chartExId: null };
    case 'BACK':
      if (state.screen === 'day')
        return { ...state, screen: 'routine', dayId: null, chartExId: null };
      if (state.screen === 'routine') return { ...state, screen: 'home', routineId: null };
      return state;
    case 'OPEN_CHART':
      return { ...state, chartExId: action.id };
    case 'CLOSE_CHART':
      return { ...state, chartExId: null };
    case 'TOGGLE_UNIT': {
      const to: Unit = state.unit === 'kg' ? 'lb' : 'kg';
      return produce(state, (d) => {
        d.unit = to;
        for (const r of d.routines)
          for (const day of r.days)
            for (const ex of day.exercises)
              for (const w of ex.weeks) w.weight = convertWeight(w.weight, state.unit, to);
      });
    }
    case 'OPEN_MODAL':
      return { ...state, modal: action.modal };
    case 'CLOSE_MODAL':
      return { ...state, modal: null };
    case 'SET_MODAL_FIELD':
      return state.modal
        ? { ...state, modal: { ...state.modal, [action.field]: action.value } }
        : state;
    case 'SET_WEIGHT':
      return produce(state, (d) => {
        const w = draftExercise(d, action.exId)?.weeks.find((x) => x.id === action.wkId);
        if (w) {
          const n = parseFloat(action.value);
          w.weight = isNaN(n) ? 0 : n;
        }
      });
    case 'TOGGLE_SET':
      return produce(state, (d) => {
        const w = draftExercise(d, action.exId)?.weeks.find((x) => x.id === action.wkId);
        if (w) w.doneSets[action.idx] = !w.doneSets[action.idx];
      });
    case 'DELETE_ROUTINE':
      return produce(state, (d) => deleteRoutineDraft(d, action.id));
    case 'DELETE_DAY':
      return produce(state, (d) => deleteDayDraft(d, action.id));
    case 'DELETE_EXERCISE':
      return produce(state, (d) => deleteExerciseDraft(d, action.id));
    case 'REQUEST_DELETE':
      return { ...state, confirm: { kind: action.kind, id: action.id, name: action.name } };
    case 'CANCEL_DELETE':
      return { ...state, confirm: null };
    case 'CONFIRM_DELETE':
      if (!state.confirm) return state;
      return produce(state, (d) => {
        if (d.confirm) deleteByKind(d, d.confirm.kind, d.confirm.id);
        d.confirm = null;
      });
    case 'DUPLICATE_ROUTINE':
      return produce(state, (d) => {
        const i = d.routines.findIndex((r) => r.id === action.id);
        if (i < 0) return;
        const copy = cloneRoutine(d.routines[i]);
        copy.name = copy.name + ' (copia)';
        d.routines.splice(i + 1, 0, copy);
      });
    case 'DUPLICATE_DAY':
      return produce(state, (d) => {
        const r = draftRoutine(d);
        if (!r) return;
        const i = r.days.findIndex((x) => x.id === action.id);
        if (i < 0) return;
        const copy = cloneDay(r.days[i]);
        copy.name = copy.name + ' (copia)';
        r.days.splice(i + 1, 0, copy);
      });
    case 'IMPORT_DATA':
      return {
        ...state,
        routines: action.routines,
        unit: action.unit,
        screen: 'home',
        routineId: null,
        dayId: null,
        modal: null,
        chartExId: null,
        confirm: null,
        settingsOpen: false,
      };
    case 'OPEN_SETTINGS':
      return { ...state, settingsOpen: true };
    case 'CLOSE_SETTINGS':
      return { ...state, settingsOpen: false };
    case 'SAVE_MODAL':
      return produce(state, (d) => applySaveModal(d));
    default:
      return state;
  }
}
