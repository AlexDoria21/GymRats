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
- El gesto de "tirar hacia abajo para recargar" del navegador está desactivado
  (`overscroll-behavior: none` + `body` fijo en `src/index.css`), para que deslizar no
  reinicie la app.

## APK de Android (Capacitor)

La app se empaqueta como **APK nativo** con [Capacitor](https://capacitorjs.com): el build
web (`dist/`) viaja **dentro** del APK, así que funciona offline y sin servidor. Config en
`capacitor.config.ts` (`appId: com.gymrats.app`); el proyecto nativo vive en `android/`.

**Requisitos (instalar una vez):**

- **Android Studio reciente** (2025 o posterior; cualquier versión que soporte
  **AGP 8.13** y **Gradle 8.14**). Ábrelo una vez y, en *SDK Manager*, instala el
  **SDK Platform 36 (Android 16)** — es el `compileSdk` del proyecto.
- **JDK 17+**: normalmente **no hace falta instalarlo aparte**. Android Studio trae uno
  embebido; actívalo en *Settings → Build, Execution, Deployment → Build Tools → Gradle →
  Gradle JDK → "Embedded JDK" (jbr-17/jbr-21)*.

Versiones del proyecto (en `android/`): `compileSdk 36`, `minSdk 24`. Al abrir el proyecto,
Android Studio puede **actualizar** Gradle/AGP a una versión más nueva (p. ej. Gradle 9.4.1
y AGP 9) — es normal y funciona.

### Regenerar el APK (receta paso a paso)

Cada vez que cambies algo de la app:

```powershell
# 1) Reconstruir la web y copiarla al proyecto Android
npm run cap:sync

# 2) Ir a la carpeta android
cd android

# 3) Apuntar Java al que trae Android Studio (SOLO si abres una terminal nueva).
#    Úsalo también en la Terminal interna de Android Studio (Alt+F12).
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"

# 4) Compilar el APK de depuración
.\gradlew.bat assembleDebug
```

Cuando termine en **`BUILD SUCCESSFUL`**, el archivo queda en:

```
android\app\build\outputs\apk\debug\app-debug.apk
```

Cópialo al teléfono e instálalo activando "instalar apps de origen desconocido".
(Alternativa: en Android Studio, ☰ → **Build → Build Bundle(s) / APK(s) → Build APK(s)**;
el menú usa el Java embebido automáticamente, sin el paso 3.)

### Notas y solución de problemas

- **`ERROR: JAVA_HOME is not set`** → falta el paso 3 (apuntar `JAVA_HOME` al `jbr` de
  Android Studio). Vuelve a ejecutarlo en esa terminal.
- **`getDefaultProguardFile('proguard-android.txt') is no longer supported`** → con AGP 9 hay
  que usar `proguard-android-optimize.txt`. Ya está corregido en `android/app/build.gradle`;
  si Capacitor regenera ese archivo (`cap add`/`cap sync` no lo pisa, pero `cap add` sí),
  vuelve a aplicar el cambio.
- **Iconos y splash** del APK (logo "GR"): `npm run cap:assets`
  (fuente en `scripts/gen-cap-assets.mjs` → `assets/`).
- **Notificaciones:** en el APK se usan **notificaciones nativas** (`@capacitor/local-notifications`),
  no la API web (que no existe dentro del WebView). La primera vez que actives el descanso o
  toques *Ajustes → Notificaciones*, Android pedirá permiso (Android 13+). Si dice
  "Bloqueadas", actívalas en *Ajustes del sistema → Apps → Gym Rats → Notificaciones*.
  `src/lib/notify.ts` elige automáticamente backend nativo (APK) o web (navegador/PWA).
- El `app-debug.apk` está firmado con la clave de **depuración**: sirve para uso personal.
  Para publicar en Google Play hace falta un **AAB firmado en modo release** (otra clave).

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
- **Semanas manuales**: el ejercicio nace con 1 semana; se agregan/eliminan a mano con
  **＋ Agregar semana** y la **×** de cada fila, conforme avanza la rutina.
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
  cabecera), beep + vibración + **notificación "Descanso finalizado"** al terminar, presets
  y ±15s. El conteo se ancla a una hora absoluta y se re-sincroniza al volver a primer plano.
- **Biseries / superseries**: une dos (o más) ejercicios adyacentes con **🔗 Biserie con
  el siguiente**; se agrupan en un recuadro y se separan con **Separar biserie**.
- **Cronómetro de día**: botón **▶ Iniciar** en el header al abrir una rutina; mide el
  tiempo de entrenamiento, graba la sesión con fecha real al **Finalizar** (con confirmación)
  y programa un recordatorio push (~2:30 h) por si se olvida.
- **Calendario de actividad** en el inicio: mes navegable que marca los días entrenados.
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

