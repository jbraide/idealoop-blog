/**
 * SEO Optimization Utilities
 * Collection of utilities for SEO optimization and performance
 */

/**
 * Get the base URL for the application
 * Prioritizes Vercel URL in production, then NEXT_PUBLIC_APP_URL, then localhost
 */
export function getBaseUrl(): string {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

/**
 * Generate structured data for blog posts
 */
export function generateBlogPostStructuredData(post: {
  title: string;
  description: string;
  image: string;
  url: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  categories?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    image: post.image,
    url: post.url,
    datePublished: post.publishedTime,
    dateModified: post.modifiedTime,
    author: {
      "@type": "Person",
      name: post.author || "Modern Blog",
    },
    publisher: {
      "@type": "Organization",
      name: "Modern Blog",
      logo: {
        "@type": "ImageObject",
        url: "/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": post.url,
    },
    ...(post.categories &&
      post.categories.length > 0 && {
        articleSection: post.categories.join(", "),
      }),
  };
}

/**
 * Generate structured data for breadcrumbs
 */
export function generateBreadcrumbStructuredData(
  breadcrumbs: Array<{
    name: string;
    url: string;
  }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: breadcrumb.name,
      item: breadcrumb.url,
    })),
  };
}

/**
 * Generate structured data for organization
 */
export function generateOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Modern Blog",
    url: getBaseUrl(),
    logo: "/logo.png",
    description: "A beautiful, fast, and modern blog built with Next.js",
    sameAs: [
      "https://twitter.com/blogplatform",
      // Add other social media URLs here
    ],
  };
}

/**
 * Generate meta tags for SEO
 */
export function generateMetaTags(seo: {
  title: string;
  description: string;
  canonicalUrl: string;
  image?: string;
  type?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}) {
  const baseUrl = getBaseUrl();
  const fullCanonicalUrl = `${baseUrl}${seo.canonicalUrl}`;
  const fullImageUrl = seo.image
    ? `${baseUrl}${seo.image}`
    : `${baseUrl}/og-image.jpg`;

  return {
    title: seo.title,
    description: seo.description,
    canonical: fullCanonicalUrl,
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: fullCanonicalUrl,
      images: [{ url: fullImageUrl }],
      type: seo.type || "website",
      ...(seo.type === "article" && {
        publishedTime: seo.publishedTime,
        modifiedTime: seo.modifiedTime,
        authors: seo.author ? [seo.author] : [],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [fullImageUrl],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * Generate keywords from content
 */
export function generateKeywords(
  content: string,
  title: string,
  categories: string[] = [],
): string[] {
  const words = content
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 3);

  const wordFrequency = words.reduce((freq: Record<string, number>, word) => {
    freq[word] = (freq[word] || 0) + 1;
    return freq;
  }, {});

  const titleWords = title
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 2);

  // Combine title words, categories, and most frequent content words
  const keywords = [
    ...titleWords,
    ...categories,
    ...Object.entries(wordFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word),
  ];

  // Remove duplicates and limit to 15 keywords
  return [...new Set(keywords)].slice(0, 15);
}

/**
 * Calculate reading time from content
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Generate excerpt from content
 */
export function generateExcerpt(
  content: string,
  maxLength: number = 160,
): string {
  // Remove HTML tags
  const plainText = content.replace(/<[^>]*>/g, "");

  // Trim to max length and add ellipsis if needed
  if (plainText.length <= maxLength) {
    return plainText;
  }

  return plainText.substring(0, maxLength).trim() + "...";
}

/**
 * Optimize image URL for SEO
 */
export function optimizeImageUrl(
  imageUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "webp" | "jpeg" | "png";
  } = {},
): string {
  if (!imageUrl) return "";

  // If using Cloudflare Images or similar service, you can add optimization parameters
  // For now, return the original URL
  return imageUrl;
}

/**
 * Validate SEO data
 */
export function validateSeoData(seo: {
  title: string;
  description: string;
  canonicalUrl: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!seo.title || seo.title.trim().length === 0) {
    errors.push("Title is required");
  } else if (seo.title.length > 60) {
    errors.push("Title should be under 60 characters for optimal SEO");
  }

  if (!seo.description || seo.description.trim().length === 0) {
    errors.push("Description is required");
  } else if (seo.description.length < 50) {
    errors.push("Description should be at least 50 characters");
  } else if (seo.description.length > 160) {
    errors.push("Description should be under 160 characters for optimal SEO");
  }

  if (!seo.canonicalUrl || seo.canonicalUrl.trim().length === 0) {
    errors.push("Canonical URL is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generate social sharing URLs
 */
export function generateSocialShareUrls(
  url: string,
  title: string,
  description: string,
) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
  };
}
