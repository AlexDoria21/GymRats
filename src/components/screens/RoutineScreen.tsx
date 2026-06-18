import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useGym } from '../../state/GymContext';
import { PALETTE } from '../../lib/palette';
import type { Day } from '../../types';
import { EmptyText, ListRow } from '../common';

function GripIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="9" cy="6" r="1.6" />
      <circle cx="15" cy="6" r="1.6" />
      <circle cx="9" cy="12" r="1.6" />
      <circle cx="15" cy="12" r="1.6" />
      <circle cx="9" cy="18" r="1.6" />
      <circle cx="15" cy="18" r="1.6" />
    </svg>
  );
}

function SortableDay({ day, accent }: { day: Day; accent: string }) {
  const { openDay, openModal, duplicateDay, requestDelete } = useGym();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: day.id,
  });

  const handle = (
    <button
      {...attributes}
      {...listeners}
      aria-label={`Reordenar ${day.name}`}
      title="Arrastra para reordenar"
      className="flex h-[34px] w-[26px] flex-none cursor-grab touch-none items-center justify-center rounded-[8px] text-[#6a6a72] active:cursor-grabbing"
    >
      <GripIcon />
    </button>
  );

  return (
    <ListRow
      name={day.name}
      meta={`${day.exercises.length}${day.exercises.length === 1 ? ' ejercicio' : ' ejercicios'}`}
      accent={accent}
      handle={handle}
      rootRef={setNodeRef}
      dragStyle={{ transform: CSS.Transform.toString(transform), transition }}
      dragging={isDragging}
      onOpen={() => openDay(day.id)}
      onEdit={() => openModal({ type: 'day', id: day.id, name: day.name })}
      onDuplicate={() => duplicateDay(day.id)}
      onDelete={() => requestDelete('day', day.id, day.name)}
    />
  );
}

export function RoutineScreen() {
  const { currentRoutine, reorderDay } = useGym();
  const r = currentRoutine;
  const days = r?.days ?? [];
  const subtitle = r ? `${days.length}${days.length === 1 ? ' día' : ' días'}` : '';

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) reorderDay(String(active.id), String(over.id));
  };

  return (
    <div className="flex flex-col gap-3 px-4 pt-4 pb-2">
      <div className="px-0.5 pb-0.5 text-xs tracking-[0.07em] text-[#5f5f66] uppercase">
        {subtitle}
      </div>
      {days.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={days.map((d) => d.id)} strategy={verticalListSortingStrategy}>
            {days.map((d, i) => (
              <SortableDay key={d.id} day={d} accent={PALETTE[i % PALETTE.length]} />
            ))}
          </SortableContext>
        </DndContext>
      )}
      {days.length === 0 && (
        <EmptyText text="Agrega los días de esta rutina (Push, Pull, Legs...)." />
      )}
    </div>
  );
}
