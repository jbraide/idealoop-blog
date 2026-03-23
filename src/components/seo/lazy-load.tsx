"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface LazyLoadProps {
  children: ReactNode;
  threshold?: number;
  rootMargin?: string;
  className?: string;
  placeholder?: ReactNode;
  height?: string | number;
  once?: boolean;
  delay?: number;
}

export function LazyLoad({
  children,
  threshold = 0.1,
  rootMargin = "50px",
  className = "",
  placeholder,
  height,
  once = true,
  delay = 0,
}: LazyLoadProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const [isDelayed, setIsDelayed] = useState(delay > 0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => {
              setIsVisible(true);
              setIsDelayed(false);
              if (once) {
                setHasBeenVisible(true);
              }
            }, delay);
          } else {
            setIsVisible(true);
            if (once) {
              setHasBeenVisible(true);
            }
          }

          if (once && hasBeenVisible) {
            observer.disconnect();
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, once, delay, hasBeenVisible]);

  const shouldShow = isVisible || (once && hasBeenVisible);

  return (
    <div
      ref={ref}
      className={cn("lazy-load", className)}
      style={height ? { minHeight: height } : undefined}
    >
      {shouldShow && !isDelayed ? (
        children
      ) : placeholder ? (
        placeholder
      ) : (
        <div
          className={cn(
            "animate-pulse bg-muted rounded",
            height ? "" : "h-full"
          )}
          style={height ? { height } : undefined}
        />
      )}
    </div>
  );
}

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: ReactNode;
  threshold?: number;
  rootMargin?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  className = "",
  placeholder,
  threshold = 0.1,
  rootMargin = "50px",
  onLoad,
  onError,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <LazyLoad
      threshold={threshold}
      rootMargin={rootMargin}
      className={className}
      placeholder={placeholder}
      height={height}
    >
      {!hasError ? (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      ) : (
        <div className="flex items-center justify-center bg-muted text-muted-foreground">
          <span>Image failed to load</span>
        </div>
      )}
    </LazyLoad>
  );
}

interface LazyIframeProps {
  src: string;
  title: string;
  width?: string | number;
  height?: string | number;
  className?: string;
  placeholder?: ReactNode;
  threshold?: number;
  rootMargin?: string;
}

export function LazyIframe({
  src,
  title,
  width = "100%",
  height = "400",
  className = "",
  placeholder,
  threshold = 0.1,
  rootMargin = "100px",
}: LazyIframeProps) {
  return (
    <LazyLoad
      threshold={threshold}
      rootMargin={rootMargin}
      className={className}
      placeholder={placeholder}
      height={height}
    >
      <iframe
        src={src}
        title={title}
        width={width}
        height={height}
        className="border-0"
        loading="lazy"
        allowFullScreen
      />
    </LazyLoad>
  );
}

interface LazyVideoProps {
  src: string;
  poster?: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: ReactNode;
  threshold?: number;
  rootMargin?: string;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
}

export function LazyVideo({
  src,
  poster,
  width,
  height,
  className = "",
  placeholder,
  threshold = 0.1,
  rootMargin = "100px",
  controls = true,
  autoPlay = false,
  muted = false,
  loop = false,
}: LazyVideoProps) {
  return (
    <LazyLoad
      threshold={threshold}
      rootMargin={rootMargin}
      className={className}
      placeholder={placeholder}
      height={height}
    >
      <video
        src={src}
        poster={poster}
        width={width}
        height={height}
        controls={controls}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        className="w-full h-auto"
        preload="none"
      />
    </LazyLoad>
  );
}

// Higher order component for lazy loading any component
export function withLazyLoad<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    threshold?: number;
    rootMargin?: string;
    placeholder?: ReactNode;
    height?: string | number;
  } = {}
) {
  return function LazyLoadedComponent(props: P) {
    return (
      <LazyLoad
        threshold={options.threshold}
        rootMargin={options.rootMargin}
        placeholder={options.placeholder}
        height={options.height}
      >
        <Component {...props} />
      </LazyLoad>
    );
  };
}
