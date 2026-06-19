import { useRef, useState } from 'react';
import { useGym } from '../state/GymContext';
import { buildBackup, parseBackup } from '../lib/backup';
import { notificationPermission, requestNotifications } from '../lib/notify';
import { Dialog } from './Dialog';

function downloadJson(filename: string, text: string) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const BTN =
  'flex w-full items-center gap-3 rounded-[14px] border border-[#2a2a2e] bg-[#0d0d0f] p-4 text-left cursor-pointer';

export function SettingsSheet() {
  const { state, importData, closeSettings } = useGym();
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [notifPerm, setNotifPerm] = useState(notificationPermission());

  if (!state.settingsOpen) return null;

  const onEnableNotifs = async () => {
    setError(null);
    setDone(null);
    const granted = await requestNotifications();
    setNotifPerm(notificationPermission());
    if (granted) setDone('Notificaciones de descanso activadas.');
    else setError('No se pudieron activar las notificaciones (permiso denegado o no disponible).');
  };

  const notifText =
    notifPerm === 'granted'
      ? 'Activadas'
      : notifPerm === 'denied'
        ? 'Bloqueadas en el navegador'
        : notifPerm === 'unsupported'
          ? 'No disponibles en este dispositivo'
          : 'Toca para activar';

  const onExport = () => {
    setError(null);
    const backup = buildBackup({
      routines: state.routines,
      unit: state.unit,
      sessions: state.sessions,
      active: state.active,
    });
    const date = new Date().toISOString().slice(0, 10);
    downloadJson(`rutinas-gym-${date}.json`, JSON.stringify(backup, null, 2));
    setDone('Copia de seguridad descargada.');
  };

  const onImportFile = (file: File) => {
    setError(null);
    setDone(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = parseBackup(String(reader.result));
        const count = data.routines.length;
        importData(data);
        setDone(`Importado: ${count} rutina${count === 1 ? '' : 's'}.`);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo importar el archivo.');
      }
    };
    reader.onerror = () => setError('No se pudo leer el archivo.');
    reader.readAsText(file);
  };

  return (
    <Dialog onClose={closeSettings} ariaLabel="Datos y ajustes" z="z-30" backdrop="bg-black/65">
      <div className="w-full max-w-[480px] animate-[sheetUp_.24s_cubic-bezier(.2,.8,.2,1)] rounded-t-3xl border border-b-0 border-[#2a2a2e] bg-[#161618] px-[18px] pt-[14px] pb-6">
        <div className="mx-auto mb-4 h-1 w-[38px] rounded-[3px] bg-[#2f2f35]" />
        <div className="mb-1 text-[18px] font-bold text-[#f3f3f4]">Datos</div>
        <div className="mb-4 text-[13px] text-[#82828a]">
          Respalda o restaura tus rutinas. Se guardan solo en este dispositivo.
        </div>

        <div className="flex flex-col gap-2.5">
          <button onClick={onExport} className={BTN}>
            <span className="text-[20px]">⬇️</span>
            <span className="flex-1">
              <span className="block text-[15px] font-semibold text-[#f3f3f4]">Exportar copia</span>
              <span className="block text-[12.5px] text-[#82828a]">Descarga un archivo .json</span>
            </span>
          </button>

          <button onClick={() => fileRef.current?.click()} className={BTN}>
            <span className="text-[20px]">⬆️</span>
            <span className="flex-1">
              <span className="block text-[15px] font-semibold text-[#f3f3f4]">Importar copia</span>
              <span className="block text-[12.5px] text-[#82828a]">
                Reemplaza tus datos actuales
              </span>
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onImportFile(f);
              e.target.value = '';
            }}
          />
        </div>

        <div className="mt-5 mb-1 text-[18px] font-bold text-[#f3f3f4]">Notificaciones</div>
        <div className="mb-3 text-[13px] text-[#82828a]">
          Aviso "Descanso finalizado" al terminar el temporizador, aunque la app esté en segundo
          plano.
        </div>
        <button
          onClick={onEnableNotifs}
          disabled={notifPerm === 'granted' || notifPerm === 'unsupported'}
          className={
            BTN + (notifPerm === 'granted' || notifPerm === 'unsupported' ? ' opacity-60' : '')
          }
        >
          <span className="text-[20px]">🔔</span>
          <span className="flex-1">
            <span className="block text-[15px] font-semibold text-[#f3f3f4]">
              Notificaciones de descanso
            </span>
            <span className="block text-[12.5px] text-[#82828a]">{notifText}</span>
          </span>
        </button>

        {error && (
          <div className="mt-3 rounded-[11px] border border-[#3a2422] bg-[#1a0f0d] p-3 text-[13px] text-[#ff6b5e]">
            {error}
          </div>
        )}
        {done && !error && (
          <div className="mt-3 rounded-[11px] border border-[#1d2c1d] bg-[#0f150f] p-3 text-[13px] text-[#7ed08a]">
            {done}
          </div>
        )}

        <button
          onClick={closeSettings}
          className="mt-5 w-full cursor-pointer rounded-xl border border-[#2a2a2e] bg-transparent p-[13px] text-[15px] font-semibold text-[#b3b3ba]"
        >
          Cerrar
        </button>
      </div>
    </Dialog>
  );
}
