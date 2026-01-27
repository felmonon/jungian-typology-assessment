// Vercel Web Vitals tracking for Core Web Vitals monitoring
// This file captures performance metrics and sends them to Vercel Analytics

type Metric = {
    name: string;
    value: number;
    delta: number;
    rating: string;
    id: string;
};

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
      if (typeof window !== 'undefined' && 'web-vital' in window) {
              // Observer for Largest Contentful Paint (LCP)
            const lcpObserver = new PerformanceObserver((entryList) => {
                      const entries = entryList.getEntries();
                      const lastEntry = entries[entries.length - 1];

                                                                sendMetricToVercel({
                                                                            name: 'LCP',
                                                                            value: lastEntry.renderTime || lastEntry.loadTime,
                                                                            delta: 0,
                                                                            rating: 'good',
                                                                            id: `lcp-${Date.now()}`,
                                                                });
            });

            try {
                      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                      console.debug('LCP observer not supported');
            }

            // Observer for Cumulative Layout Shift (CLS)
            let clsValue = 0;
              const clsObserver = new PerformanceObserver((entryList) => {
                        for (const entry of entryList.getEntries()) {
                                    if (!entry.hadRecentInput) {
                                                  clsValue += (entry as any).value;
                                                  sendMetricToVercel({
                                                                  name: 'CLS',
                                                                  value: clsValue,
                                                                  delta: (entry as any).value,
                                                                  rating: 'good',
                                                                  id: `cls-${Date.now()}`,
                                                  });
                                    }
                        }
              });

            try {
                      clsObserver.observe({ entryTypes: ['layout-shift'] });
            } catch (e) {
                      console.debug('CLS observer not supported');
            }

            // Observer for First Input Delay (FID) / Interaction to Next Paint (INP)
            const inpObserver = new PerformanceObserver((entryList) => {
                      for (const entry of entryList.getEntries()) {
                                  sendMetricToVercel({
                                                name: 'INP',
                                                value: (entry as any).processingDuration,
                                                delta: (entry as any).processingDuration,
                                                rating: 'good',
                                                id: `inp-${Date.now()}`,
                                  });
                      }
            });

            try {
                      inpObserver.observe({ entryTypes: ['first-input', 'event'] });
            } catch (e) {
                      console.debug('INP observer not supported');
            }
      }

      // Track page load performance
      if (typeof window !== 'undefined' && window.performance) {
              window.addEventListener('load', () => {
                        const perfData = window.performance.timing;
                        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;

                                              sendMetricToVercel({
                                                          name: 'PAGE_LOAD',
                                                          value: pageLoadTime,
                                                          delta: pageLoadTime,
                                                          rating: 'good',
                                                          id: `page-load-${Date.now()}`,
                                              });
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
