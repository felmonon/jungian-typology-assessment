import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useActiveSection } from '../../hooks/useActiveSection';

class ObserverMock {
  static instances: ObserverMock[] = [];
  targets: Element[] = [];
  disconnect = vi.fn();
  constructor(private callback: IntersectionObserverCallback) { ObserverMock.instances.push(this); }
  observe(target: Element) { this.targets.push(target); }
  emit() { this.callback([], this as unknown as IntersectionObserver); }
}

let positions: Record<string, { top: number; height: number }>;
let frames: Map<number, FrameRequestCallback>;

function flushFrames() {
  act(() => {
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach((callback) => callback(0));
  });
}

function Reader({ ids = ['map', 'reflection', 'report'], topOffset = 128 }: { ids?: string[]; topOffset?: number }) {
  const activeId = useActiveSection(ids, { topOffset });
  return <>
    <output aria-label="Active section">{activeId ?? 'none'}</output>
    {ids.map((id) => <section id={id} key={id}><h2 tabIndex={-1}>{id}</h2></section>)}
  </>;
}

beforeEach(() => {
  ObserverMock.instances = [];
  positions = {
    map: { top: 100, height: 1200 },
    reflection: { top: 1400, height: 600 },
    report: { top: 2100, height: 200 },
  };
  frames = new Map();
  let nextFrame = 0;
  vi.stubGlobal('IntersectionObserver', ObserverMock);
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    const id = ++nextFrame;
    frames.set(id, callback);
    return id;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => { frames.delete(id); });
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    const { top, height } = positions[this.id] ?? { top: 0, height: 0 };
    return { top, bottom: top + height, width: height ? 600 : 0, height, left: 0, right: 600 } as DOMRect;
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('active section navigation', () => {
  it('tracks rendered sections, stays on a tall section, and changes at the reading line', () => {
    render(<Reader />);
    const observer = ObserverMock.instances[0];
    expect(observer.targets.map((element) => element.id)).toEqual(['map', 'reflection', 'report']);
    expect(screen.getByLabelText('Active section')).toHaveTextContent('map');
    positions.map.top = -1100;
    positions.reflection.top = 200;
    act(() => observer.emit());
    expect(screen.getByLabelText('Active section')).toHaveTextContent('map');
    positions.reflection.top = 120;
    fireEvent.scroll(window);
    flushFrames();
    expect(screen.getByLabelText('Active section')).toHaveTextContent('reflection');
    positions.reflection.top = 150;
    fireEvent.scroll(window);
    flushFrames();
    expect(screen.getByLabelText('Active section')).toHaveTextContent('map');
  });

  it('batches scrolls, preserves keyboard focus, and never scrolls the page', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    render(<Reader />);
    const heading = screen.getByRole('heading', { name: 'map' });
    heading.focus();
    positions.reflection.top = 100;
    fireEvent.scroll(window);
    fireEvent.scroll(window);
    fireEvent.resize(window);
    expect(frames.size).toBe(1);
    flushFrames();
    expect(screen.getByLabelText('Active section')).toHaveTextContent('reflection');
    expect(heading).toHaveFocus();
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('highlights a short final section at the bottom even when it cannot reach the reading line', () => {
    vi.spyOn(document.documentElement, 'scrollHeight', 'get').mockReturnValue(2400);
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(2400 - window.innerHeight);
    positions.map.top = -1400;
    positions.reflection.top = -100;
    positions.report.top = 550;
    render(<Reader />);
    expect(screen.getByLabelText('Active section')).toHaveTextContent('report');
  });

  it('supports a different sticky-header height and works without IntersectionObserver', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    positions.reflection.top = 180;
    render(<Reader topOffset={200} />);
    expect(screen.getByLabelText('Active section')).toHaveTextContent('reflection');
    positions.report.top = 190;
    fireEvent.resize(window);
    flushFrames();
    expect(screen.getByLabelText('Active section')).toHaveTextContent('report');
  });

  it('reconnects for newly rendered sections but not a fresh array with the same IDs', () => {
    const view = render(<Reader ids={[]} />);
    expect(screen.getByLabelText('Active section')).toHaveTextContent('none');
    view.rerender(<Reader ids={['map', 'reflection']} />);
    const observer = ObserverMock.instances[1];
    expect(ObserverMock.instances[0].disconnect).toHaveBeenCalled();
    expect(observer.targets.map((element) => element.id)).toEqual(['map', 'reflection']);
    view.rerender(<Reader ids={['map', 'reflection']} />);
    expect(ObserverMock.instances).toHaveLength(2);
    expect(observer.disconnect).not.toHaveBeenCalled();
  });

  it('cancels work and removes listeners when unmounted', () => {
    const view = render(<Reader />);
    const observer = ObserverMock.instances[0];
    fireEvent.scroll(window);
    expect(frames.size).toBe(1);
    view.unmount();
    expect(frames.size).toBe(0);
    expect(observer.disconnect).toHaveBeenCalled();
    const measure = vi.mocked(HTMLElement.prototype.getBoundingClientRect);
    measure.mockClear();
    act(() => observer.emit());
    fireEvent.scroll(window);
    fireEvent.resize(window);
    expect(frames.size).toBe(0);
    expect(measure).not.toHaveBeenCalled();
  });

  it('renders a stable empty selection on the server', () => {
    vi.stubGlobal('window', undefined);
    vi.stubGlobal('document', undefined);
    expect(renderToString(<Reader />)).toContain('>none</output>');
    vi.unstubAllGlobals();
  });
});
