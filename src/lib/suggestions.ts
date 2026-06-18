/**
 * Sugerencias de ejercicios por categoría, derivadas del nombre del día.
 * Lista curada y pequeña en español (no usa ninguna base externa).
 */

/** minúsculas + sin acentos + solo alfanumérico/espacios */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const CATEGORY_EXERCISES: Record<string, string[]> = {
  push: [
    'Press de banca',
    'Press inclinado con mancuerna',
    'Press militar con barra',
    'Fondos en paralelas',
    'Extensión de tríceps en polea',
    'Elevaciones laterales',
  ],
  pull: [
    'Dominadas',
    'Jalón al pecho',
    'Remo con barra',
    'Remo en polea',
    'Curl de bíceps con barra',
    'Face pull',
  ],
  legs: [
    'Sentadilla',
    'Prensa de pierna',
    'Peso muerto rumano',
    'Zancadas',
    'Extensión de cuádriceps',
    'Curl femoral',
    'Elevación de gemelos',
  ],
  pecho: [
    'Press de banca',
    'Press inclinado con mancuerna',
    'Aperturas en peck deck',
    'Fondos en paralelas',
    'Cruce de poleas',
  ],
  espalda: [
    'Jalón al pecho',
    'Remo en T',
    'Remo en polea',
    'Dominadas',
    'Remo con barra',
    'Pull-over con mancuerna',
  ],
  hombro: [
    'Press militar con barra',
    'Elevaciones laterales',
    'Elevaciones frontales',
    'Pájaros (deltoide posterior)',
    'Face pull',
  ],
  biceps: [
    'Curl de bíceps con barra',
    'Curl con mancuernas',
    'Curl martillo',
    'Curl en banco predicador',
  ],
  triceps: [
    'Extensión de tríceps en polea alta',
    'Rompecráneos con barra Z',
    'Fondos en banco',
    'Press francés',
  ],
  cuadriceps: [
    'Sentadilla',
    'Prensa de pierna',
    'Extensión de cuádriceps',
    'Zancadas',
    'Hack squat',
  ],
  gluteo: ['Hip thrust', 'Peso muerto rumano', 'Sentadilla búlgara', 'Patada de glúteo en polea'],
};

/** Palabras (normalizadas) en el nombre del día -> categoría. */
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  push: ['push', 'empuje'],
  pull: ['pull', 'tiron'],
  legs: ['legs', 'pierna', 'piernas'],
  pecho: ['pecho', 'pectoral'],
  espalda: ['espalda', 'dorsal', 'dorsales'],
  hombro: ['hombro', 'hombros', 'deltoide', 'deltoides'],
  biceps: ['bicep', 'biceps'],
  triceps: ['tricep', 'triceps'],
  cuadriceps: ['cuadricep', 'cuadriceps', 'quad'],
  gluteo: ['gluteo', 'gluteos', 'gluteon'],
};

/**
 * Ejercicios sugeridos para un día según su nombre, excluyendo los que ya tiene.
 * Un nombre puede activar varias categorías (ej. "Pecho/Bícep").
 */
export function suggestForDay(dayName: string, existingNames: string[]): string[] {
  const hay = normalize(dayName);
  if (!hay) return [];

  const present = new Set(existingNames.map(normalize));
  const seen = new Set<string>();
  const out: string[] = [];

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (!keywords.some((k) => hay.includes(k))) continue;
    for (const name of CATEGORY_EXERCISES[category]) {
      const key = normalize(name);
      if (seen.has(key) || present.has(key)) continue;
      seen.add(key);
      out.push(name);
    }
  }
  return out;
}
