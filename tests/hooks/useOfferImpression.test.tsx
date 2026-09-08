import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useOfferImpression } from '../../hooks/useOfferImpression';

class ObserverMock {
  static instances: ObserverMock[] = [];
  target: Element | null = null;
  disconnect = vi.fn();
  constructor(private callback: IntersectionObserverCallback) {
    ObserverMock.instances.push(this);
  }
  observe(target: Element) { this.target = target; }
  emit(isIntersecting: boolean, intersectionRatio = isIntersecting ? 1 : 0) {
    this.callback([{ target: this.target, isIntersecting, intersectionRatio } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
}

function Offer({ eventKey = 'result-1_insight_default', enabled = true, onImpression }: {
  eventKey?: string;
  enabled?: boolean;
  onImpression: () => void;
}) {
  const ref = useOfferImpression({ impressionKey: eventKey, enabled, onImpression });
  return <section ref={ref} data-testid="offer">Report offer</section>;
}

describe('offer impressions', () => {
  beforeEach(() => {
    ObserverMock.instances = [];
    vi.stubGlobal('IntersectionObserver', ObserverMock);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('waits for actual exposure and does not count scrolling past the same offer twice', () => {
    const onImpression = vi.fn();
    render(<Offer onImpression={onImpression} />);
    const observer = ObserverMock.instances[0];
    expect(observer.target).toBe(screen.getByTestId('offer'));
    expect(onImpression).not.toHaveBeenCalled();
    act(() => observer.emit(false));
    expect(onImpression).not.toHaveBeenCalled();
    act(() => observer.emit(true));
    act(() => { observer.emit(false); observer.emit(true); });
    expect(onImpression).toHaveBeenCalledTimes(1);
    expect(observer.disconnect).toHaveBeenCalled();
  });

  it('counts a tall mobile card even when only a small portion fits in view', () => {
    const onImpression = vi.fn();
    render(<Offer onImpression={onImpression} />);
    // E.g. 180 visible pixels of a 3,000-pixel offer: a 50% threshold would
    // never fire on a mobile viewport, despite the visitor reading the offer.
    act(() => ObserverMock.instances[0].emit(true, 180 / 3000));
    expect(onImpression).toHaveBeenCalledTimes(1);
  });

  it('deduplicates the result, tier and context key while allowing a new key', () => {
    const onImpression = vi.fn();
    const view = render(<Offer onImpression={onImpression} />);
    act(() => ObserverMock.instances[0].emit(true));
    view.rerender(<Offer eventKey="result-1_mastery_work" onImpression={onImpression} />);
    expect(onImpression).toHaveBeenCalledTimes(1);
    act(() => ObserverMock.instances[1].emit(true));
    view.rerender(<Offer onImpression={onImpression} />);
    expect(ObserverMock.instances).toHaveLength(2);
    expect(onImpression).toHaveBeenCalledTimes(2);
  });

  it('waits for eligibility and uses the latest callback without restarting the observer', () => {
    const initial = vi.fn();
    const latest = vi.fn();
    const view = render(<Offer enabled={false} onImpression={initial} />);
    expect(ObserverMock.instances).toHaveLength(0);
    view.rerender(<Offer enabled onImpression={initial} />);
    view.rerender(<Offer enabled onImpression={latest} />);
    expect(ObserverMock.instances).toHaveLength(1);
    act(() => ObserverMock.instances[0].emit(true));
    expect(initial).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledTimes(1);
  });

  it('ignores queued notifications after unmount', () => {
    const onImpression = vi.fn();
    const view = render(<Offer onImpression={onImpression} />);
    const observer = ObserverMock.instances[0];
    view.unmount();
    act(() => observer.emit(true));
    expect(observer.disconnect).toHaveBeenCalled();
    expect(onImpression).not.toHaveBeenCalled();
  });

  it('rejects a queued intersecting notification after its containing tab is hidden', () => {
    const onImpression = vi.fn();
    const view = render(<div><Offer onImpression={onImpression} /></div>);
    const observer = ObserverMock.instances[0];
    view.rerender(<div hidden><Offer onImpression={onImpression} /></div>);
    act(() => observer.emit(true));
    expect(onImpression).not.toHaveBeenCalled();
    view.rerender(<div><Offer onImpression={onImpression} /></div>);
    act(() => observer.emit(true));
    expect(onImpression).toHaveBeenCalledTimes(1);
  });

  it('waits for a background tab to become visible', () => {
    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    const onImpression = vi.fn();
    render(<Offer onImpression={onImpression} />);
    act(() => ObserverMock.instances[0].emit(true));
    expect(onImpression).not.toHaveBeenCalled();
    visibility.mockReturnValue('visible');
    fireEvent(document, new Event('visibilitychange'));
    expect(onImpression).toHaveBeenCalledTimes(1);
  });

  it('measures actual bounds on scroll when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const bounds = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      top: window.innerHeight + 10, bottom: window.innerHeight + 3010,
      left: 0, right: 360, width: 360, height: 3000,
    } as DOMRect);
    const onImpression = vi.fn();
    render(<Offer onImpression={onImpression} />);
    expect(onImpression).not.toHaveBeenCalled();
    bounds.mockReturnValue({
      top: 200, bottom: 3200, left: 0, right: 360, width: 360, height: 3000,
    } as DOMRect);
    fireEvent.scroll(window);
    fireEvent.resize(window);
    expect(onImpression).toHaveBeenCalledTimes(1);
  });
});
