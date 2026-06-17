/**
 * Buscador sobre free-exercise-db (https://github.com/yuhonas/free-exercise-db).
 * La base está en inglés; añadimos etiquetas y sinónimos en español para que
 * búsquedas como "pecho", "sentadilla" o "press banca" funcionen.
 */

export interface DbExercise {
  id: string;
  name: string;
  force: string | null;
  level: string;
  mechanic: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
  images: string[];
}

interface Indexed {
  ex: DbExercise;
  name: string; // normalized name
  prim: string; // normalized primary muscles (EN + ES)
  hay: string; // normalized haystack (name + muscles ES/EN + equipment)
}

const MUSCLE_ES: Record<string, string> = {
  abdominals: 'abdominales',
  hamstrings: 'femorales isquiotibiales',
  adductors: 'aductores',
  quadriceps: 'cuadriceps',
  biceps: 'biceps',
  shoulders: 'hombros',
  chest: 'pecho pectoral',
  'middle back': 'espalda media',
  calves: 'gemelos pantorrillas',
  glutes: 'gluteos',
  'lower back': 'espalda baja lumbar',
  lats: 'dorsales',
  triceps: 'triceps',
  traps: 'trapecios',
  forearms: 'antebrazos',
  neck: 'cuello',
  abductors: 'abductores',
};

const EQUIP_ES: Record<string, string> = {
  'body only': 'peso corporal',
  machine: 'maquina',
  other: 'otro',
  'foam roll': 'foam roller rodillo',
  kettlebells: 'kettlebell pesa rusa',
  dumbbell: 'mancuerna',
  cable: 'polea cable',
  barbell: 'barra',
  bands: 'bandas elasticas',
  'medicine ball': 'balon medicinal',
  'exercise ball': 'fitball pelota',
  'e-z curl bar': 'barra z',
};

// Frases en español -> términos en inglés que aparecen en los nombres.
const SYN_PHRASES: Array<[string, string]> = [
  ['press de banca', 'bench press'],
  ['press banca', 'bench press'],
  ['press militar', 'overhead press'],
  ['peso muerto rumano', 'romanian deadlift'],
  ['peso muerto', 'deadlift'],
  ['elevaciones laterales', 'lateral raise'],
  ['elevacion lateral', 'lateral raise'],
  ['curl de biceps', 'curl'],
  ['extension de triceps', 'triceps extension'],
  ['prensa de pierna', 'leg press'],
  ['jalon al pecho', 'pulldown'],
];

// Palabra en español -> raíz en inglés (substring del nombre).
const SYN_WORDS: Record<string, string> = {
  sentadilla: 'squat',
  sentadillas: 'squat',
  dominada: 'pull',
  dominadas: 'pull',
  remo: 'row',
  jalon: 'pulldown',
  zancada: 'lunge',
  zancadas: 'lunge',
  plancha: 'plank',
  fondos: 'dip',
  prensa: 'press',
  curl: 'curl',
  flexiones: 'push up',
  flexion: 'push up',
};

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function buildIndex(list: DbExercise[]): Indexed[] {
  return list.map((ex) => {
    const primEs = ex.primaryMuscles.map((m) => MUSCLE_ES[m] ?? '').join(' ');
    const secEs = ex.secondaryMuscles.map((m) => MUSCLE_ES[m] ?? '').join(' ');
    const equipEs = ex.equipment ? (EQUIP_ES[ex.equipment] ?? '') : '';
    const prim = norm([ex.primaryMuscles.join(' '), primEs].join(' '));
    const hay = norm(
      [ex.name, prim, ex.secondaryMuscles.join(' '), secEs, ex.equipment ?? '', equipEs].join(' ')
    );
    return { ex, name: norm(ex.name), prim, hay };
  });
}

function expandQuery(query: string): string[][] {
  let n = norm(query);
  for (const [es, en] of SYN_PHRASES) {
    if (n.includes(es)) n = n.split(es).join(' ' + en + ' ');
  }
  n = norm(n);
  const tokens = n.split(' ').filter((t) => t.length >= 2);
  // Each token becomes a group [token, synonym?]; a group matches if ANY member is found.
  return tokens.map((t) => (SYN_WORDS[t] ? [t, SYN_WORDS[t]] : [t]));
}

export function searchIndex(index: Indexed[], query: string, limit = 8): DbExercise[] {
  const groups = expandQuery(query);
  if (groups.length === 0) return [];

  const scored: Array<{ ex: DbExercise; score: number }> = [];
  for (const item of index) {
    let ok = true;
    let score = 0;
    for (let g = 0; g < groups.length; g++) {
      const members = groups[g];
      const inName = members.some((m) => item.name.includes(m));
      const inPrim = members.some((m) => item.prim.includes(m));
      const inHay = inName || inPrim || members.some((m) => item.hay.includes(m));
      if (!inHay) {
        ok = false;
        break;
      }
      score += inName ? 2 : inPrim ? 1.5 : 1;
      if (g === 0 && members.some((m) => item.name.startsWith(m))) score += 3;
    }
    if (ok) {
      score -= item.name.length * 0.01; // prefer shorter / more exact names
      scored.push({ ex: item.ex, score });
    }
  }

  scored.sort((a, b) => b.score - a.score || a.ex.name.localeCompare(b.ex.name));
  return scored.slice(0, limit).map((s) => s.ex);
}

export function muscleEs(m: string): string {
  const es = MUSCLE_ES[m];
  if (!es) return m;
  // first word, capitalized
  const first = es.split(' ')[0];
  return first.charAt(0).toUpperCase() + first.slice(1);
}

export function primaryMuscleLabel(ex: DbExercise): string {
  return ex.primaryMuscles.length ? muscleEs(ex.primaryMuscles[0]) : '';
}

export function equipmentLabel(ex: DbExercise): string {
  if (!ex.equipment) return '';
  const es = EQUIP_ES[ex.equipment];
  if (!es) return ex.equipment;
  const first = es.split(' ')[0];
  return first.charAt(0).toUpperCase() + first.slice(1);
}

export function imageUrl(ex: DbExercise): string | null {
  if (!ex.images?.length) return null;
  return (
    'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/' + encodeURI(ex.images[0])
  );
}

export function youtubeSearch(name: string): string {
  return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(name + ' tecnica');
}

// --- async loader with module-level cache ---
let indexPromise: Promise<Indexed[]> | null = null;

export function loadIndex(): Promise<Indexed[]> {
  if (!indexPromise) {
    indexPromise = fetch(import.meta.env.BASE_URL + 'exercises.json')
      .then((r) => r.json() as Promise<DbExercise[]>)
      .then(buildIndex)
      .catch((err) => {
        indexPromise = null; // allow retry
        throw err;
      });
  }
  return indexPromise;
}

export async function searchExercises(query: string, limit = 8): Promise<DbExercise[]> {
  const index = await loadIndex();
  return searchIndex(index, query, limit);
}
