import { act, cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PersonalReportReader } from '../../components/results/PersonalReportReader';

const sections = [
  { key: 'overview', title: 'Pattern synthesis', body: 'Your existing generated overview.' },
  { key: 'relationships', title: 'Relationship pattern and repair', body: 'Your existing generated relationship reflection.' },
  { key: 'career', title: 'Work conditions and friction', body: 'Your existing generated work reflection.' },
];
let positions: Record<string, number>;

class ObserverMock {
  static instances: ObserverMock[] = [];
  constructor(private callback: IntersectionObserverCallback) { ObserverMock.instances.push(this); }
  observe() {}
  disconnect() {}
  emit() { this.callback([], this as unknown as IntersectionObserver); }
}

beforeEach(() => {
  positions = { 'report-overview': 148, 'report-relationships': 1100, 'report-career': 2100 };
  ObserverMock.instances = [];
  vi.stubGlobal('IntersectionObserver', ObserverMock);
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    const top = positions[this.id] ?? 0;
    const height = this.closest('[hidden]') ? 0 : 900;
    return { top, bottom: top + height, height, width: height ? 600 : 0, left: 0, right: 600 } as DOMRect;
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('personal report reader', () => {
  it('links its contents to the actual report and follows the section at the sticky navigation reading line', () => {
    render(<PersonalReportReader sections={sections} functionCodes={['Ti', 'Ne', 'Si', 'Fe']} />);
    const contents = screen.getByRole('navigation', { name: 'Your report contents' });
    for (const section of sections) {
      const link = within(contents).getByRole('link', { name: new RegExp(section.title) });
      expect(link).toHaveAttribute('href', `#report-${section.key}`);
      const article = document.getElementById(`report-${section.key}`)!;
      expect(within(article).getByRole('heading', { name: section.title })).toBeVisible();
      expect(within(article).getByText(section.body)).toBeVisible();
    }
    expect(within(contents).getByRole('link', { name: /Pattern synthesis/ })).toHaveAttribute('aria-current', 'location');
    positions = { 'report-overview': -1800, 'report-relationships': -852, 'report-career': 148 };
    act(() => ObserverMock.instances[0].emit());
    expect(within(contents).getByRole('link', { name: /Work conditions and friction/ })).toHaveAttribute('aria-current', 'location');
    expect(within(contents).getByRole('link', { name: /Pattern synthesis/ })).not.toHaveAttribute('aria-current');
  });

  it('picks up the active report section when its containing result pane becomes visible', () => {
    const view = render(<div hidden><PersonalReportReader sections={sections} functionCodes={['Ti', 'Ne', 'Si', 'Fe']} /></div>);
    expect(document.querySelector('[aria-current="location"]')).toBeNull();
    view.rerender(<div><PersonalReportReader sections={sections} functionCodes={['Ti', 'Ne', 'Si', 'Fe']} /></div>);
    act(() => ObserverMock.instances[0].emit());
    expect(screen.getByRole('link', { name: /Pattern synthesis/ })).toHaveAttribute('aria-current', 'location');
  });
});
