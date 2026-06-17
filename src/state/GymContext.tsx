import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import type { ReactNode } from 'react';
import { saveData } from '../lib/storage';
import { openVideo } from '../lib/format';
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

  requestDelete: (kind: DeleteKind, id: string, name: string) => void;
  confirmDelete: () => void;
  cancelDelete: () => void;

  duplicateRoutine: (id: string) => void;
  duplicateDay: (id: string) => void;

  importData: (data: GymData) => void;
  openSettings: () => void;
  closeSettings: () => void;

  startRest: (exercise: Exercise) => void;
  playVideo: (url: string) => void;

  openChart: (id: string) => void;
  closeChart: () => void;
}

const Ctx = createContext<GymContextValue | null>(null);

export function GymProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initState);
  const timer = useRestTimer();

  // persist data whenever routines or unit change
  useEffect(() => {
    saveData({ routines: state.routines, unit: state.unit });
  }, [state.routines, state.unit]);

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
      if (willTurnOn) timer.start(exercise.restSeconds, exercise.name);
    },
    requestDelete: (kind, id, name) => dispatch({ type: 'REQUEST_DELETE', kind, id, name }),
    confirmDelete: () => dispatch({ type: 'CONFIRM_DELETE' }),
    cancelDelete: () => dispatch({ type: 'CANCEL_DELETE' }),

    duplicateRoutine: (id) => dispatch({ type: 'DUPLICATE_ROUTINE', id }),
    duplicateDay: (id) => dispatch({ type: 'DUPLICATE_DAY', id }),

    importData: (data) =>
      dispatch({ type: 'IMPORT_DATA', routines: data.routines, unit: data.unit }),
    openSettings: () => dispatch({ type: 'OPEN_SETTINGS' }),
    closeSettings: () => dispatch({ type: 'CLOSE_SETTINGS' }),

    startRest: (exercise) => timer.start(exercise.restSeconds, exercise.name),
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
