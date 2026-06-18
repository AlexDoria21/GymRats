import type { CSSProperties, ReactNode, Ref } from 'react';

interface ListRowProps {
  name: string;
  meta: string;
  onOpen: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  /** Accent color (hex) for the left bar + hover/active border. */
  accent?: string;
  /** Drag handle node (e.g. the sortable grip). When set, it's rendered on the left. */
  handle?: ReactNode;
  /** ref for the sortable/draggable node. */
  rootRef?: Ref<HTMLDivElement>;
  /** transform/transition style coming from a sortable wrapper. */
  dragStyle?: CSSProperties;
  /** true while this row is the one being dragged. */
  dragging?: boolean;
}

const ICON_BTN =
  'flex h-[34px] w-[34px] flex-none cursor-pointer items-center justify-center rounded-[9px] border border-[#2a2a2e] bg-transparent';

/** A tappable card row used for routines and days. */
export function ListRow({
  name,
  meta,
  onOpen,
  onEdit,
  onDuplicate,
  onDelete,
  accent = '#3d9bff',
  handle,
  rootRef,
  dragStyle,
  dragging = false,
}: ListRowProps) {
  return (
    <div
      ref={rootRef}
      onClick={onOpen}
      style={{ '--accent': accent, ...dragStyle } as CSSProperties}
      className={
        'relative flex cursor-pointer items-center gap-2 overflow-hidden rounded-2xl border border-[#26262b] bg-[#161618] p-4 pl-[18px] transition-colors duration-150 hover:border-[var(--accent)] hover:bg-[#1a1a1d] active:bg-[#1f1f23] ' +
        (dragging
          ? 'z-10 border-[var(--accent)] opacity-90 shadow-2xl'
          : 'hover:-translate-y-0.5 active:scale-[0.99]')
      }
    >
      <span
        aria-hidden
        className="absolute top-0 bottom-0 left-0 w-[3px]"
        style={{ backgroundColor: accent }}
      />
      {handle && (
        <div className="flex-none" onClick={(e) => e.stopPropagation()}>
          {handle}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-[16px] font-semibold text-[#f3f3f4]">{name}</div>
        <div className="mt-1 text-[13px] text-[#82828a]">{meta}</div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className="flex-none cursor-pointer rounded-[9px] border border-[#2a2a2e] bg-transparent px-[11px] py-[7px] text-[12.5px] text-[#9a9aa1]"
      >
        Editar
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDuplicate();
        }}
        aria-label={`Duplicar ${name}`}
        title="Duplicar"
        className={ICON_BTN + ' text-[#9a9aa1]'}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M5 15V5a2 2 0 0 1 2-2h10" />
        </svg>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label={`Eliminar ${name}`}
        title="Eliminar"
        className={ICON_BTN + ' text-[#6a6a72] text-[15px]'}
      >
        ✕
      </button>
    </div>
  );
}

/** Centered empty-state with a big plus (home screen). */
export function EmptyHome({ text }: { text: string }) {
  return (
    <div className="px-6 py-[60px] text-center text-[#5f5f66]">
      <div className="mb-3 text-[40px] text-[#2f2f35]">＋</div>
      <div className="text-[14px] leading-relaxed">{text}</div>
    </div>
  );
}

/** Plain centered empty-state text (routine / day screens). */
export function EmptyText({ text }: { text: string }) {
  return (
    <div className="px-6 py-12 text-center text-[14px] leading-relaxed text-[#5f5f66]">{text}</div>
  );
}
