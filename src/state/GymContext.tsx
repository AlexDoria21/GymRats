import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import type { ReactNode } from 'react';
import { saveData } from '../lib/storage';
import { openVideo } from '../lib/format';
import {
  canNotify,
  cancelSessionReminder,
  requestNotifications,
  scheduleSessionReminder,
} from '../lib/notify';
import type { Day, Exercise, GymData, ModalField, ModalState, Routine } from '../types';
import { initState, reducer } from './gymReducer';
import type { DeleteKind, GymState } from './gymReducer';
import { useRestTimer } from './useRestTimer';
import type { RestTimer } from './useRestTimer';

interface GymContextValue {
  state: GymState;
  currentRoutine: Routine | null;
  currentDay: Day | null;
  chartExercise: Exercise | null;
  title: string;
  timer: RestTimer;

  openRoutine: (id: string) => void;
  openDay: (id: string) => void;
  back: () => void;
  toggleUnit: () => void;

  openModal: (modal: ModalState) => void;
  closeModal: () => void;
  setModalField: (field: ModalField, value: string) => void;
  saveModal: () => void;

  setWeight: (exId: string, wkId: string, value: string) => void;
  toggleSet: (exercise: Exercise, wkId: string, idx: number) => void;
  addWeek: (exId: string) => void;
  deleteWeek: (exId: string, wkId: string) => void;
  linkSuperset: (exId: string) => void;
  unlinkSuperset: (exId: string) => void;

  requestDelete: (kind: DeleteKind, id: string, name: string) => void;
  confirmDelete: () => void;
  cancelDelete: () => void;

  duplicateRoutine: (id: string) => void;
  duplicateDay: (id: string) => void;
  reorderDay: (activeId: string, overId: string) => void;
  addSuggestedExercise: (name: string) => void;

  importData: (data: GymData) => void;
  openSettings: () => void;
  closeSettings: () => void;

  startSession: () => void;
  requestFinishSession: () => void;
  cancelFinishSession: () => void;
  finishSession: () => void;
  cancelSession: () => void;

  startRest: (exercise: Exercise) => void;
  playVideo: (url: string) => void;

  openChart: (id: string) => void;
  closeChart: () => void;
}

/** Remind the user ~2h30 after starting a routine in case they forgot to finish it. */
const SESSION_REMINDER_MS = (2 * 60 + 30) * 60 * 1000;

const Ctx = createContext<GymContextValue | null>(null);

