'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from './button';

// Asks before a destructive action. Built on the native <dialog>, which traps
// focus, closes on Esc and returns focus to the trigger. Focus starts on
// Cancel, the least destructive choice.
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  /** The consequence, in plain words. */
  children: ReactNode;
  /** A verb that says what happens, such as "Remove member". */
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      // A click on the backdrop lands on the dialog element itself.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="ff-dialog m-auto w-[calc(100%-2rem)] max-w-110 glass-strong rounded-xl p-0 text-fg shadow-dialog backdrop:bg-backdrop"
    >
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-2">
          <h2 id={titleId} className="text-section">
            {title}
          </h2>
          <div className="text-body text-fg-secondary">{children}</div>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" autoFocus onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
