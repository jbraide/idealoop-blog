/**
 * Performance Monitoring Utilities
 * Tools for monitoring and optimizing application performance
 */

interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
}

interface PerformanceObserverEntry {
  name: string;
  value: number;
  timestamp: number;
}

/**
 * Initialize performance monitoring
 */
export function initializePerformanceMonitoring(): void {
  if (typeof window === "undefined") return;

  // Track Core Web Vitals
  trackCoreWebVitals();

  // Track custom performance metrics
  trackCustomMetrics();

  // Track resource loading performance
  trackResourcePerformance();

  // Track navigation timing
  trackNavigationTiming();
}

/**
 * Track Core Web Vitals
 */
function trackCoreWebVitals(): void {
  if (typeof window === "undefined" || !("PerformanceObserver" in window))
    return;

  try {
    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];

      if (lastEntry) {
        const metric = {
          name: "LCP",
          value: lastEntry.startTime,
          timestamp: Date.now(),
        };
        reportPerformanceMetric(metric);
      }
    });
    lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();

      entries.forEach((entry) => {
        const performanceEntry = entry as PerformanceEventTiming;
        const metric = {
          name: "FID",
          value: performanceEntry.processingStart - performanceEntry.startTime,
          timestamp: Date.now(),
        };
        reportPerformanceMetric(metric);
      });
    });
    fidObserver.observe({ type: "first-input", buffered: true });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    let clsEntries: PerformanceEntry[] = [];

    const clsObserver = new PerformanceObserver((entryList) => {
      clsEntries.push(...entryList.getEntries());

      // Only count layout shifts without recent user input
      clsEntries = clsEntries.filter((entry) => !(entry as any).hadRecentInput);

      clsValue = clsEntries.reduce(
        (sum, entry) => sum + ((entry as any).value || 0),
        0,
      );

      const metric = {
        name: "CLS",
        value: clsValue,
        timestamp: Date.now(),
      };
      reportPerformanceMetric(metric);
    });
    clsObserver.observe({ type: "layout-shift", buffered: true });
  } catch (error) {
    console.warn("Performance monitoring initialization failed:", error);
  }
}

/**
 * Track custom performance metrics
 */
function trackCustomMetrics(): void {
  if (typeof window === "undefined") return;

  // Track page load time
  window.addEventListener("load", () => {
    const loadTime =
      performance.timing.loadEventEnd - performance.timing.navigationStart;

    const metric = {
      name: "PageLoad",
      value: loadTime,
      timestamp: Date.now(),
    };
    reportPerformanceMetric(metric);
  });

  // Track time to first byte
  const ttfb =
    performance.timing.responseStart - performance.timing.navigationStart;
  if (ttfb > 0) {
    const metric = {
      name: "TTFB",
      value: ttfb,
      timestamp: Date.now(),
    };
    reportPerformanceMetric(metric);
  }
}

/**
 * Track resource loading performance
 */
function trackResourcePerformance(): void {
  if (typeof window === "undefined" || !("PerformanceObserver" in window))
    return;

  const resourceObserver = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();

    entries.forEach((entry) => {
      // Only track slow resources (over 1 second)
      if (entry.duration > 1000) {
        const metric = {
          name: "SlowResource",
          value: entry.duration,
          timestamp: Date.now(),
          details: {
            resource: entry.name,
            type: entry.entryType,
            size: (entry as any).transferSize || 0,
          },
        };
        reportPerformanceMetric(metric);
      }
    });
  });

  resourceObserver.observe({ type: "resource", buffered: true });
}

/**
 * Track navigation timing
 */
function trackNavigationTiming(): void {
  if (typeof window === "undefined") return;

  const navigation = performance.getEntriesByType("navigation")[0] as any;

  if (navigation) {
    const metrics = [
      {
        name: "DNSLookup",
        value: navigation.domainLookupEnd - navigation.domainLookupStart,
      },
      {
        name: "TCPHandshake",
        value: navigation.connectEnd - navigation.connectStart,
      },
      {
        name: "RequestResponse",
        value: navigation.responseEnd - navigation.requestStart,
      },
      {
        name: "DOMProcessing",
        value: navigation.domComplete - navigation.domInteractive,
      },
    ];

    metrics.forEach((metric) => {
      if (metric.value > 0) {
        reportPerformanceMetric({
          name: metric.name,
          value: metric.value,
          timestamp: Date.now(),
        });
      }
    });
  }
}

/**
 * Report performance metric to analytics service
 */