export function GymProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initState);
  const timer = useRestTimer();

  // Ask for notification permission the first time a rest timer is started
  // (runs inside a user gesture: marking a set / tapping the rest button).
  const maybeAskNotify = () => {
    if (canNotify() && Notification.permission === 'default') void requestNotifications();
  };

  // persist data whenever routines, unit, sessions or the active session change
  useEffect(() => {
    saveData({
      routines: state.routines,
      unit: state.unit,
      sessions: state.sessions,
      active: state.active,
    });
  }, [state.routines, state.unit, state.sessions, state.active]);

  const currentRoutine = useMemo(
    () => state.routines.find((r) => r.id === state.routineId) ?? null,
    [state.routines, state.routineId]
  );
  const currentDay = useMemo(
    () => currentRoutine?.days.find((d) => d.id === state.dayId) ?? null,
    [currentRoutine, state.dayId]
  );
  const chartExercise = useMemo(
    () => currentDay?.exercises.find((e) => e.id === state.chartExId) ?? null,
    [currentDay, state.chartExId]
  );

  const title =
    state.screen === 'home'
      ? 'Mis rutinas'
      : state.screen === 'routine'
        ? (currentRoutine?.name ?? '')
        : (currentDay?.name ?? '');

  const value: GymContextValue = {
    state,
    currentRoutine,
    currentDay,
    chartExercise,
    title,
    timer,

    openRoutine: (id) => dispatch({ type: 'OPEN_ROUTINE', id }),
    openDay: (id) => dispatch({ type: 'OPEN_DAY', id }),
    back: () => dispatch({ type: 'BACK' }),
    toggleUnit: () => dispatch({ type: 'TOGGLE_UNIT' }),

    openModal: (modal) => dispatch({ type: 'OPEN_MODAL', modal }),
    closeModal: () => dispatch({ type: 'CLOSE_MODAL' }),
    setModalField: (field, value) => dispatch({ type: 'SET_MODAL_FIELD', field, value }),
    saveModal: () => dispatch({ type: 'SAVE_MODAL' }),

    setWeight: (exId, wkId, value) => dispatch({ type: 'SET_WEIGHT', exId, wkId, value }),
    toggleSet: (exercise, wkId, idx) => {
      const wk = exercise.weeks.find((w) => w.id === wkId);
      const willTurnOn = wk ? !wk.doneSets[idx] : false;
      dispatch({ type: 'TOGGLE_SET', exId: exercise.id, wkId, idx });
      if (willTurnOn) {
        maybeAskNotify();
        timer.start(exercise.restSeconds, exercise.name);
      }
    },
    addWeek: (exId) => dispatch({ type: 'ADD_WEEK', exId }),
    deleteWeek: (exId, wkId) => dispatch({ type: 'DELETE_WEEK', exId, wkId }),
    linkSuperset: (exId) => dispatch({ type: 'LINK_SUPERSET', exId }),
    unlinkSuperset: (exId) => dispatch({ type: 'UNLINK_SUPERSET', exId }),
    requestDelete: (kind, id, name) => dispatch({ type: 'REQUEST_DELETE', kind, id, name }),
    confirmDelete: () => dispatch({ type: 'CONFIRM_DELETE' }),
    cancelDelete: () => dispatch({ type: 'CANCEL_DELETE' }),

    duplicateRoutine: (id) => dispatch({ type: 'DUPLICATE_ROUTINE', id }),
    duplicateDay: (id) => dispatch({ type: 'DUPLICATE_DAY', id }),
    reorderDay: (activeId, overId) => dispatch({ type: 'REORDER_DAY', activeId, overId }),
    addSuggestedExercise: (name) => dispatch({ type: 'ADD_SUGGESTED_EXERCISE', name }),

    importData: (data) =>
      dispatch({
        type: 'IMPORT_DATA',
        routines: data.routines,
        unit: data.unit,
        sessions: data.sessions,
      }),
    openSettings: () => dispatch({ type: 'OPEN_SETTINGS' }),
    closeSettings: () => dispatch({ type: 'CLOSE_SETTINGS' }),

    startSession: () => {
      if (state.active || !currentRoutine) return;
      maybeAskNotify();
      dispatch({
        type: 'START_SESSION',
        routineId: currentRoutine.id,
        routineName: currentRoutine.name,
      });
      void scheduleSessionReminder(
        Date.now() + SESSION_REMINDER_MS,
        `Tu rutina "${currentRoutine.name}" sigue en curso. ¿La finalizas?`
      );
    },
    requestFinishSession: () => dispatch({ type: 'REQUEST_FINISH_SESSION' }),
    cancelFinishSession: () => dispatch({ type: 'CANCEL_FINISH_SESSION' }),
    finishSession: () => {
      dispatch({ type: 'FINISH_SESSION' });
      void cancelSessionReminder();
    },
    cancelSession: () => {
      dispatch({ type: 'CANCEL_SESSION' });
      void cancelSessionReminder();
    },

    startRest: (exercise) => {
      maybeAskNotify();
      timer.start(exercise.restSeconds, exercise.name);
    },
    playVideo: (url) => openVideo(url),

    openChart: (id) => dispatch({ type: 'OPEN_CHART', id }),
    closeChart: () => dispatch({ type: 'CLOSE_CHART' }),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGym(): GymContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useGym must be used within GymProvider');
  return v;
}
