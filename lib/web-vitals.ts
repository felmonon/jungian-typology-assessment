// Vercel Web Vitals tracking for Core Web Vitals monitoring
// This file captures performance metrics and sends them to Vercel Analytics

type Metric = {
  name: string;
  value: number;
  delta: number;
  rating: string;
  id: string;
};

// Extended PerformanceEntry types for web vitals
interface LargestContentfulPaintEntry extends PerformanceEntry {
  renderTime?: number;
  loadTime?: number;
}

interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput?: boolean;
}

interface EventTimingEntry extends PerformanceEntry {
  processingDuration?: number;
}

// Send metrics to Vercel endpoint
function sendMetricToVercel(metric: Metric) {
  // Queue for batching (send in batches to reduce requests)
  if (typeof navigator === 'undefined' || !navigator.sendBeacon) {
    return;
  }

  const body = JSON.stringify(metric);

  // Use sendBeacon for reliability - doesn't require waiting for response
  navigator.sendBeacon(
    `${typeof window !== 'undefined' ? window.location.origin : ''}/api/analytics`,
    body
  );
}

// Initialize Web Vitals tracking
export function initWebVitals() {
  try {
    // Use the Web Vitals library if available, otherwise use native APIs
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Observer for Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1] as LargestContentfulPaintEntry;

        if (lastEntry) {
          sendMetricToVercel({
            name: 'LCP',
            value: lastEntry.renderTime || lastEntry.loadTime || 0,
            delta: 0,
            rating: 'good',
            id: `lcp-${Date.now()}`,
          });
        }
      });

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] as any });
      } catch (e) {
        console.debug('LCP observer not supported');
      }

      // Observer for Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          const layoutShift = entry as LayoutShiftEntry;
          if (!layoutShift.hadRecentInput) {
            clsValue += layoutShift.value || 0;
            sendMetricToVercel({
              name: 'CLS',
              value: clsValue,
              delta: layoutShift.value || 0,
              rating: 'good',
              id: `cls-${Date.now()}`,
            });
          }
        }
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] as any });
      } catch (e) {
        console.debug('CLS observer not supported');
      }

      // Observer for First Input Delay (FID) / Interaction to Next Paint (INP)
      const inpObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          const eventTiming = entry as EventTimingEntry;
          const processingDuration = eventTiming.processingDuration || 0;
          sendMetricToVercel({
            name: 'INP',
            value: processingDuration,
            delta: processingDuration,
            rating: 'good',
            id: `inp-${Date.now()}`,
          });
        }
      });

      try {
        inpObserver.observe({ entryTypes: ['first-input', 'event'] as any });
      } catch (e) {
        console.debug('INP observer not supported');
      }
    }

    // Track page load performance
    if (typeof window !== 'undefined' && window.performance) {
      window.addEventListener('load', () => {
        const perfData = (window.performance as any).timing;
        if (perfData) {
          const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;

          sendMetricToVercel({
            name: 'PAGE_LOAD',
            value: pageLoadTime,
            delta: pageLoadTime,
            rating: 'good',
            id: `page-load-${Date.now()}`,
          });
        }
      });
    }
  } catch (error) {
    console.debug('Web Vitals initialization failed:', error);
  }
}

// Export utility function to manually track custom metrics
export function trackMetric(name: string, value: number, delta?: number) {
  sendMetricToVercel({
    name,
    value,
    delta: delta || value,
    rating: 'good',
    id: `custom-${name}-${Date.now()}`,
  });
}
