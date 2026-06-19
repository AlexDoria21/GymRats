import { describe, expect, it } from 'vitest';
import { reducer } from './gymReducer';
import type { GymState } from './gymReducer';
import { seed } from '../lib/seed';

function base(): GymState {
  return {
    routines: seed(),
    unit: 'kg',
    sessions: [],
    active: null,
    finishConfirmOpen: false,
    screen: 'home',
    routineId: null,
    dayId: null,
    modal: null,
    chartExId: null,
    confirm: null,
    settingsOpen: false,
  };
}

describe('navigation', () => {
  it('opens a routine then a day, and goes back', () => {
    let s = base();
    const rId = s.routines[0].id;
    s = reducer(s, { type: 'OPEN_ROUTINE', id: rId });
    expect(s.screen).toBe('routine');
    expect(s.routineId).toBe(rId);

    const dId = s.routines[0].days[0].id;
    s = reducer(s, { type: 'OPEN_DAY', id: dId });
    expect(s.screen).toBe('day');

    s = reducer(s, { type: 'BACK' });
    expect(s.screen).toBe('routine');
    s = reducer(s, { type: 'BACK' });
    expect(s.screen).toBe('home');
  });
});

describe('unit toggle', () => {
  it('flips kg <-> lb and converts every weight', () => {
    let s = base();
    // set a known weight
    s = reducer(s, { type: 'OPEN_ROUTINE', id: s.routines[0].id });
    s = reducer(s, { type: 'OPEN_DAY', id: s.routines[0].days[0].id });
    const ex = s.routines[0].days[0].exercises[0];
    s = reducer(s, { type: 'SET_WEIGHT', exId: ex.id, wkId: ex.weeks[0].id, value: '100' });

    s = reducer(s, { type: 'TOGGLE_UNIT' });
    expect(s.unit).toBe('lb');
    expect(s.routines[0].days[0].exercises[0].weeks[0].weight).toBeCloseTo(220.5, 0);

    s = reducer(s, { type: 'TOGGLE_UNIT' });
    expect(s.unit).toBe('kg');
    expect(s.routines[0].days[0].exercises[0].weeks[0].weight).toBeCloseTo(100, 0);
  });
});

describe('confirm + delete', () => {
  it('requires confirmation and then deletes', () => {
    let s = base();
    const r = s.routines[0];
    s = reducer(s, { type: 'REQUEST_DELETE', kind: 'routine', id: r.id, name: r.name });
    expect(s.confirm?.id).toBe(r.id);
    // nothing deleted yet
    expect(s.routines).toHaveLength(1);
    s = reducer(s, { type: 'CONFIRM_DELETE' });
    expect(s.routines).toHaveLength(0);
    expect(s.confirm).toBeNull();
  });

  it('cancel keeps the data', () => {
    let s = base();
    s = reducer(s, { type: 'REQUEST_DELETE', kind: 'routine', id: s.routines[0].id, name: 'x' });
    s = reducer(s, { type: 'CANCEL_DELETE' });
    expect(s.confirm).toBeNull();
    expect(s.routines).toHaveLength(1);
  });
});

describe('duplicate', () => {
  it('duplicates a routine right after the original with a new id', () => {
    let s = base();
    const orig = s.routines[0];
    s = reducer(s, { type: 'DUPLICATE_ROUTINE', id: orig.id });
    expect(s.routines).toHaveLength(2);
    expect(s.routines[1].id).not.toBe(orig.id);
    expect(s.routines[1].name).toBe(orig.name + ' (copia)');
    // deep copy: different day ids
    expect(s.routines[1].days[0].id).not.toBe(orig.days[0].id);
    // checkmarks reset in the copy
    const copied = s.routines[1].days[0].exercises[0].weeks[0].doneSets;
    expect(copied.every((d) => d === false)).toBe(true);
  });

  it('duplicates a day within the current routine', () => {
    let s = base();
    s = reducer(s, { type: 'OPEN_ROUTINE', id: s.routines[0].id });
    const before = s.routines[0].days.length;
    s = reducer(s, { type: 'DUPLICATE_DAY', id: s.routines[0].days[0].id });
    expect(s.routines[0].days).toHaveLength(before + 1);
    expect(s.routines[0].days[1].name).toContain('(copia)');
  });
});

