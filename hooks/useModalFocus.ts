import { RefObject, useEffect } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

type UseModalFocusOptions = {
  isOpen: boolean;
  dialogRef: RefObject<HTMLElement>;
  initialFocusRef?: RefObject<HTMLElement>;
  onClose: () => void;
};

export function useModalFocus({
  isOpen,
  dialogRef,
  initialFocusRef,
  onClose,
}: UseModalFocusOptions) {
  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return;

    const previousActiveElement = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const getFocusable = () => Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) || [],
    ).filter((element) => !element.hasAttribute('disabled') && element.tabIndex !== -1);

    window.setTimeout(() => {
      const target = initialFocusRef?.current || getFocusable()[0] || dialogRef.current;
      target?.focus();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = getFocusable();
      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousActiveElement?.focus();
    };
  }, [dialogRef, initialFocusRef, isOpen, onClose]);
}
