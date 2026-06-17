import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

const FOCUSABLE =
  'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

interface DialogProps {
  onClose: () => void;
  ariaLabel: string;
  children: ReactNode;
  z?: string; // tailwind z-index class
  backdrop?: string; // tailwind background class
  closeOnBackdrop?: boolean;
}

/** Accessible modal backdrop: ARIA dialog, Esc to close, focus trap, focus restore. */
export function Dialog({
  onClose,
  ariaLabel,
  children,
  z = 'z-20',
  backdrop = 'bg-black/60',
  closeOnBackdrop = true,
}: DialogProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const el = ref.current;
    const focusables = el?.querySelectorAll<HTMLElement>(FOCUSABLE);
    (focusables && focusables.length ? focusables[0] : el)?.focus();
    return () => previouslyFocused?.focus?.();
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== 'Tab') return;
    const el = ref.current;
    if (!el) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      onClick={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose();
      }}
      className={`absolute inset-0 ${z} flex animate-[fadeIn_.18s_ease] items-end justify-center outline-none ${backdrop}`}
    >
      {children}
    </div>
  );
}