describe('reorder days', () => {
  it('moves a day to another position (drag and drop) and is a no-op on same id', () => {
    let s = base();
    s = reducer(s, { type: 'OPEN_ROUTINE', id: s.routines[0].id });
    const [a, b, c] = s.routines[0].days.map((d) => d.id);

    // drag the first day onto the third position
    s = reducer(s, { type: 'REORDER_DAY', activeId: a, overId: c });
    expect(s.routines[0].days.map((d) => d.id)).toEqual([b, c, a]);

    // drag it back to the front
    s = reducer(s, { type: 'REORDER_DAY', activeId: a, overId: b });
    expect(s.routines[0].days.map((d) => d.id)).toEqual([a, b, c]);

    // dropping onto itself changes nothing
    const order = s.routines[0].days.map((d) => d.id);
    s = reducer(s, { type: 'REORDER_DAY', activeId: a, overId: a });
    expect(s.routines[0].days.map((d) => d.id)).toEqual(order);
  });
});

describe('suggested exercises', () => {
  it('adds a suggested exercise to the current day with defaults', () => {
    let s = base();
    s = reducer(s, { type: 'OPEN_ROUTINE', id: s.routines[0].id });
    s = reducer(s, { type: 'OPEN_DAY', id: s.routines[0].days[0].id });
    const before = s.routines[0].days[0].exercises.length;

    s = reducer(s, { type: 'ADD_SUGGESTED_EXERCISE', name: 'Remo en T' });
    const list = s.routines[0].days[0].exercises;
    expect(list).toHaveLength(before + 1);
    const ex = list[list.length - 1];
    expect(ex.name).toBe('Remo en T');
    expect(ex.sets).toBe(4);
    expect(ex.weeks).toHaveLength(1);
    expect(ex.weeks[0].doneSets).toHaveLength(4);
    expect(ex.videoUrl).toContain('youtube.com/results');
  });
});

describe('supersets / biseries', () => {
  it('links two adjacent exercises into a shared group and unlinks them', () => {
    let s = base();
    s = reducer(s, { type: 'OPEN_ROUTINE', id: s.routines[0].id });
    s = reducer(s, { type: 'OPEN_DAY', id: s.routines[0].days[0].id });
    const exs = s.routines[0].days[0].exercises;
    expect(exs.length).toBeGreaterThanOrEqual(2);
    const [a, b] = exs;

    s = reducer(s, { type: 'LINK_SUPERSET', exId: a.id });
    let list = s.routines[0].days[0].exercises;
    expect(list[0].supersetId).toBeTruthy();
    expect(list[0].supersetId).toBe(list[1].supersetId);

    // unlinking one leaves a single member -> group dissolves
    s = reducer(s, { type: 'UNLINK_SUPERSET', exId: b.id });
    list = s.routines[0].days[0].exercises;
    expect(list[0].supersetId).toBeUndefined();
    expect(list[1].supersetId).toBeUndefined();
  });

  it('does nothing when linking the last exercise (no next)', () => {
    let s = base();
    s = reducer(s, { type: 'OPEN_ROUTINE', id: s.routines[0].id });
    s = reducer(s, { type: 'OPEN_DAY', id: s.routines[0].days[0].id });
    const exs = s.routines[0].days[0].exercises;
    const last = exs[exs.length - 1];
    s = reducer(s, { type: 'LINK_SUPERSET', exId: last.id });
    const updated = s.routines[0].days[0].exercises;
    expect(updated[updated.length - 1].supersetId).toBeUndefined();
  });
});

describe('day sessions', () => {
  it('starts, records and clears an active session', () => {
    let s = base();
    s = reducer(s, { type: 'OPEN_ROUTINE', id: s.routines[0].id });
    const r = s.routines[0];

    s = reducer(s, { type: 'START_SESSION', routineId: r.id, routineName: r.name });
    expect(s.active).not.toBeNull();
    expect(s.active?.routineId).toBe(r.id);
    expect(s.sessions).toHaveLength(0);

    // a second start is ignored while one is active
    const prevStart = s.active?.startedAt;
    s = reducer(s, { type: 'START_SESSION', routineId: r.id, routineName: r.name });
    expect(s.active?.startedAt).toBe(prevStart);

    // finishing asks for confirmation first, then records on confirm
    s = reducer(s, { type: 'REQUEST_FINISH_SESSION' });
    expect(s.finishConfirmOpen).toBe(true);
    s = reducer(s, { type: 'CANCEL_FINISH_SESSION' });
    expect(s.finishConfirmOpen).toBe(false);
    expect(s.active).not.toBeNull();

    s = reducer(s, { type: 'FINISH_SESSION' });
    expect(s.active).toBeNull();
    expect(s.finishConfirmOpen).toBe(false);
    expect(s.sessions).toHaveLength(1);
    expect(s.sessions[0].routineId).toBe(r.id);
    expect(s.sessions[0].endedAt).toBeGreaterThanOrEqual(s.sessions[0].startedAt);
  });

  it('cancels an active session without recording it', () => {
    let s = base();
    const r = s.routines[0];
    s = reducer(s, { type: 'START_SESSION', routineId: r.id, routineName: r.name });
    s = reducer(s, { type: 'CANCEL_SESSION' });
    expect(s.active).toBeNull();
    expect(s.sessions).toHaveLength(0);
  });
});

