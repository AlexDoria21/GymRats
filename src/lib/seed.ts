import { uid } from './id';
import type { Exercise, Routine } from '../types';

function mk(
  name: string,
  sets: number,
  reps: string,
  rest: number,
  w0: number,
  step: number,
  q: string
): Exercise {
  return {
    id: uid(),
    name,
    sets,
    reps,
    restSeconds: rest,
    videoUrl: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q),
    weeks: [1, 2, 3, 4].map((n) => ({
      id: uid(),
      label: 'Sem ' + n,
      weight: +(w0 + step * (n - 1)).toFixed(1),
      doneSets: new Array(sets).fill(false),
    })),
  };
}

export function seed(): Routine[] {
  return [
    {
      id: uid(),
      name: 'Rutina Mes 1',
      days: [
        {
          id: uid(),
          name: 'Push · Pecho/Hombro/Tríceps',
          exercises: [
            mk('Press de banca', 4, '8-10', 120, 60, 2.5, 'press de banca tecnica'),
            mk('Press militar con barra', 4, '8-10', 120, 35, 2.5, 'press militar con barra'),
            mk('Elevaciones laterales', 4, '12-15', 45, 8, 1, 'elevaciones laterales mancuerna'),
            mk('Extensión de tríceps en polea', 3, '10-12', 60, 25, 2.5, 'extension triceps polea'),
          ],
        },
        {
          id: uid(),
          name: 'Pull · Espalda/Bíceps',
          exercises: [
            mk('Dominadas', 4, '6-10', 120, 0, 2.5, 'dominadas tecnica'),
            mk('Remo con barra', 4, '8-10', 90, 50, 2.5, 'remo con barra'),
            mk('Jalón al pecho', 3, '10-12', 75, 45, 2.5, 'jalon al pecho'),
            mk('Curl de bíceps con barra', 3, '10-12', 60, 25, 2.5, 'curl de biceps con barra'),
          ],
        },
        {
          id: uid(),
          name: 'Legs · Piernas',
          exercises: [
            mk('Sentadilla', 4, '6-8', 150, 70, 5, 'sentadilla tecnica'),
            mk('Prensa de pierna', 4, '10-12', 90, 120, 10, 'prensa de pierna'),
            mk('Peso muerto rumano', 3, '8-10', 120, 60, 5, 'peso muerto rumano'),
            mk('Elevación de gemelos', 4, '15-20', 45, 40, 5, 'elevacion de gemelos'),
          ],
        },
      ],
    },
  ];
}
