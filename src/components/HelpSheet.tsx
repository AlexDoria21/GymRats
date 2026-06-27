import { useGym } from '../state/GymContext';
import { Dialog } from './Dialog';

function Level({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="display blaze-text mt-0.5 w-[26px] flex-none text-[26px]">{n}</span>
      <div>
        <div className="text-[14.5px] font-bold text-ink">{title}</div>
        <div className="mt-0.5 text-[13px] leading-relaxed text-muted">{body}</div>
      </div>
    </div>
  );
}

function Tip({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[12px] border border-line bg-bg p-3">
      <div className="text-[13.5px] font-bold text-ink">{title}</div>
      <div className="mt-0.5 text-[12.5px] leading-relaxed text-muted">{body}</div>
    </div>
  );
}

export function HelpSheet() {
  const { state, closeHelp } = useGym();
  if (!state.helpOpen) return null;

  return (
    <Dialog onClose={closeHelp} ariaLabel="Cómo funciona" z="z-30" backdrop="bg-black/65">
      <div className="sheet max-h-[88%] overflow-y-auto px-[18px] pt-[14px] pb-6">
        <div className="grabber" />
        <div className="eyebrow">Guía rápida</div>
        <div className="display mt-1 mb-4 text-[24px] text-ink">Cómo funciona</div>

        <div className="flex flex-col gap-3.5">
          <Level
            n={1}
            title="Rutina"
            body="Un plan de entrenamiento (p. ej. «Hipertrofia · Mes 1»). Agrupa tus días."
          />
          <Level
            n={2}
            title="Día"
            body="Cada sesión dentro de la rutina: Push, Pull, Legs, Pecho… Agrupa ejercicios."
          />
          <Level
            n={3}
            title="Ejercicio"
            body="Series, reps y descanso. Anotas la carga de cada semana y marcas las series hechas."
          />
        </div>

        <div className="eyebrow mt-6 mb-2.5">Crear, editar y borrar</div>
        <div className="flex flex-col gap-2">
          <Tip
            title="Crear"
            body="Usa el botón grande de abajo: crea rutinas en el inicio, días dentro de una rutina y ejercicios dentro de un día."
          />
          <Tip
            title="Editar y eliminar"
            body="En cada tarjeta toca «Editar» para cambiar nombre o valores, y la ✕ para eliminarla."
          />
        </div>

        <div className="eyebrow mt-6 mb-2.5">Entrenar</div>
        <div className="flex flex-col gap-2">
          <Tip
            title="Inicia la rutina"
            body="Pulsa «Iniciar» en una rutina para arrancar el cronómetro de la sesión."
          />
          <Tip
            title="Marca cada serie"
            body="Toca los números al terminar cada serie; la barra de carga se llena con tu progreso."
          />
          <Tip
            title="Descansa y finaliza"
            body="Usa el temporizador de descanso entre series y pulsa «Finalizar» para guardar la sesión en tu calendario."
          />
        </div>

        <div className="eyebrow mt-6 mb-2.5">Trucos</div>
        <div className="flex flex-col gap-2">
          <Tip title="Reordenar días" body="Mantén pulsado el icono ⠿ de un día y arrástralo." />
          <Tip
            title="Biseries"
            body="En un ejercicio, enlázalo con el siguiente para entrenarlos sin descanso intermedio."
          />
          <Tip title="Progreso" body="Toca el icono 📈 de un ejercicio para ver tu curva de carga y 1RM estimado." />
        </div>

        <button onClick={closeHelp} className="btn btn-ghost mt-6 w-full">
          Entendido
        </button>
      </div>
    </Dialog>
  );
}
