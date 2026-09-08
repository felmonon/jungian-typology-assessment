import { useRef } from 'react';

export type ResultView = 'overview' | 'map' | 'report' | 'save';

type ResultNavigationProps = {
  value: ResultView;
  onChange: (view: ResultView) => void;
  isPremium?: boolean;
};

const views: readonly ResultView[] = ['overview', 'map', 'report', 'save'];

export function resultViewForHash(hash: string): ResultView {
  if (hash === '#free-map') return 'map';
  if (hash === '#premium-report' || hash.startsWith('#report-')) return 'report';
  if (hash === '#save-share') return 'save';
  return 'overview';
}

export function ResultNavigation({ value, onChange, isPremium = false }: ResultNavigationProps) {
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const labels: Record<ResultView, string> = {
    overview: 'Overview',
    map: 'Function map',
    report: isPremium ? 'Your report' : 'Go deeper',
    save: 'Save & share',
  };

  const select = (index: number, focus = false) => {
    if (views[index] !== value) onChange(views[index]);
    if (focus) tabs.current[index]?.focus();
  };

  return (
    <div className="studio-result-nav" role="tablist" aria-label="Your results" aria-orientation="horizontal">
      {views.map((view, index) => (
        <button
          key={view}
          ref={(element) => { tabs.current[index] = element; }}
          type="button"
          role="tab"
          id={`result-tab-${view}`}
          aria-controls={`result-panel-${view}`}
          aria-selected={value === view}
          tabIndex={value === view ? 0 : -1}
          className={value === view ? 'is-active' : undefined}
          onClick={() => select(index)}
          onKeyDown={(event) => {
            if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
            const next = event.key === 'ArrowRight' ? (index + 1) % views.length
              : event.key === 'ArrowLeft' ? (index + views.length - 1) % views.length
                : event.key === 'Home' ? 0
                  : event.key === 'End' ? views.length - 1 : null;
            if (next === null) return;
            event.preventDefault();
            select(next, true);
          }}
        >
          {labels[view]}
        </button>
      ))}
    </div>
  );
}