function reportPerformanceMetric(
  metric: PerformanceObserverEntry & { details?: any },
): void {
  if (typeof window === "undefined") return;

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log(`Performance Metric - ${metric.name}: ${metric.value}ms`);
  }

  // Send to analytics service (implement based on your analytics provider)
  sendToAnalytics(metric);
}

/**
 * Send performance data to analytics service
 */
function sendToAnalytics(
  metric: PerformanceObserverEntry & { details?: any },
): void {
  // Example implementation for Google Analytics 4
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", "performance_metric", {
      metric_name: metric.name,
      metric_value: metric.value,
      timestamp: metric.timestamp,
      ...(metric.details && { metric_details: metric.details }),
    });
  }

  // Example implementation for custom analytics endpoint
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metric),
    }).catch((error) => {
      console.warn("Failed to send performance data:", error);
    });
  }
}

/**
 * Measure function execution time
 */
export function measureExecutionTime<T>(
  fn: () => T,
  name: string = "FunctionExecution",
): T {
  const startTime = performance.now();

  try {
    const result = fn();

    if (result instanceof Promise) {
      return result.then((res) => {
        const endTime = performance.now();
        reportPerformanceMetric({
          name,
          value: endTime - startTime,
          timestamp: Date.now(),
        });
        return res;
      }) as T;
    } else {
      const endTime = performance.now();
      reportPerformanceMetric({
        name,
        value: endTime - startTime,
        timestamp: Date.now(),
      });
      return result;
    }
  } catch (error) {
    const endTime = performance.now();
    reportPerformanceMetric({
      name: `${name}_Error`,
      value: endTime - startTime,
      timestamp: Date.now(),
      details: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
    throw error;
  }
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);

    if (callNow) {
      func(...args);
    }
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Preload critical resources
 */
export function preloadResources(
  resources: Array<{ href: string; as: string }>,
): void {
  if (typeof document === "undefined") return;

  resources.forEach((resource) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = resource.href;
    link.as = resource.as;

    if (resource.as === "font") {
      link.crossOrigin = "anonymous";
    }

    document.head.appendChild(link);
  });
}

/**
 * Optimize images by generating responsive sizes
 */
export function generateResponsiveImageSizes(
  baseUrl: string,
  widths: number[] = [320, 640, 768, 1024, 1280, 1920],
): string {
  return widths
    .map((width) => `${baseUrl}?width=${width} ${width}w`)
    .join(", ");
}

/**
 * Check if user has slow connection
 */
export function isSlowConnection(): boolean {
  if (typeof navigator === "undefined") return false;

  const connection = (navigator as any).connection;

  if (connection) {
    return (
      connection.saveData ||
      connection.effectiveType === "slow-2g" ||
      connection.effectiveType === "2g" ||
      connection.effectiveType === "3g"
    );
  }

  return false;
}

/**
 * Get performance metrics summary
 */
export function getPerformanceSummary(): Partial<PerformanceMetrics> {
  if (typeof window === "undefined") return {};

  const navigation = performance.getEntriesByType("navigation")[0] as any;

  if (!navigation) return {};

  return {
    loadTime: navigation.loadEventEnd - navigation.navigationStart,
    firstContentfulPaint: getFirstContentfulPaint(),
    cumulativeLayoutShift: getCumulativeLayoutShift(),
  };
}

/**
 * Get First Contentful Paint time
 */
function getFirstContentfulPaint(): number {
  const paintEntries = performance.getEntriesByType("paint");
  const fcpEntry = paintEntries.find(
    (entry) => entry.name === "first-contentful-paint",
  );
  return fcpEntry ? fcpEntry.startTime : 0;
}

/**
 * Get Cumulative Layout Shift
 */
function getCumulativeLayoutShift(): number {
  const layoutShiftEntries = performance.getEntriesByType(
    "layout-shift",
  ) as any[];

  return layoutShiftEntries
    .filter((entry) => !entry.hadRecentInput)
    .reduce((sum, entry) => sum + (entry.value || 0), 0);
}

/**
 * Clear performance entries to prevent memory leaks
 */
export function clearPerformanceEntries(): void {
  if (typeof performance !== "undefined" && performance.clearResourceTimings) {
    performance.clearResourceTimings();
  }
}

/**
 * Monitor memory usage (if available)
 */
export function monitorMemoryUsage(): void {
  if (typeof performance !== "undefined" && (performance as any).memory) {
    const memory = (performance as any).memory;

    setInterval(() => {
      const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
      const totalMB = Math.round(memory.totalJSHeapSize / 1048576);

      if (usedMB > 100) {
        // Alert if using more than 100MB
        console.warn(`High memory usage: ${usedMB}MB / ${totalMB}MB`);
      }
    }, 30000); // Check every 30 seconds
  }
}
