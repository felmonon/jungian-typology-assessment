import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useAssessmentKeyboard, type AssessmentKeyboardOptions } from '../../hooks/useAssessmentKeyboard';

function Assessment({ children, ...options }: AssessmentKeyboardOptions & { children?: React.ReactNode }) {
  useAssessmentKeyboard(options);
  return <main><h1 tabIndex={-1}>Current question</h1>{children}</main>;
}

const createOptions = (): AssessmentKeyboardOptions => ({
  enabled: true,
  optionCount: 5,
  selectByIndex: vi.fn(),
  canContinue: true,
  onContinue: vi.fn(),
});

afterEach(cleanup);

describe('assessment keyboard shortcuts', () => {
  it('selects the visible option with 1–5 without advancing or moving focus', () => {
    const options = createOptions();
    render(<Assessment {...options} />);
    const heading = screen.getByRole('heading');
    heading.focus();
    for (let key = 1; key <= 5; key++) fireEvent.keyDown(heading, { key: String(key) });
    expect(vi.mocked(options.selectByIndex).mock.calls).toEqual([[0], [1], [2], [3], [4]]);
    expect(options.onContinue).not.toHaveBeenCalled();
    expect(heading).toHaveFocus();
  });

  it('uses the current question options and refuses out-of-range shortcuts', () => {
    const previous = createOptions();
    const view = render(<Assessment {...previous} />);
    const next = { ...createOptions(), optionCount: 2 };
    view.rerender(<Assessment {...next} />);
    for (const key of ['0', '3', '4', '5', '6', 'ArrowDown', ' ']) fireEvent.keyDown(document, { key });
    expect(next.selectByIndex).not.toHaveBeenCalled();
    fireEvent.keyDown(document, { key: '2' });
    expect(next.selectByIndex).toHaveBeenCalledWith(1);
    expect(previous.selectByIndex).not.toHaveBeenCalled();
  });

  it('advances with Enter only after the current question is complete', () => {
    const options = createOptions();
    const view = render(<Assessment {...options} canContinue={false} />);
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(options.onContinue).not.toHaveBeenCalled();
    view.rerender(<Assessment {...options} />);
    expect(fireEvent.keyDown(document, { key: 'Enter' })).toBe(false);
    expect(options.onContinue).toHaveBeenCalledTimes(1);
  });

  it.each(['button', 'a', 'summary'] as const)('leaves native Enter behavior on %s to the control', (tag) => {
    const options = createOptions();
    const native = tag === 'button'
      ? <button onClick={options.onContinue}><span>Continue</span></button>
      : tag === 'a'
        ? <a href="#help" onClick={options.onContinue}><span>Continue</span></a>
        : <details><summary onClick={options.onContinue}><span>Continue</span></summary></details>;
    render(<Assessment {...options}>{native}</Assessment>);
    const content = screen.getByText('Continue');
    expect(fireEvent.keyDown(content, { key: 'Enter' })).toBe(true);
    expect(options.onContinue).not.toHaveBeenCalled();
    fireEvent.click(content);
    expect(options.onContinue).toHaveBeenCalledTimes(1);
  });

  it('preserves native radio navigation and typing in form fields', () => {
    const options = createOptions();
    render(<Assessment {...options}>
      <input type="radio" aria-label="First answer" />
      <input aria-label="Name" />
      <textarea aria-label="Notes" />
      <select aria-label="Country"><option>Canada</option></select>
      <div contentEditable suppressContentEditableWarning><span>Editable text</span></div>
    </Assessment>);
    const controls = [screen.getByRole('radio'), screen.getByRole('textbox', { name: 'Name' }),
      screen.getByRole('textbox', { name: 'Notes' }), screen.getByRole('combobox'), screen.getByText('Editable text')];
    for (const control of controls) {
      for (const key of ['1', 'Enter', 'ArrowRight', ' ']) expect(fireEvent.keyDown(control, { key })).toBe(true);
    }
    expect(options.selectByIndex).not.toHaveBeenCalled();
    expect(options.onContinue).not.toHaveBeenCalled();
  });

  it('leaves Enter to an ARIA radio and does not intercept other handled shortcuts', () => {
    const options = createOptions();
    render(<Assessment {...options}>
      <div role="radio" aria-checked="false" tabIndex={0}>Custom answer</div>
      <div onKeyDown={(event) => event.preventDefault()}>Handles its own keys</div>
    </Assessment>);
    expect(fireEvent.keyDown(screen.getByRole('radio'), { key: 'Enter' })).toBe(true);
    fireEvent.keyDown(screen.getByText('Handles its own keys'), { key: '1' });
    expect(options.selectByIndex).not.toHaveBeenCalled();
    expect(options.onContinue).not.toHaveBeenCalled();
  });

  it('ignores modifiers, composition, and held keys', () => {
    const options = createOptions();
    render(<Assessment {...options} />);
    for (const modifier of ['altKey', 'ctrlKey', 'metaKey', 'shiftKey', 'isComposing', 'repeat']) {
      for (const key of ['1', 'Enter']) expect(fireEvent.keyDown(document, { key, [modifier]: true })).toBe(true);
    }
    expect(options.selectByIndex).not.toHaveBeenCalled();
    expect(options.onContinue).not.toHaveBeenCalled();
  });

  it('pauses while disabled or an explicitly managed dialog is open', () => {
    const options = createOptions();
    const view = render(<Assessment {...options} enabled={false} />);
    fireEvent.keyDown(document, { key: '1' });
    view.rerender(<Assessment {...options} isDialogOpen />);
    fireEvent.keyDown(document, { key: '1' });
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(options.selectByIndex).not.toHaveBeenCalled();
    expect(options.onContinue).not.toHaveBeenCalled();
    view.rerender(<Assessment {...options} />);
    fireEvent.keyDown(document, { key: '1' });
    expect(options.selectByIndex).toHaveBeenCalledTimes(1);
  });

  it('also pauses for a visible dialog in the document, including before focus reaches it', () => {
    const options = createOptions();
    const view = render(<Assessment {...options}><dialog open>Take a break?</dialog></Assessment>);
    fireEvent.keyDown(document, { key: '1' });
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(options.selectByIndex).not.toHaveBeenCalled();
    expect(options.onContinue).not.toHaveBeenCalled();
    view.rerender(<Assessment {...options}><section role="dialog" aria-modal="true">Leave?</section></Assessment>);
    fireEvent.keyDown(document, { key: '1' });
    expect(options.selectByIndex).not.toHaveBeenCalled();
    view.rerender(<Assessment {...options}><div style={{ display: 'none' }}><section role="dialog">Closed dialog</section></div></Assessment>);
    fireEvent.keyDown(document, { key: '1' });
    expect(options.selectByIndex).toHaveBeenCalledTimes(1);
  });

  it('removes shortcuts on unmount', () => {
    const options = createOptions();
    const view = render(<Assessment {...options} />);
    view.unmount();
    fireEvent.keyDown(document, { key: '1' });
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(options.selectByIndex).not.toHaveBeenCalled();
    expect(options.onContinue).not.toHaveBeenCalled();
  });
});
