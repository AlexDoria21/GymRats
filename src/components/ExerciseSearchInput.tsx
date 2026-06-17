import { useState } from 'react';
import { equipmentLabel, imageUrl, primaryMuscleLabel } from '../lib/exerciseDb';
import type { DbExercise } from '../lib/exerciseDb';
import { useExerciseSearch } from '../state/useExerciseSearch';

const INPUT =
  'w-full rounded-[11px] border border-[#2a2a2e] bg-[#0d0d0f] p-[13px] text-[15px] text-[#f3f3f4] outline-none';

interface Props {
  value: string;
  onChange: (name: string) => void;
  onPick: (ex: DbExercise) => void;
}

export function ExerciseSearchInput({ value, onChange, onPick }: Props) {
  const [focused, setFocused] = useState(false);
  // start dismissed so editing an existing exercise doesn't pop the list until the user types
  const [dismissed, setDismissed] = useState(true);
  const { results, loading } = useExerciseSearch(value);

  const show = focused && !dismissed && value.trim().length >= 2 && results.length > 0;

  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => {
          setDismissed(false);
          onChange(e.target.value);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => window.setTimeout(() => setFocused(false), 120)}
        placeholder="Busca: sentadilla, press banca, curl..."
        className={INPUT}
        autoFocus
        autoComplete="off"
      />

      {loading && focused && !dismissed && value.trim().length >= 2 && (
        <div className="mt-1.5 text-[11px] text-[#5f5f66]">Buscando…</div>
      )}

      {show && (
        <ul className="absolute top-full right-0 left-0 z-30 mt-1.5 max-h-[244px] overflow-y-auto rounded-[12px] border border-[#2a2a2e] bg-[#161618] py-1 shadow-2xl">
          {results.map((ex) => {
            const img = imageUrl(ex);
            const muscle = primaryMuscleLabel(ex);
            const equip = equipmentLabel(ex);
            const meta = [muscle, equip].filter(Boolean).join(' · ');
            return (
              <li key={ex.id}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault(); // keep focus, fire before blur
                    onPick(ex);
                    setDismissed(true);
                  }}
                  className="flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left hover:bg-[#1f1f23]"
                >
                  {img ? (
                    <img
                      src={img}
                      alt=""
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.visibility = 'hidden';
                      }}
                      className="h-[38px] w-[38px] flex-none rounded-[8px] border border-[#2a2a2e] bg-[#0d0d0f] object-cover"
                    />
                  ) : (
                    <div className="h-[38px] w-[38px] flex-none rounded-[8px] border border-[#2a2a2e] bg-[#0d0d0f]" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-medium text-[#f3f3f4]">{ex.name}</div>
                    {meta && <div className="truncate text-[11.5px] text-[#82828a]">{meta}</div>}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
