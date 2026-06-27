import { useEffect, useRef, useState } from 'react';
import { useGym } from '../state/GymContext';
import { buildBackup, parseBackup } from '../lib/backup';
import { getPermission, requestNotifications, type PermState } from '../lib/notify';
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
  'flex w-full items-center gap-3 rounded-[14px] border border-line bg-bg p-4 text-left cursor-pointer active:scale-[0.99]';

export function SettingsSheet() {
  const { state, importData, closeSettings } = useGym();
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [notifPerm, setNotifPerm] = useState<PermState>('prompt');

  // Load the current notification permission whenever the sheet opens.
  useEffect(() => {
    if (state.settingsOpen) void getPermission().then(setNotifPerm);
  }, [state.settingsOpen]);

  if (!state.settingsOpen) return null;

  const onEnableNotifs = async () => {
    setError(null);
    setDone(null);
    const granted = await requestNotifications();
    setNotifPerm(await getPermission());
    if (granted) setDone('Notificaciones de descanso activadas.');
    else setError('No se pudieron activar las notificaciones (permiso denegado o no disponible).');
  };

  const notifText =
    notifPerm === 'granted'
      ? 'Activadas'
      : notifPerm === 'denied'
        ? 'Bloqueadas (actívalas en Ajustes del sistema)'
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
      <div className="sheet max-h-[88%] overflow-y-auto px-[18px] pt-[14px] pb-6">
        <div className="grabber" />
        <div className="display text-[22px] text-ink">Datos</div>
        <div className="mt-1 mb-4 text-[13px] text-muted">
          Respalda o restaura tus rutinas. Se guardan solo en este dispositivo.
        </div>

        <div className="flex flex-col gap-2.5">
          <button onClick={onExport} className={BTN}>
            <span className="text-[20px]">⬇️</span>
            <span className="flex-1">
              <span className="block text-[15px] font-bold text-ink">Exportar copia</span>
              <span className="block text-[12.5px] text-muted">Descarga un archivo .json</span>
            </span>
          </button>

          <button onClick={() => fileRef.current?.click()} className={BTN}>
            <span className="text-[20px]">⬆️</span>
            <span className="flex-1">
              <span className="block text-[15px] font-bold text-ink">Importar copia</span>
              <span className="block text-[12.5px] text-muted">Reemplaza tus datos actuales</span>
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

        <div className="display mt-6 text-[22px] text-ink">Notificaciones</div>
        <div className="mt-1 mb-3 text-[13px] text-muted">
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
            <span className="block text-[15px] font-bold text-ink">Notificaciones de descanso</span>
            <span className="block text-[12.5px] text-muted">{notifText}</span>
          </span>
        </button>

        {error && (
          <div className="mt-3 rounded-[11px] border border-[#5a2436] bg-[#1c0e14] p-3 text-[13px] text-danger">
            {error}
          </div>
        )}
        {done && !error && (
          <div className="mt-3 rounded-[11px] border border-[#5a2436] bg-[#1c0e14] p-3 text-[13px] text-blaze">
            {done}
          </div>
        )}

        <button onClick={closeSettings} className="btn btn-ghost mt-6 w-full">
          Cerrar
        </button>
      </div>
    </Dialog>
  );
}
