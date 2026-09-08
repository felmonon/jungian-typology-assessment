import { useEffect, useRef } from 'react';

export type AssessmentKeyboardOptions = {
  enabled: boolean;
  /** The number of options in the currently visible question, in display order. */
  optionCount: number;
  /** Receives a zero-based index. Selection must not advance the question. */
  selectByIndex: (index: number) => void;
  canContinue: boolean;
  onContinue: () => void;
  /** Include dialogs rendered outside this document, or before their DOM mounts. */
  isDialogOpen?: boolean;
};

const EDITABLE_CONTROL = 'input, textarea, select, [role="textbox"], [role="searchbox"], [role="combobox"]';
const ENTER_CONTROL = [
  'button', 'a[href]', 'input', 'textarea', 'select', 'summary', 'iframe',
  '[role="button"]', '[role="link"]', '[role="radio"]', '[role="checkbox"]',
  '[role="switch"]', '[role="tab"]', '[role="menuitem"]', '[role="menuitemcheckbox"]',
  '[role="menuitemradio"]', '[role="option"]', '[role="slider"]', '[role="spinbutton"]',
  '[role="treeitem"]',
].join(', ');

function hasOpenDialog() {
  return Array.from(document.querySelectorAll<HTMLElement>('dialog[open], [role="dialog"], [role="alertdialog"]'))
    .some((dialog) => {
      if (dialog.tagName === 'DIALOG' && !dialog.hasAttribute('open')) return false;
      if (dialog.closest('[hidden], [inert], [aria-hidden="true"]')) return false;
      for (let element: HTMLElement | null = dialog; element; element = element.parentElement) {
        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse') return false;
      }
      return true;
    });
}

/**
 * Optional page shortcuts. Native radios keep their normal arrow/Space behavior;
 * the hook never changes focus. After advancing, the page owns question-heading
 * focus. Gate `enabled` while loading, transitioning, or showing another screen.
 */
export function useAssessmentKeyboard(options: AssessmentKeyboardOptions): void {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (!options.enabled || typeof document === 'undefined') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const current = optionsRef.current;
      if (!current.enabled || current.isDialogOpen || event.defaultPrevented || event.repeat || event.isComposing
        || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.key !== 'Enter' && !/^[1-5]$/.test(event.key)) return;

      const target = event.target instanceof Element ? event.target : null;
      const editable = target?.closest<HTMLElement>('[contenteditable]');
      if (target?.closest(EDITABLE_CONTROL) || target?.closest('[inert]')
        || (editable && editable.getAttribute('contenteditable') !== 'false')) return;
      if (hasOpenDialog()) return;

      if (event.key === 'Enter') {
        // A focused button/link already handles Enter. Running the page action
        // here as well would skip a question or submit the final answer twice.
        if (!current.canContinue || target?.closest(ENTER_CONTROL)) return;
        event.preventDefault();
        current.onContinue();
        return;
      }

      const index = Number(event.key) - 1;
      if (index >= current.optionCount) return;
      event.preventDefault();
      current.selectByIndex(index);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [options.enabled]);
}