describe('import', () => {
  it('replaces data and resets navigation', () => {
    let s = base();
    s = reducer(s, { type: 'OPEN_ROUTINE', id: s.routines[0].id });
    const imported = [{ id: 'r1', name: 'Importada', days: [] }];
    s = reducer(s, { type: 'IMPORT_DATA', routines: imported, unit: 'lb', sessions: [] });
    expect(s.routines).toEqual(imported);
    expect(s.unit).toBe('lb');
    expect(s.screen).toBe('home');
    expect(s.routineId).toBeNull();
  });
});

describe('sets and weights', () => {
  it('toggles a set and updates a weight without mutating the previous state', () => {
    let s = base();
    s = reducer(s, { type: 'OPEN_ROUTINE', id: s.routines[0].id });
    s = reducer(s, { type: 'OPEN_DAY', id: s.routines[0].days[0].id });
    const ex = s.routines[0].days[0].exercises[0];
    const wk = ex.weeks[0];

    const prev = s;
    s = reducer(s, { type: 'TOGGLE_SET', exId: ex.id, wkId: wk.id, idx: 0 });
    expect(s.routines[0].days[0].exercises[0].weeks[0].doneSets[0]).toBe(true);
    // immutability: previous state untouched
    expect(prev.routines[0].days[0].exercises[0].weeks[0].doneSets[0]).toBe(false);

    s = reducer(s, { type: 'SET_WEIGHT', exId: ex.id, wkId: wk.id, value: '72.5' });
    expect(s.routines[0].days[0].exercises[0].weeks[0].weight).toBe(72.5);

    s = reducer(s, { type: 'SET_WEIGHT', exId: ex.id, wkId: wk.id, value: 'abc' });
    expect(s.routines[0].days[0].exercises[0].weeks[0].weight).toBe(0);
  });
});

describe('modal save', () => {
  it('adds a new routine', () => {
    let s = base();
    s = reducer(s, { type: 'OPEN_MODAL', modal: { type: 'routine', name: 'Hipertrofia' } });
    s = reducer(s, { type: 'SAVE_MODAL' });
    expect(s.routines).toHaveLength(2);
    expect(s.routines[1].name).toBe('Hipertrofia');
    expect(s.modal).toBeNull();
  });

  it('falls back to a default name when empty', () => {
    let s = base();
    s = reducer(s, { type: 'OPEN_MODAL', modal: { type: 'routine', name: '   ' } });
    s = reducer(s, { type: 'SAVE_MODAL' });
    expect(s.routines[1].name).toBe('Rutina nueva');
  });

  it('adds a new exercise starting with a single week', () => {
    let s = base();
    s = reducer(s, { type: 'OPEN_ROUTINE', id: s.routines[0].id });
    s = reducer(s, { type: 'OPEN_DAY', id: s.routines[0].days[0].id });
    const before = s.routines[0].days[0].exercises.length;
    s = reducer(s, {
      type: 'OPEN_MODAL',
      modal: {
        type: 'exercise',
        name: 'Fondos',
        sets: 3,
        reps: '8',
        rest: 75,
      },
    });
    s = reducer(s, { type: 'SAVE_MODAL' });
    const list = s.routines[0].days[0].exercises;
    expect(list).toHaveLength(before + 1);
    const ex = list[list.length - 1];
    expect(ex.name).toBe('Fondos');
    expect(ex.weeks).toHaveLength(1);
    expect(ex.weeks[0].label).toBe('Sem 1');
    expect(ex.weeks[0].doneSets).toHaveLength(3);
    // videoUrl derived automatically from the name (YouTube search)
    expect(ex.videoUrl).toContain('youtube.com/results');
    expect(ex.videoUrl).toContain('Fondos');
  });

  it('edits an exercise keeping its weeks and resizing each doneSets to the new set count', () => {
    let s = base();
    s = reducer(s, { type: 'OPEN_ROUTINE', id: s.routines[0].id });
    s = reducer(s, { type: 'OPEN_DAY', id: s.routines[0].days[0].id });
    const ex = s.routines[0].days[0].exercises[0];
    const weekCount = ex.weeks.length;
    // set a weight then mark one set done
    s = reducer(s, { type: 'SET_WEIGHT', exId: ex.id, wkId: ex.weeks[0].id, value: '80' });
    s = reducer(s, { type: 'TOGGLE_SET', exId: ex.id, wkId: ex.weeks[0].id, idx: 0 });

    s = reducer(s, {
      type: 'OPEN_MODAL',
      modal: {
        type: 'exercise',
        id: ex.id,
        name: 'Press inclinado',
        sets: 2,
        reps: ex.reps,
        rest: ex.restSeconds,
      },
    });
    s = reducer(s, { type: 'SAVE_MODAL' });
    const updated = s.routines[0].days[0].exercises[0];
    expect(updated.name).toBe('Press inclinado');
    // weeks preserved, not rebuilt by count
    expect(updated.weeks).toHaveLength(weekCount);
    expect(updated.weeks[0].doneSets).toHaveLength(2);
    // weight preserved on the first week
    expect(updated.weeks[0].weight).toBe(80);
    // the done flag preserved (sliced to new set count)
    expect(updated.weeks[0].doneSets[0]).toBe(true);
  });
});

