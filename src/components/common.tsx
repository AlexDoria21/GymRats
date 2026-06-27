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
  'flex h-[34px] w-[34px] flex-none cursor-pointer items-center justify-center rounded-[9px] border border-line bg-transparent';

/** A tappable card row used for routines and days. */
export function ListRow({
  name,
  meta,
  onOpen,
  onEdit,
  onDuplicate,
  onDelete,
  accent = '#ff2e63',
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
        'relative flex cursor-pointer items-center gap-2 overflow-hidden rounded-2xl border border-line bg-surface p-4 pl-[18px] transition-colors duration-150 hover:border-[var(--accent)] hover:bg-surface-2 active:bg-surface-2 ' +
        (dragging
          ? 'z-10 border-[var(--accent)] opacity-90 shadow-2xl'
          : 'hover:-translate-y-0.5 active:scale-[0.99]')
      }
    >
      <span
        aria-hidden
        className="absolute top-0 bottom-0 left-0 w-[4px]"
        style={{ backgroundImage: `linear-gradient(180deg, ${accent}, var(--color-blaze-2))` }}
      />
      {handle && (
        <div className="flex-none" onClick={(e) => e.stopPropagation()}>
          {handle}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-[16.5px] font-bold tracking-[-0.01em] text-ink">{name}</div>
        <div className="mt-1 text-[12.5px] font-medium text-muted">{meta}</div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className="flex-none cursor-pointer rounded-[9px] border border-line bg-transparent px-[11px] py-[7px] text-[12.5px] font-medium text-ink-2"
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
        className={ICON_BTN + ' text-muted'}
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
        className={ICON_BTN + ' text-faint text-[15px]'}
      >
        ✕
      </button>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  body: string;
  ctaLabel: string;
  onCta: () => void;
  /** Optional numbered steps that teach the Rutina → Día → Ejercicio model. */
  steps?: string[];
}

/** Instructive empty state: explains what this level is and offers the action. */
export function EmptyState({ title, body, ctaLabel, onCta, steps }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-line-2 bg-surface p-6 text-center">
      <div className="display blaze-text mb-1 text-[44px]">＋</div>
      <div className="text-[17px] font-bold text-ink">{title}</div>
      <div className="mx-auto mt-2 max-w-[300px] text-[13.5px] leading-relaxed text-muted">
        {body}
      </div>
      {steps && (
        <ol className="mx-auto mt-4 flex max-w-[280px] flex-col gap-2 text-left">
          {steps.map((s, i) => (
            <li key={i} className="flex items-center gap-2.5">
              <span className="blaze-fill flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full text-[12px] font-bold text-[#2a0710]">
                {i + 1}
              </span>
              <span className="text-[13px] font-medium text-ink-2">{s}</span>
            </li>
          ))}
        </ol>
      )}
      <button onClick={onCta} className="btn btn-primary mt-5 w-full">
        {ctaLabel}
      </button>
    </div>
  );
}