Del **To Do List** (ver checklist arriba):

7. **Semanas manuales (#1)** — se quitó el input "Semanas" del modal de ejercicio; ahora
   se crea con 1 semana y se agregan/eliminan a mano (`ADD_WEEK`/`DELETE_WEEK` en
   `gymReducer.ts`, botones en `ExerciseCard.tsx`). Al editar un ejercicio se conservan las
   semanas y solo se ajusta el nº de series por semana.
8. **Notificación de descanso (#3)** — nuevo `src/lib/notify.ts` (notificación vía service
   worker con fallback, y programación con Notification Triggers donde existe); el
   temporizador (`useRestTimer.ts`) avisa al llegar a 0 y se re-sincroniza por timestamp al
   volver a primer plano; permiso solicitable en **Ajustes → Notificaciones**.
9. **Cronómetro de día (#4)** — nuevos tipos `Session`/`ActiveSession` y acciones
   `START/FINISH/CANCEL_SESSION` (`gymReducer.ts`); botón **▶ Iniciar** / chip **Finalizar**
   en `Header.tsx`; recordatorio push ~2:30 h vía `scheduleSessionReminder` (`notify.ts`).
   El esquema de `localStorage` subió a **`gymApp_v2`** con migración automática desde
   `gymApp_v1` (`storage.ts`), y el respaldo JSON ahora incluye las sesiones (`backup.ts`).
10. **Calendario de actividad (#5)** — `ActivityCalendar.tsx` en el inicio: rejilla mensual
    navegable que marca los días con sesión completada (lee `sessions`); al tocar un día
    muestra la duración total entrenada. Quedó **debajo** de la lista de rutinas.
11. **Confirmación al finalizar (#4)** — el chip del header abre `FinishSessionDialog.tsx`
    (estado `finishConfirmOpen` + acciones `REQUEST/CANCEL_FINISH_SESSION`) para evitar
    terminar el entrenamiento por un toque accidental.
12. **Biseries / superseries (#2)** — campo opcional `supersetId` en `Exercise` y acciones
    `LINK/UNLINK_SUPERSET` (`gymReducer.ts`); `DayScreen.tsx` agrupa ejercicios adyacentes
    de la misma biserie en un recuadro con badge; `clone.ts` reasigna los ids de grupo al
    duplicar y `backup.ts` los conserva.

## Observaciones

- ✅ **Sugerencias de ejercicios por día** (implementado, ver **Cambios recientes** y
  **Ejercicios y video guía**). Decisiones tomadas: se **mantiene** el texto libre y las
  chips de nombre del día; las sugerencias son **aditivas** y se basan en la categoría
  detectada en el nombre del día, no en reemplazar la entrada manual.


## To Do List

Roadmap vivo: al completar un ítem se marca `- [x]` y se resume en **Cambios recientes**.

- [x] **1. Semanas manuales por ejercicio** — se quitó el campo "Semanas" al crear un
      ejercicio (ahora nace con 1 semana); cada semana se agrega/elimina a mano con el
      botón **＋ Agregar semana** / la **×** de cada fila dentro del ejercicio, conforme el
      usuario avanza en su rutina con el tiempo.
- [x] **2. Biseries / superseries** — botón **🔗 Biserie con el siguiente** en cada
      ejercicio que lo agrupa con el de abajo; los ejercicios unidos se muestran dentro de un
      recuadro con badge **Biserie**, y se deshace con **Separar biserie**.
- [x] **3. Notificación de descanso** — al terminar el temporizador muestra una
      notificación **"Descanso finalizado"** (con beep + vibración), aunque la app esté en
      segundo plano. Se activa desde **Ajustes → Notificaciones** o al iniciar el primer
      descanso.
- [x] **4. Cronómetro de día** — botón **▶ Iniciar** a la derecha del header al abrir una
      rutina; muestra un chip verde con el tiempo transcurrido y **Finalizar** (graba la
      sesión con fecha real), y programa un recordatorio push (~2:30 h) por si se olvida.
- [x] **5. Calendario de actividad** — en el inicio, calendario mensual navegable (‹/›/Hoy)
      que marca en verde los días con una sesión completada y resalta el día actual.

> **Nota sobre el aviso con pantalla bloqueada (#3):** el conteo corre con `setInterval` en
> la página, que el navegador *throttlea* al pasar a segundo plano. Para mejorar la
> fiabilidad: (a) donde existe **Notification Triggers** (Chrome/Android) la notificación se
> programa a la hora exacta vía el service worker y suena con la pantalla bloqueada; (b) en
> el resto (p. ej. iOS Safari PWA) el aviso aparece al reabrir/desbloquear. Un aviso 100%
> fiable con pantalla bloqueada en toda plataforma requeriría Web Push + servidor (fuera de
> alcance por ahora).


