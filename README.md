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
    format.ts           tiempo, anillo del timer, beep, abrir video
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
conexión. El service worker (vía `vite-plugin-pwa`) precachea la app y la base de
ejercicios (`exercises.json`), y cachea las imágenes del CDN al verlas.

- El service worker **solo se activa en el build de producción**, no en `npm run dev`.
- Para probar la instalación: `npm run build && npm run preview` y abre la URL local;
  el navegador mostrará el botón "Instalar".
- Iconos en `public/` generados con `npm run icons` (fuente en `scripts/gen-icons.mjs`).

## Buscador de ejercicios

Al crear un ejercicio, el campo *Nombre* es un buscador sobre
[free-exercise-db](https://github.com/yuhonas/free-exercise-db) (873 ejercicios).
Acepta búsquedas en español (sinónimos de movimientos + etiquetas de músculo/equipo)
y, al elegir uno, rellena el nombre y el enlace de guía de YouTube. Los nombres de la
base vienen en inglés y quedan editables.

## Funciones

- Rutinas → días → ejercicios, con carga por semana y marcado de series.
- **Confirmación al borrar** (rutina/día/ejercicio).
- **Duplicar** rutina o día (botón con icono de copia).
- **Export / Import** de datos en JSON (menú ••• → Datos), con saneo de archivos.
- **Conversión real kg ↔ lb** (convierte todos los pesos al cambiar de unidad).
- **Temporizador de descanso** con minimizar (sigue en segundo plano, chip en la
  cabecera), vibración al terminar, presets y ±15s.
- **Gráficas de progreso** + **1RM estimado (Epley)** y PR por ejercicio.
- **Buscador de ejercicios** (free-exercise-db, 873 ejercicios, búsqueda en español).
- **PWA** instalable y offline.
- **Accesibilidad**: diálogos con `role="dialog"`, cierre con `Esc`, focus-trap y
  restauración de foco, `aria-label` en botones de icono.

## Roadmap (siguientes mejoras sugeridas)

- Sesiones con fecha real (progreso temporal, no por índice de semana).
- Sincronización en la nube (Supabase) con cuentas.
- Nombres de ejercicios en español nativo (API de wger).
- Tests de componentes (React Testing Library).

El prototipo original se conserva en `prototype/` como referencia visual.
