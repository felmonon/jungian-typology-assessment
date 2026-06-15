import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './styles/globals.css';
import App from './App';
import { initAnalytics } from './lib/analytics';

const queryClient = new QueryClient();

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);

const startAnalytics = () => {
  initAnalytics();
};

const scheduleAnalytics = () => {
  window.setTimeout(() => {
    const idleWindow = window as typeof window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number;
    };

    if (idleWindow.requestIdleCallback) {
      idleWindow.requestIdleCallback(startAnalytics, { timeout: 2000 });
      return;
    }

    startAnalytics();
  }, 2500);
};

if (document.readyState === 'complete') {
  scheduleAnalytics();
} else {
  window.addEventListener('load', scheduleAnalytics, { once: true });
}

// Signal to prerenderer that the page is ready to be captured
// This runs after React has finished initial render
setTimeout(() => {
  document.dispatchEvent(new Event('render-complete'));
}, 500);
