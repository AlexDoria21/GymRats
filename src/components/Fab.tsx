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
        sets: 4,
        reps: '8-12',
        rest: 90,
      });
  };

  return (
    <div
      className="flex-none px-4 pt-3 pb-4"
      style={{ background: 'linear-gradient(to top,var(--color-bg) 65%,transparent)' }}
    >
      <button
        onClick={onAdd}
        className="blaze-fill w-full cursor-pointer rounded-[14px] p-[15px] text-[15px] font-bold tracking-[0.01em] text-[#2a0710] active:scale-[0.99]"
      >
        {label}
      </button>
    </div>
  );
}