describe('manual weeks', () => {
  it('adds a week prefilled with the last week weight and relabels', () => {
    let s = base();
    s = reducer(s, { type: 'OPEN_ROUTINE', id: s.routines[0].id });
    s = reducer(s, { type: 'OPEN_DAY', id: s.routines[0].days[0].id });
    const ex = s.routines[0].days[0].exercises[0];
    const count = ex.weeks.length;
    s = reducer(s, { type: 'SET_WEIGHT', exId: ex.id, wkId: ex.weeks[count - 1].id, value: '95' });

    s = reducer(s, { type: 'ADD_WEEK', exId: ex.id });
    const updated = s.routines[0].days[0].exercises[0];
    expect(updated.weeks).toHaveLength(count + 1);
    const added = updated.weeks[updated.weeks.length - 1];
    expect(added.label).toBe('Sem ' + (count + 1));
    expect(added.weight).toBe(95);
    expect(added.doneSets).toHaveLength(updated.sets);
  });

  it('deletes a week and relabels the rest', () => {
    let s = base();
    s = reducer(s, { type: 'OPEN_ROUTINE', id: s.routines[0].id });
    s = reducer(s, { type: 'OPEN_DAY', id: s.routines[0].days[0].id });
    const ex = s.routines[0].days[0].exercises[0];
    const count = ex.weeks.length;

    s = reducer(s, { type: 'DELETE_WEEK', exId: ex.id, wkId: ex.weeks[0].id });
    const updated = s.routines[0].days[0].exercises[0];
    expect(updated.weeks).toHaveLength(count - 1);
    expect(updated.weeks[0].label).toBe('Sem 1');
    expect(updated.weeks[updated.weeks.length - 1].label).toBe('Sem ' + (count - 1));
  });
});

describe('progress chart', () => {
  it('opens and closes the chart, and clears it when navigating', () => {
    let s = base();
    s = reducer(s, { type: 'OPEN_ROUTINE', id: s.routines[0].id });
    s = reducer(s, { type: 'OPEN_DAY', id: s.routines[0].days[0].id });
    const exId = s.routines[0].days[0].exercises[0].id;
    s = reducer(s, { type: 'OPEN_CHART', id: exId });
    expect(s.chartExId).toBe(exId);
    s = reducer(s, { type: 'CLOSE_CHART' });
    expect(s.chartExId).toBeNull();

    s = reducer(s, { type: 'OPEN_CHART', id: exId });
    s = reducer(s, { type: 'BACK' }); // leaving the day clears the chart
    expect(s.chartExId).toBeNull();
  });

  it('clears the chart when the charted exercise is deleted', () => {
    let s = base();
    s = reducer(s, { type: 'OPEN_ROUTINE', id: s.routines[0].id });
    s = reducer(s, { type: 'OPEN_DAY', id: s.routines[0].days[0].id });
    const exId = s.routines[0].days[0].exercises[0].id;
    s = reducer(s, { type: 'OPEN_CHART', id: exId });
    s = reducer(s, { type: 'DELETE_EXERCISE', id: exId });
    expect(s.chartExId).toBeNull();
  });
});

describe('deletion', () => {
  it('deletes a routine', () => {
    let s = base();
    s = reducer(s, { type: 'DELETE_ROUTINE', id: s.routines[0].id });
    expect(s.routines).toHaveLength(0);
  });

  it('deletes a day and an exercise within the current routine/day', () => {
    let s = base();
    const rId = s.routines[0].id;
    s = reducer(s, { type: 'OPEN_ROUTINE', id: rId });
    const dId = s.routines[0].days[0].id;
    s = reducer(s, { type: 'OPEN_DAY', id: dId });

    const exId = s.routines[0].days[0].exercises[0].id;
    s = reducer(s, { type: 'DELETE_EXERCISE', id: exId });
    expect(s.routines[0].days[0].exercises.find((e) => e.id === exId)).toBeUndefined();

    s = reducer(s, { type: 'DELETE_DAY', id: dId });
    expect(s.routines[0].days.find((d) => d.id === dId)).toBeUndefined();
  });
});
