<div align="center">

# 🏋️ Gym Rats

**Gestiona tus rutinas de gimnasio: rutinas → días → ejercicios, con seguimiento de carga
por semana, temporizador de descanso, cronómetro de sesión, gráficas de progreso y más.**

Funciona como **web app**, **PWA instalable y offline** y **APK nativo de Android** — todo
desde el mismo código. Los datos viven en tu dispositivo (`localStorage`), sin servidor ni cuentas.

[![CI](https://github.com/AlexDoria21/GymRats/actions/workflows/ci.yml/badge.svg)](https://github.com/AlexDoria21/GymRats/actions/workflows/ci.yml)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor-8-119EFF?logo=capacitor&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-offline-5A0FC8?logo=pwa&logoColor=white)

</div>

---

## 📑 Tabla de contenidos

- [Capturas](#-capturas)
- [Funcionalidades](#-funcionalidades)
- [Stack tecnológico](#-stack-tecnológico)
- [Arquitectura](#-arquitectura)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Modelo de datos](#-modelo-de-datos)
- [Inicio rápido](#-inicio-rápido)
- [Scripts disponibles](#-scripts-disponibles)
- [PWA (instalable + offline)](#-pwa-instalable--offline)
- [APK de Android (Capacitor)](#-apk-de-android-capacitor)
- [Notificaciones](#-notificaciones)
- [Calidad y CI](#-calidad-y-ci)
- [Roadmap](#-roadmap)

---

## 📸 Capturas

> Las imágenes viven en [`screenshots/`](./screenshots). Añade las tuyas con estos nombres.

| Inicio | Día / Ejercicios | Progreso |
| :----: | :--------------: | :------: |
| ![Inicio](./screenshots/home.png) | ![Día](./screenshots/day.png) | ![Progreso](./screenshots/progress.png) |

---

## ✨ Funcionalidades

### Organización
- **Jerarquía Rutinas → Días → Ejercicios** con carga por semana y marcado de series.
- **Semanas manuales**: el ejercicio nace con 1 semana; se agregan/eliminan a mano conforme
  avanza la rutina (heredan la última carga registrada).
- **Presets de día** (Push, Pull, Legs, Pecho/Bícep…) como chips al crear un día, con texto
  libre para combinaciones propias (ej. `Espalda/Hombro/Cuádriceps`).
- **Placeholders contextuales** por tipo de card (rutina / día / ejercicio).
- **Duplicar** rutina o día con un toque.
- **Reordenar días** con **drag & drop táctil** (`@dnd-kit`).
- **Acento por categoría**: cada rutina/día toma un tono de la paleta con feedback al pulsar.
- **Confirmación al borrar** cualquier elemento.

### Entrenamiento
- **Temporizador de descanso** anclado a tiempo absoluto (sobrevive al *throttling* de
  segundo plano): minimizable, beep + vibración + notificación, presets y ±15 s.
- **Cronómetro de día/sesión**: botón **▶ Iniciar**, graba la sesión con fecha real al
  **Finalizar** (con confirmación) y programa un recordatorio push (~2:30 h).
- **Biseries / superseries**: une ejercicios adyacentes en un grupo visual.
- **Video guía interno**: se deriva del nombre del ejercicio (búsqueda de YouTube), sin
  caja de URL; el botón ▶ abre la búsqueda.
- **Sugerencias de ejercicios por día**: chips según la categoría detectada en el nombre del
  día; un toque agrega el ejercicio con valores por defecto.

### Datos y progreso
- **Calendario de actividad** mensual navegable que marca los días entrenados.
- **Gráficas de progreso** + **1RM estimado (fórmula de Epley)** y PR por ejercicio.
- **Conversión real kg ↔ lb** (convierte todos los pesos al cambiar de unidad).
- **Export / Import** de datos en JSON con saneo de archivos.
- **Persistencia local** con migración de esquema automática.

### Plataforma
- **PWA** instalable y 100% offline.
- **APK nativo de Android** vía Capacitor (la web viaja dentro del APK).
- **Accesibilidad**: diálogos con `role="dialog"`, cierre con `Esc`, focus-trap y
  restauración de foco, `aria-label` en botones de icono.

---

## 🧱 Stack tecnológico

| Capa | Tecnología | Uso |
| --- | --- | --- |
| **UI** | [React 18](https://react.dev) | Componentes funcionales + hooks |
| **Lenguaje** | [TypeScript 5](https://www.typescriptlang.org) | Tipado estricto en todo el código |
| **Build/Dev** | [Vite 6](https://vite.dev) | Dev server, HMR y bundle de producción |
| **Estilos** | [Tailwind CSS v4](https://tailwindcss.com) | Vía `@tailwindcss/vite` (sin archivo de config) |
| **Estado** | `useReducer` + [Immer](https://immerjs.github.io/immer/) | Reducer único como fuente de verdad |
| **Drag & drop** | [@dnd-kit](https://dndkit.com) | Reordenar días (táctil) |
| **PWA** | [vite-plugin-pwa](https://vite-pwa-org.netlify.app) + Workbox | Service worker, precache, manifest |
| **Nativo** | [Capacitor 8](https://capacitorjs.com) | Empaquetado Android + notificaciones nativas |
| **Notificaciones** | `@capacitor/local-notifications` / Web Notifications | Backend dual (nativo / web) |
| **Imágenes** | [sharp](https://sharp.pixelplumbing.com) | Generación de iconos y splash |
| **Tests** | [Vitest](https://vitest.dev) | Unit tests de la lógica (`lib/`, `state/`) |
| **Lint/Formato** | [ESLint 10](https://eslint.org) + [Prettier 3](https://prettier.io) | Calidad de código |
| **CI** | GitHub Actions | typecheck · lint · format · test · build |

**Requisitos:** Node.js 18+ (probado con 22).

---

## 🏗️ Arquitectura

La app sigue un patrón de **estado centralizado en un único reducer basado en Immer**. No hay
router ni librería de estado externa: tanto los **datos de dominio** (`routines`, `unit`,
`sessions`, `active`) como el **estado de UI** (pantalla actual, modales, diálogos, ajustes)
viven en `GymState` y solo se mutan despachando acciones tipadas.

```
┌──────────────────────────────────────────────────────────────┐
│  Componentes (screens + overlays)                              │
│  · Nunca llaman a dispatch directamente                        │
│  · Usan métodos de acción tipados desde useGym()               │
└───────────────┬───────────────────────────▲──────────────────┘
                │ acciones                    │ estado derivado
                ▼                             │ (useMemo)
┌──────────────────────────────────────────────────────────────┐
│  GymContext (Provider)                                         │
│  · useReducer(reducer, initState)                              │
│  · Persiste en localStorage (useEffect)                        │
│  · Orquesta efectos: rest timer, notificaciones, sesiones      │
└───────────────┬──────────────────────────────────────────────┘
                │ produce() de Immer
                ▼
┌──────────────────────────────────────────────────────────────┐
│  gymReducer  →  GymState + Action union + reducer puro         │
│  helpers: draftRoutine / draftDay / draftExercise              │
└───────────────┬──────────────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────────────┐
│  lib/  →  storage · backup · clone · progress · notify · …     │
└──────────────────────────────────────────────────────────────┘
```

**Decisiones clave:**

- **El enrutado es estado, no un router.** `state.screen` (`'home' | 'routine' | 'day'`)
  decide qué pantalla renderiza `App.tsx`; la navegación son acciones (`OPEN_ROUTINE`,
  `OPEN_DAY`, `BACK`).
- **Los modales también son estado.** Un único `ModalState` describe el formulario de
  crear/editar rutina/día/ejercicio; `applySaveModal` crea o actualiza según haya `id`.
- **La conversión de unidad es destructiva sobre los datos**: los pesos se guardan en la
  unidad actual, y `TOGGLE_UNIT` reescribe todos los `weight` con `convertWeight`.
- **El temporizador se ancla a una hora absoluta** y se re-sincroniza al volver a primer
  plano para evitar la deriva del `setInterval` en segundo plano.
- **Notificaciones con backend dual** (`lib/notify.ts`): elige automáticamente
  `@capacitor/local-notifications` dentro del APK o la Web Notification API en navegador/PWA.

---

## 📂 Estructura del proyecto

```
src/
  main.tsx                  punto de entrada
  App.tsx                   shell + selector de pantalla (3 screens + overlays)
  types.ts                  modelos de datos del dominio
  index.css                 Tailwind + tokens de diseño
  lib/                      lógica pura (con tests colocalizados *.test.ts)
    storage.ts              persistencia localStorage (gymApp_v2, migra desde v1)
    backup.ts               export/import JSON con saneo
    clone.ts                duplicar rutina/día (reasigna ids y grupos de biserie)
    progress.ts             stats de peso, 1RM (Epley), PR
    notify.ts               notificaciones nativas (Capacitor) o web
    convert.ts              conversión kg ↔ lb
    format.ts               tiempo, anillo del timer, beep, búsqueda de video
    palette.ts              colores de acento por categoría
    suggestions.ts          ejercicios sugeridos por categoría del día
    seed.ts                 datos de ejemplo
    id.ts                   generador de ids
  state/
    gymReducer.ts           GymState + Action union + reducer (Immer)
    GymContext.tsx          Provider, useGym(), persistencia y orquestación
    useRestTimer.ts         hook del temporizador de descanso
  components/
    Header · Fab · Modal · Dialog · ConfirmDialog · FinishSessionDialog
    RestTimer · ExerciseCard · ActivityCalendar · WeightChart
    ProgressSheet · SettingsSheet · common.tsx
    screens/                HomeScreen · RoutineScreen · DayScreen

scripts/                    gen-icons · gen-cap-assets · mark  (generadores con sharp)
public/                     iconos PWA generados
android/                    proyecto nativo de Capacitor (Gradle)
prototype/                  prototipo visual original (referencia)
screenshots/                capturas para este README
```

---

## 🗃️ Modelo de datos

```ts
Routine ─┬─ id, name
         └─ days: Day[] ─┬─ id, name
                         └─ exercises: Exercise[] ─┬─ id, name, sets, reps,
                                                   │  restSeconds, videoUrl,
                                                   │  supersetId?  (biserie)
                                                   └─ weeks: WeekEntry[]
                                                        └─ id, label, weight, doneSets[]

GymData = { routines, unit ('kg'|'lb'), sessions: Session[], active: ActiveSession | null }
```

- **`Session`** registra un entrenamiento terminado (`startedAt` / `endedAt` reales).
- **`ActiveSession`** es la sesión en curso (cronómetro de día).
- **Persistencia:** clave `gymApp_v2` en `localStorage`, con migración automática desde
  `gymApp_v1`. Al añadir campos, actualiza `normalize()` (storage) y `backup.ts`.

---

## 🚀 Inicio rápido

```bash
git clone https://github.com/AlexDoria21/GymRats.git
cd GymRats
npm install
npm run dev          # http://localhost:5173
```

> ℹ️ El **service worker solo se activa en producción**. Para probar PWA/offline usa
> `npm run build && npm run preview`, nunca `npm run dev`.

---

## 📜 Scripts disponibles

| Script | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Previsualiza el build (incl. PWA) |
| `npm run typecheck` | Comprobación de tipos (`tsc --noEmit`) |
| `npm run lint` | ESLint sobre todo el proyecto |
| `npm run format` | Formatea con Prettier |
| `npm run format:check` | Verifica el formato (usado en CI) |
| `npm test` | Tests unitarios (`vitest run`) |
| `npm run icons` | Regenera iconos PWA (`scripts/gen-icons.mjs`) |
| `npm run cap:sync` | Build web + copia a Android (`cap sync`) |
| `npm run cap:assets` | Regenera iconos/splash del APK |
| `npm run cap:open` | Abre el proyecto en Android Studio |
| `npm run android:apk` | Build + sync + `gradlew assembleDebug` |

**Ejecutar un solo test:**

```bash
npx vitest run src/lib/convert.test.ts   # un archivo
npx vitest                               # modo watch
```

---

## 📲 PWA (instalable + offline)

La app es una **PWA**: se instala en teléfono/escritorio y funciona sin conexión. El service
worker (vía `vite-plugin-pwa` + Workbox) precachea el app shell.

- Solo se activa en el **build de producción** (`npm run build && npm run preview`).
- Iconos en `public/` generados con `npm run icons` (fuente: `scripts/gen-icons.mjs`).
- El gesto de "tirar para recargar" del navegador está desactivado
  (`overscroll-behavior: none` + `body` fijo en `src/index.css`).

---

## 🤖 APK de Android (Capacitor)

La web (`dist/`) viaja **dentro** del APK, así que funciona offline y sin servidor. Config en
`capacitor.config.ts` (`appId: com.gymrats.app`); el proyecto nativo vive en `android/`
(`compileSdk 36`, `minSdk 24`).

**Requisitos (una vez):** Android Studio reciente (con SDK Platform 36) y JDK 17+ (sirve el
**Embedded JDK** que trae Android Studio).

```powershell
# 1) Reconstruir la web y copiarla al proyecto Android
npm run cap:sync

# 2) Apuntar Java al JDK de Android Studio (solo en terminal nueva)
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"

# 3) Compilar el APK de depuración
cd android
.\gradlew.bat assembleDebug
```

El resultado queda en `android\app\build\outputs\apk\debug\app-debug.apk`.

> **Atajo:** `npm run android:apk` encadena build + sync + Gradle.
> Alternativa con GUI: Android Studio → **Build → Build APK(s)** (usa el JDK embebido).

<details>
<summary><b>Solución de problemas</b></summary>

- **`ERROR: JAVA_HOME is not set`** → falta apuntar `JAVA_HOME` al `jbr` de Android Studio.
- **`getDefaultProguardFile('proguard-android.txt') is no longer supported`** → con AGP 9 usa
  `proguard-android-optimize.txt` (ya corregido en `android/app/build.gradle`).
- **Iconos/splash del APK** → `npm run cap:assets` (fuente: `scripts/gen-cap-assets.mjs`).
- El `app-debug.apk` está firmado con clave de **depuración** (uso personal). Para Google Play
  hace falta un **AAB firmado en modo release**.

</details>

---

## 🔔 Notificaciones

`src/lib/notify.ts` elige el backend automáticamente:

- **Nativo (APK):** `@capacitor/local-notifications` programa alarmas reales a una hora
  absoluta, incluso con la pantalla bloqueada o la app cerrada.
- **Web (navegador/PWA):** Web Notification API vía service worker, programada con
  *Notification Triggers* donde existe (Chrome/Android); en el resto (p. ej. iOS Safari) el
  aviso aparece al reabrir/desbloquear.

Se usan para el **fin del descanso** y para el **recordatorio de sesión** (~2:30 h). El permiso
se solicita en la primera interacción o desde **Ajustes → Notificaciones** (Android 13+).

---

## ✅ Calidad y CI

El workflow `.github/workflows/ci.yml` corre en cada push/PR:

```
typecheck → lint → format:check → test → build
```

Antes de dar por terminado un cambio, ejecuta localmente:

```bash
npm run typecheck && npm run lint && npm run format && npm test
```

Los tests unitarios cubren la lógica pura: `convert`, `progress`, `suggestions`, `backup` y
el `gymReducer`.

---

## 🗺️ Roadmap

- [ ] Tests de componentes (React Testing Library).
- [ ] Sincronización en la nube (Supabase) con cuentas.
- [ ] Progreso temporal basado en sesiones con fecha real (no por índice de semana).

> El prototipo original se conserva en [`prototype/`](./prototype) como referencia visual.
