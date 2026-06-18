import { describe, expect, it } from 'vitest';
import { reducer } from './gymReducer';
import type { GymState } from './gymReducer';
import { seed } from '../lib/seed';

function base(): GymState {
  return {
    routines: seed(),
    unit: 'kg',
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
    expect(ex.weeks).toHaveLength(4);
    expect(ex.weeks[0].doneSets).toHaveLength(4);
    expect(ex.videoUrl).toContain('youtube.com/results');
  });
});

describe('import', () => {
  it('replaces data and resets navigation', () => {
    let s = base();
    s = reducer(s, { type: 'OPEN_ROUTINE', id: s.routines[0].id });
    const imported = [{ id: 'r1', name: 'Importada', days: [] }];
    s = reducer(s, { type: 'IMPORT_DATA', routines: imported, unit: 'lb' });
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

  it('adds an exercise with the right number of weeks and sets', () => {
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
        weeks: 5,
      },
    });
    s = reducer(s, { type: 'SAVE_MODAL' });
    const list = s.routines[0].days[0].exercises;
    expect(list).toHaveLength(before + 1);
    const ex = list[list.length - 1];
    expect(ex.name).toBe('Fondos');
    expect(ex.weeks).toHaveLength(5);
    expect(ex.weeks[0].doneSets).toHaveLength(3);
    // videoUrl derived automatically from the name (YouTube search)
    expect(ex.videoUrl).toContain('youtube.com/results');
    expect(ex.videoUrl).toContain('Fondos');
  });

  it('edits an exercise and resizes its weeks/sets preserving prior weights', () => {
    let s = base();
    s = reducer(s, { type: 'OPEN_ROUTINE', id: s.routines[0].id });
    s = reducer(s, { type: 'OPEN_DAY', id: s.routines[0].days[0].id });
    const ex = s.routines[0].days[0].exercises[0];
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
        weeks: 2,
      },
    });
    s = reducer(s, { type: 'SAVE_MODAL' });
    const updated = s.routines[0].days[0].exercises[0];
    expect(updated.name).toBe('Press inclinado');
    expect(updated.weeks).toHaveLength(2);
    expect(updated.weeks[0].doneSets).toHaveLength(2);
    // weight preserved on the kept first week
    expect(updated.weeks[0].weight).toBe(80);
    // the done flag preserved (sliced to new set count)
    expect(updated.weeks[0].doneSets[0]).toBe(true);
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
