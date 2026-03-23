"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  quality = 80,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  placeholder = "empty",
  blurDataURL,
  objectFit = "cover",
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);

  useEffect(() => {
    setImageSrc(src);
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // Generate optimized image URL if using Cloudflare Images or similar
  const getOptimizedUrl = (url: string, options: {
    width?: number;
    quality?: number;
    format?: "webp" | "avif" | "jpeg";
  } = {}) => {
    if (!url) return url;

    // If using Cloudflare Images, you can add optimization parameters
    // Example: return `${url}?width=${options.width}&quality=${options.quality}&format=${options.format}`;

    // For now, return the original URL
    return url;
  };

  const optimizedSrc = getOptimizedUrl(imageSrc, {
    width: width || 1200,
    quality,
    format: "webp",
  });

  // Fallback for broken images
  const fallbackSrc = "/placeholder-image.jpg";

  if (hasError && imageSrc !== fallbackSrc) {
    return (
      <OptimizedImage
        src={fallbackSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        priority={priority}
        quality={quality}
        sizes={sizes}
        objectFit={objectFit}
        onLoad={onLoad}
        onError={onError}
      />
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        isLoading && "animate-pulse bg-muted",
        className
      )}
      style={{
        width: width ? `${width}px` : "100%",
        height: height ? `${height}px` : "auto",
        aspectRatio: width && height ? `${width} / ${height}` : undefined,
      }}
    >
      <Image
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={quality}
        sizes={sizes}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          objectFit === "cover" && "object-cover",
          objectFit === "contain" && "object-contain",
          objectFit === "fill" && "object-fill",
          objectFit === "none" && "object-none",
          objectFit === "scale-down" && "object-scale-down"
        )}
        onLoad={handleLoad}
        onError={handleError}
      />

      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

// Specialized image components for common use cases
export function HeroImage(props: Omit<OptimizedImageProps, "priority" | "sizes">) {
  return (
    <OptimizedImage
      priority={true}
      sizes="100vw"
      {...props}
    />
  );
}

export function ThumbnailImage(props: Omit<OptimizedImageProps, "width" | "height" | "sizes">) {
  return (
    <OptimizedImage
      width={300}
      height={200}
      sizes="(max-width: 768px) 100vw, 300px"
      {...props}
    />
  );
}

export function AvatarImage(props: Omit<OptimizedImageProps, "width" | "height" | "sizes">) {
  return (
    <OptimizedImage
      width={40}
      height={40}
      sizes="40px"
      objectFit="cover"
      className="rounded-full"
      {...props}
    />
  );
}

export function CardImage(props: Omit<OptimizedImageProps, "width" | "height" | "sizes">) {
  return (
    <OptimizedImage
      width={400}
      height={250}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
      {...props}
    />
  );
}
