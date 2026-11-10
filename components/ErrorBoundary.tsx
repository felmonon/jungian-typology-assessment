import { Component, ErrorInfo, ReactNode } from 'react';
import { Home, RefreshCw } from 'lucide-react';
import { Button } from './ui/Button';
import { SUPPORT_EMAIL } from '../data/support';

interface Props {
  children: ReactNode;
  /** Changing this value clears a previous error, e.g. after navigating to another page. */
  resetKey?: string;
}

interface State {
  hasError: boolean;
  resetKey?: string;
}

/**
 * Catches render errors (including a lazy page chunk that fails to load after a
 * new deploy) and shows a recoverable screen instead of a blank page.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, resetKey: this.props.resetKey };

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    if (props.resetKey === state.resetKey) return null;
    return { hasError: false, resetKey: props.resetKey };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Page failed to render:', error, errorInfo);
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="lab-container flex min-h-[calc(100svh-5rem)] items-center justify-center py-16">
        <div role="alert" className="w-full max-w-lg rounded-2xl border border-jung-border bg-jung-surface p-8 text-center">
          <h1 className="font-display text-3xl text-jung-dark">This page did not load.</h1>
          <p className="mt-4 text-sm leading-7 text-jung-secondary">
            Reloading usually fixes it. Your saved map and answers stay on this device.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button variant="accent" onClick={() => window.location.reload()} leftIcon={<RefreshCw className="h-4 w-4" />}>
              Reload page
            </Button>
            <Button variant="outline" onClick={() => window.location.assign('/')} leftIcon={<Home className="h-4 w-4" />}>
              Go to home
            </Button>
          </div>
          <p className="mt-6 text-xs leading-6 text-jung-muted">
            Still stuck? Email <a className="underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
          </p>
        </div>
      </div>
    );
  }
}
