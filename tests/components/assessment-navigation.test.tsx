import React from 'react';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Assessment } from '../../pages/Assessment';
import { depthQuestions } from '../../data/depthAssessment';
import { ASSESSMENT_PROGRESS_STORAGE_KEY } from '../../lib/assessment-progress';

vi.mock('../../hooks/use-auth', () => ({
  useAuth: () => ({ user: null, isLoading: false }),
}));
vi.mock('../../hooks/useAnalytics', () => ({
  useAssessmentTracking: () => ({
    trackStart: vi.fn(),
    trackProgress: vi.fn(),
    trackComplete: vi.fn(),
  }),
}));
vi.mock('../../lib/analytics', () => ({ trackEvent: vi.fn() }));

beforeEach(() => {
  for (const name of ['localStorage', 'sessionStorage']) {
    const entries = new Map<string, string>();
    vi.stubGlobal(name, {
      getItem: (key: string) => entries.get(key) ?? null,
      setItem: (key: string, value: string) => entries.set(key, String(value)),
      removeItem: (key: string) => entries.delete(key),
      clear: () => entries.clear(),
    });
  }
  window.matchMedia = vi
    .fn()
    .mockReturnValue({
      matches: false,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  window.scrollTo = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
const openAssessment = () =>
  render(
    <MemoryRouter initialEntries={['/assessment']}>
      <Assessment />
    </MemoryRouter>,
  );

describe('assessment navigation', () => {
  it('shows the first question immediately and prevents continuing without an answer', async () => {
    openAssessment();
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: depthQuestions[0].prompt }),
      ).toBeVisible(),
    );
    expect(screen.getAllByRole('group')).toHaveLength(1);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Next question' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Next question' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Choose an answer');
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: depthQuestions[0].prompt }),
      ).toBeVisible(),
    );
  });

  it('keeps a selected answer when the user goes forward and back', async () => {
    openAssessment();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Next question' })).toBeEnabled());
    const answer = screen.getAllByRole('radio')[0] as HTMLInputElement;
    const label = answer.closest('label')!.textContent!;
    fireEvent.click(answer);
    expect(answer).toBeChecked();
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: depthQuestions[0].prompt }),
      ).toBeVisible(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Next question' }));
    await screen.findByRole('heading', { name: depthQuestions[1].prompt });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Back' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    await screen.findByRole('heading', { name: depthQuestions[0].prompt });
    await waitFor(() =>
      expect(screen.getByRole('radio', { name: label })).toBeChecked(),
    );
  });

  it('resumes legacy desktop saves at the first unanswered question', async () => {
    const answers = Object.fromEntries(
      depthQuestions
        .slice(0, 12)
        .map((question) => [question.id, question.options[0].id]),
    );
    localStorage.setItem(
      ASSESSMENT_PROGRESS_STORAGE_KEY,
      JSON.stringify({ answers, currentPage: 2 }),
    );
    openAssessment();
    await screen.findByRole('heading', { name: depthQuestions[12].prompt });
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '12',
    );
    expect(screen.getByText(/Your 12 answers are saved/)).toBeVisible();
  });

  it('selects the displayed option with number keys without skipping the prompt or answering during its transition', async () => {
    openAssessment();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Next question' })).toBeEnabled());
    const first = screen.getByRole('heading', { name: depthQuestions[0].prompt });
    first.focus();
    const displayedAnswer = screen.getAllByRole('radio')[1] as HTMLInputElement;
    fireEvent.keyDown(first, { key: '2' });
    expect(displayedAnswer).toBeChecked();
    expect(screen.getByRole('heading', { name: depthQuestions[0].prompt })).toBeVisible();
    expect(JSON.parse(localStorage.getItem(ASSESSMENT_PROGRESS_STORAGE_KEY)!).answers[depthQuestions[0].id])
      .toBe(displayedAnswer.value);

    fireEvent.keyDown(first, { key: 'Enter' });
    fireEvent.keyDown(document, { key: '1' });
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(JSON.parse(localStorage.getItem(ASSESSMENT_PROGRESS_STORAGE_KEY)!).answers[depthQuestions[1].id])
      .toBeUndefined();
    const second = await screen.findByRole('heading', { name: depthQuestions[1].prompt });
    await waitFor(() => expect(second).toHaveFocus());
    await waitFor(() => expect(screen.getByRole('button', { name: 'Next question' })).toBeEnabled());
    expect(screen.getAllByRole('radio').every((radio) => !(radio as HTMLInputElement).checked)).toBe(true);

    fireEvent.keyDown(second, { key: '1' });
    expect(screen.getAllByRole('radio')[0]).toBeChecked();
    const continueButton = screen.getByRole('button', { name: 'Next question' });
    continueButton.focus();
    expect(fireEvent.keyDown(continueButton, { key: 'Enter' })).toBe(true);
    expect(screen.getByRole('heading', { name: depthQuestions[1].prompt })).toBeVisible();
    // Simulate the button's native activation separately: the page shortcut
    // must not already have advanced before that click arrives.
    fireEvent.click(continueButton);
    await screen.findByRole('heading', { name: depthQuestions[2].prompt });
  });
});
