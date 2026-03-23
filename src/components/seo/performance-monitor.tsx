"use client";

import { useEffect } from "react";
import { initializePerformanceMonitoring, monitorMemoryUsage } from "@/lib/performance-utils";

interface PerformanceMonitorProps {
  enabled?: boolean;
  trackMemory?: boolean;
  children?: React.ReactNode;
}

export function PerformanceMonitor({
  enabled = true,
  trackMemory = false,
  children,
}: PerformanceMonitorProps) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    // Initialize performance monitoring
    initializePerformanceMonitoring();

    // Monitor memory usage if enabled
    if (trackMemory) {
      monitorMemoryUsage();
    }

    // Track page visibility changes for performance optimization
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Page is hidden - can perform cleanup or pause heavy operations
        console.log("Page visibility changed to hidden");
      } else {
        // Page is visible - resume operations
        console.log("Page visibility changed to visible");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Track network status
    const handleOnline = () => {
      console.log("Network status: online");
      // Could trigger re-sync of data or resume paused operations
    };

    const handleOffline = () => {
      console.log("Network status: offline");
      // Could pause non-critical operations or show offline indicator
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [enabled, trackMemory]);

  // Render children if provided
  return children ? <>{children}</> : null;
}

// Hook for performance monitoring in components
export function usePerformanceMonitor(options: {
  enabled?: boolean;
  componentName?: string;
} = {}) {
  const { enabled = true, componentName } = options;

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Log slow component renders (over 16ms - one frame at 60fps)
      if (renderTime > 16 && componentName) {
        console.warn(
          `Slow component render detected: ${componentName} took ${renderTime.toFixed(2)}ms`
        );
      }
    };
  }, [enabled, componentName]);
}

// Component wrapper for measuring render performance
interface PerformanceWrapperProps {
  componentName: string;
  children: React.ReactNode;
  enabled?: boolean;
}

export function PerformanceWrapper({
  componentName,
  children,
  enabled = true,
}: PerformanceWrapperProps) {
  usePerformanceMonitor({ enabled, componentName });

  return <>{children}</>;
}
