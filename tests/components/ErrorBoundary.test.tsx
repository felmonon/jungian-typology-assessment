import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from '../../components/ErrorBoundary';

const Broken = (): never => {
  throw new Error('chunk failed to load');
};

describe('page error boundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders its children when nothing fails', () => {
    render(<ErrorBoundary resetKey="/a"><p>Working page</p></ErrorBoundary>);
    expect(screen.getByText('Working page')).toBeVisible();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows a recoverable screen instead of a blank page when a page throws', () => {
    render(<ErrorBoundary resetKey="/a"><Broken /></ErrorBoundary>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('This page did not load.');
    expect(screen.getByRole('button', { name: 'Reload page' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Go to home' })).toBeEnabled();
    expect(screen.getByRole('link', { name: /support@/ })).toHaveAttribute('href', expect.stringMatching(/^mailto:/));
    expect(alert).not.toHaveTextContent('chunk failed to load');
  });

  it('clears the error once the visitor navigates to another page', () => {
    const { rerender } = render(<ErrorBoundary resetKey="/a"><Broken /></ErrorBoundary>);
    expect(screen.getByRole('alert')).toBeVisible();
    rerender(<ErrorBoundary resetKey="/b"><p>Next page</p></ErrorBoundary>);
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByText('Next page')).toBeVisible();
  });
});
