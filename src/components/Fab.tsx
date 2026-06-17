import { useGym } from '../state/GymContext';

export function Fab() {
  const { state, openModal } = useGym();

  const label =
    state.screen === 'home'
      ? '＋  Rutina nueva'
      : state.screen === 'routine'
        ? '＋  Agregar día'
        : '＋  Agregar ejercicio';

  const onAdd = () => {
    if (state.screen === 'home') openModal({ type: 'routine', name: '' });
    else if (state.screen === 'routine') openModal({ type: 'day', name: '' });
    else
      openModal({
        type: 'exercise',
        name: '',
        videoUrl: '',
        sets: 4,
        reps: '8-12',
        rest: 90,
        weeks: 4,
      });
  };

  return (
    <div
      className="flex-none px-4 pt-3 pb-4"
      style={{ background: 'linear-gradient(to top,#0d0d0f 65%,rgba(13,13,15,0))' }}
    >
      <button
        onClick={onAdd}
        className="w-full cursor-pointer rounded-[14px] bg-[#3d9bff] p-[15px] text-[15px] font-bold tracking-[0.01em] text-[#06121f]"
      >
        {label}
      </button>
    </div>
  );
}
