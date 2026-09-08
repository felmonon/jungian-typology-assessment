import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ReportSamplePreview } from '../../components/results/ReportSamplePreview';

function expectActiveTopic(label: string, title: string) {
  const tab = screen.getByRole('tab', { name: label });
  const panel = screen.getByRole('tabpanel', { name: label });
  expect(tab).toHaveAttribute('aria-selected', 'true');
  expect(tab).toHaveAttribute('tabindex', '0');
  expect(tab).toHaveAttribute('aria-controls', panel.id);
  expect(panel).toHaveAttribute('aria-labelledby', tab.id);
  expect(within(panel).getByRole('heading', { name: title })).toBeVisible();
  expect(within(panel).getByText(/Fictional Ti–Fe example, not your personal report/)).toBeVisible();
  expect(within(panel).getByText(/Your paid interpretation is AI-generated from your own assessment result/)).toBeVisible();
  for (const other of screen.getAllByRole('tab').filter(candidate => candidate !== tab)) {
    expect(other).toHaveAttribute('aria-selected', 'false');
    expect(other).toHaveAttribute('tabindex', '-1');
  }
  return tab;
}

describe('report sample exploration', () => {
  it('switches among all three excerpts while preserving their fictional disclosure and accessible panel label', () => {
    const onExplore = vi.fn();
    render(<ReportSamplePreview onExplore={onExplore} />);
    expect(screen.getByRole('tablist', { name: 'Explore report topics' })).toBeVisible();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
    expectActiveTopic('Stress', 'When clarity becomes distance');
    expect(onExplore).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('tab', { name: 'Relationships' }));
    expectActiveTopic('Relationships', 'Let people see the care behind the thought');
    expect(onExplore).toHaveBeenLastCalledWith('relationships');
    fireEvent.click(screen.getByRole('tab', { name: 'Work' }));
    expectActiveTopic('Work', 'The strength you reach for first');
    expect(onExplore).toHaveBeenLastCalledWith('work');
    fireEvent.click(screen.getByRole('tab', { name: 'Stress' }));
    expectActiveTopic('Stress', 'When clarity becomes distance');
    expect(onExplore).toHaveBeenLastCalledWith('stress');
    fireEvent.click(screen.getByRole('tab', { name: 'Stress' }));
    expect(onExplore).toHaveBeenCalledTimes(3);
  });

  it('supports arrow wrapping and Home/End while moving focus with the selected tab', () => {
    render(<ReportSamplePreview />);
    const stress = screen.getByRole('tab', { name: 'Stress' });
    stress.focus();
    fireEvent.keyDown(stress, { key: 'ArrowRight' });
    expect(expectActiveTopic('Relationships', 'Let people see the care behind the thought')).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: 'End' });
    expect(expectActiveTopic('Work', 'The strength you reach for first')).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' });
    expect(expectActiveTopic('Stress', 'When clarity becomes distance')).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowLeft' });
    expect(expectActiveTopic('Work', 'The strength you reach for first')).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: 'Home' });
    expect(expectActiveTopic('Stress', 'When clarity becomes distance')).toHaveFocus();
  });

  it('gives multiple previews distinct tab and panel IDs', () => {
    render(<><ReportSamplePreview /><ReportSamplePreview /></>);
    const activeTabs = screen.getAllByRole('tab', { name: 'Stress' });
    const panels = screen.getAllByRole('tabpanel', { name: 'Stress' });
    expect(new Set(activeTabs.map(tab => tab.id)).size).toBe(2);
    expect(new Set(panels.map(panel => panel.id)).size).toBe(2);
    activeTabs.forEach((tab, index) => expect(tab).toHaveAttribute('aria-controls', panels[index].id));
  });
});
