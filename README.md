# Rutinas Gym

App para gestionar rutinas de gimnasio: rutinas → días → ejercicios, con seguimiento
de carga por semana, marcado de series, temporizador de descanso, enlaces a videos
guía y cambio de unidad kg/lb. Los datos se guardan en `localStorage`.

Migrada desde el prototipo de Claude Design (`prototype/Rutinas Gym.dc.html`) a
**React + Vite + TypeScript + Tailwind CSS v4**.

## Requisitos

- Node.js 18+

## Comandos

```bash
npm install        # instalar dependencias
npm run dev        # servidor de desarrollo (http://localhost:5173)
npm run build      # build de producción en dist/
npm run preview    # previsualizar el build
npm run typecheck  # comprobar tipos (tsc --noEmit)
npm run lint       # ESLint
npm run format     # formatear con Prettier
npm test           # tests unitarios (vitest)
npm run icons      # regenerar iconos PWA
```

Hay un workflow de CI en `.github/workflows/ci.yml` que corre typecheck, lint,
format:check, tests y build en cada push/PR.

## Estructura

```
src/
  main.tsx              punto de entrada
  App.tsx               shell + selector de pantalla
  types.ts              modelos de datos
  index.css             Tailwind + tokens de diseño
  lib/
    id.ts               generador de ids
    seed.ts             datos de ejemplo
    storage.ts          persistencia en localStorage
    format.ts           tiempo, anillo del timer, beep, abrir/buscar video
    palette.ts          colores de acento por categoría
    suggestions.ts      ejercicios sugeridos por categoría del día
  state/
    gymReducer.ts       estado + reducer (immer)
    useRestTimer.ts     hook del temporizador de descanso
    GymContext.tsx      provider + acciones + selectores
  components/
    Header, Fab, Modal, RestTimer, ExerciseCard, common
    screens/            Home, Routine, Day
```

## PWA (instalable + offline)

La app es una **PWA**: se puede instalar en el teléfono/escritorio y funciona sin
conexión. El service worker (vía `vite-plugin-pwa`) precachea el app shell.

- El service worker **solo se activa en el build de producción**, no en `npm run dev`.
- Para probar la instalación: `npm run build && npm run preview` y abre la URL local;
  el navegador mostrará el botón "Instalar".
- Iconos en `public/` generados con `npm run icons` (fuente en `scripts/gen-icons.mjs`).

## Ejercicios y video guía

Al crear un ejercicio escribes su *Nombre* como texto libre. El **enlace de guía es
interno**: se genera automáticamente como una búsqueda de YouTube a partir del nombre
(`youtubeSearch()` en `src/lib/format.ts`), sin caja de URL visible. El botón ▶ de cada
ejercicio abre esa búsqueda.

**Sugerencias por día**: dentro de un día se muestran chips de ejercicios sugeridos según
la categoría detectada en su *nombre* (Push, Pull, Legs, Pecho, Espalda, Hombro, Bíceps,
Tríceps, Cuádriceps, Glúteo). Un día combinado (ej. `Pecho/Bícep`) une las listas. Al tocar
una chip se agrega el ejercicio al instante con valores por defecto (editable luego). La
lógica y la lista curada están en `src/lib/suggestions.ts`.

## Funciones

- Rutinas → días → ejercicios, con carga por semana y marcado de series.
- **Placeholders por tipo de card** (rutina / día / ejercicio), cada uno con su ejemplo.
- **Presets de día** (Push, Pull, Legs, Pecho/Bícep…) como chips al crear un día, con
  texto libre para combinaciones propias (ej. `Espalda/Hombro/Cuádriceps`).
- **Video guía interno**: se deriva del nombre del ejercicio; el botón ▶ abre la búsqueda
  en YouTube (sin caja de URL).
- **Sugerencias de ejercicios por día**: chips según la categoría del nombre del día; un
  toque agrega el ejercicio con valores por defecto.
- **Confirmación al borrar** (rutina/día/ejercicio).
- **Duplicar** rutina o día (botón con icono de copia).
- **Reordenar días** con **drag & drop** táctil (asa ⠿, vía `@dnd-kit`).
- **Acento por categoría**: cada rutina/día toma un tono de la paleta, con hover animado
  y feedback al pulsar.
- **Export / Import** de datos en JSON (menú ••• → Datos), con saneo de archivos.
- **Conversión real kg ↔ lb** (convierte todos los pesos al cambiar de unidad).
- **Temporizador de descanso** con minimizar (sigue en segundo plano, chip en la
  cabecera), vibración al terminar, presets y ±15s.
- **Gráficas de progreso** + **1RM estimado (Epley)** y PR por ejercicio.
- **PWA** instalable y offline.
- **Accesibilidad**: diálogos con `role="dialog"`, cierre con `Esc`, focus-trap y
  restauración de foco, `aria-label` en botones de icono.

## Roadmap (siguientes mejoras sugeridas)

- Sesiones con fecha real (progreso temporal, no por índice de semana).
- Sincronización en la nube (Supabase) con cuentas.
- Tests de componentes (React Testing Library).

El prototipo original se conserva en `prototype/` como referencia visual.


## Cambios recientes

Las observaciones pendientes ya están implementadas (ver **Funciones**):

1. **Placeholders por tipo de card** — rutina, día y ejercicio tienen su propio ejemplo
   en el campo *Nombre* (antes se compartía uno solo).
2. **Presets de día** — al crear un día aparecen chips (Push, Pull, Legs, Pecho/Bícep…)
   que rellenan el nombre, manteniendo el texto libre para combinaciones propias.
3. **Video guía interno** — se quitó la caja de URL; el enlace se genera automáticamente
   desde el nombre del ejercicio y el botón ▶ abre la búsqueda en YouTube.
4. **Reordenar días** — con drag & drop táctil (asa ⠿) en lugar de flechas.
5. **Paleta con acento por categoría** — colores extra (azul/violeta/verde), hover
   animado y feedback de tono al pulsar rutina/día.
6. **Sugerencias de ejercicios por día** — dentro de un día se muestran chips de
   ejercicios acordes a la categoría de su nombre (une categorías en días combinados);
   un toque agrega el ejercicio. Se mantiene el texto libre y las chips de nombre.

Además se **eliminó el buscador de ejercicios** (free-exercise-db): se borraron
`public/exercises.json` (~1.2 MB) y los módulos `exerciseDb`, `useExerciseSearch` y
`ExerciseSearchInput`. El campo *Nombre* del ejercicio pasó a ser texto libre y el
precache de la PWA bajó de ~1.3 MB a ~0.3 MB.

## Observaciones

- ✅ **Sugerencias de ejercicios por día** (implementado, ver **Cambios recientes** y
  **Ejercicios y video guía**). Decisiones tomadas: se **mantiene** el texto libre y las
  chips de nombre del día; las sugerencias son **aditivas** y se basan en la categoría
  detectada en el nombre del día, no en reemplazar la entrada manual.


