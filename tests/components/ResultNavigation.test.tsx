import { useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ResultNavigation, resultViewForHash, type ResultView } from '../../components/results/ResultNavigation';

function Results({ initial = 'overview', isPremium = false, onChange = () => {} }: {
  initial?: ResultView;
  isPremium?: boolean;
  onChange?: (view: ResultView) => void;
}) {
  const [value, setValue] = useState(initial);
  return <ResultNavigation value={value} isPremium={isPremium} onChange={(view) => { setValue(view); onChange(view); }} />;
}

function expectSelected(name: string, view: ResultView) {
  const selected = screen.getByRole('tab', { name });
  expect(selected).toHaveAttribute('aria-selected', 'true');
  expect(selected).toHaveAttribute('tabindex', '0');
  expect(selected).toHaveAttribute('id', `result-tab-${view}`);
  expect(selected).toHaveAttribute('aria-controls', `result-panel-${view}`);
  for (const tab of screen.getAllByRole('tab').filter((candidate) => candidate !== selected)) {
    expect(tab).toHaveAttribute('aria-selected', 'false');
    expect(tab).toHaveAttribute('tabindex', '-1');
  }
  return selected;
}

afterEach(cleanup);

describe('result navigation', () => {
  it('provides four linked tabs with only the selected view in the tab sequence', () => {
    render(<Results initial="map" />);
    expect(screen.getByRole('tablist', { name: 'Your results' })).toBeVisible();
    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual(['Overview', 'Function map', 'Go deeper', 'Save & share']);
    expectSelected('Function map', 'map');
  });

  it('selects views on click and labels the premium report appropriately', () => {
    const onChange = vi.fn();
    render(<Results isPremium onChange={onChange} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Your report' }));
    expectSelected('Your report', 'report');
    expect(onChange).toHaveBeenLastCalledWith('report');
    fireEvent.click(screen.getByRole('tab', { name: 'Save & share' }));
    expectSelected('Save & share', 'save');
    expect(onChange).toHaveBeenLastCalledWith('save');
    fireEvent.click(screen.getByRole('tab', { name: 'Save & share' }));
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('moves selection and focus with Left/Right, wraps, and supports Home/End', () => {
    const onChange = vi.fn();
    render(<Results onChange={onChange} />);
    screen.getByRole('tab', { name: 'Overview' }).focus();
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' });
    expect(expectSelected('Function map', 'map')).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: 'End' });
    expect(expectSelected('Save & share', 'save')).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' });
    expect(expectSelected('Overview', 'overview')).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowLeft' });
    expect(expectSelected('Save & share', 'save')).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: 'Home' });
    expect(expectSelected('Overview', 'overview')).toHaveFocus();
    expect(onChange.mock.calls).toEqual([['map'], ['save'], ['overview'], ['save'], ['overview']]);
  });

  it('leaves Tab and modified navigation keys to the browser', () => {
    const onChange = vi.fn();
    render(<Results onChange={onChange} />);
    const overview = screen.getByRole('tab', { name: 'Overview' });
    overview.focus();
    expect(fireEvent.keyDown(overview, { key: 'Tab' })).toBe(true);
    for (const modifier of ['altKey', 'ctrlKey', 'metaKey', 'shiftKey']) {
      expect(fireEvent.keyDown(overview, { key: 'ArrowRight', [modifier]: true })).toBe(true);
    }
    expect(onChange).not.toHaveBeenCalled();
    expect(expectSelected('Overview', 'overview')).toHaveFocus();
  });

  it('follows external view changes without stealing focus', () => {
    const onChange = vi.fn();
    const view = render(<ResultNavigation value="overview" onChange={onChange} />);
    const overview = screen.getByRole('tab', { name: 'Overview' });
    overview.focus();
    view.rerender(<ResultNavigation value="report" isPremium onChange={onChange} />);
    expectSelected('Your report', 'report');
    expect(overview).toHaveFocus();
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('result hash destinations', () => {
  it.each([
    ['#free-map', 'map'],
    ['#premium-report', 'report'],
    ['#report-offer', 'report'],
    ['#report-purchase', 'report'],
    ['#report-stress', 'report'],
    ['#report-relationships', 'report'],
    ['#save-share', 'save'],
    ['', 'overview'],
    ['#overview', 'overview'],
    ['#unknown', 'overview'],
    ['#reporting', 'overview'],
    ['#free-map-extra', 'overview'],
  ] as const)('maps %s to %s', (hash, expected) => {
    expect(resultViewForHash(hash)).toBe(expected);
  });
});
