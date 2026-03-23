"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getBaseUrl } from "@/lib/seo-utils";
import { generateBreadcrumbStructuredData } from "@/lib/seo-utils";

interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  separator?: "slash" | "chevron" | "arrow";
}

export function Breadcrumbs({
  items,
  className = "",
  separator = "chevron",
}: BreadcrumbsProps) {
  const structuredData = generateBreadcrumbStructuredData(
    items.map((item) => ({
      name: item.label,
      url: `${getBaseUrl()}${item.href}`,
    })),
  );

  const Separator = () => {
    switch (separator) {
      case "slash":
        return <span className="mx-2 text-muted-foreground">/</span>;
      case "arrow":
        return <span className="mx-2 text-muted-foreground">→</span>;
      case "chevron":
      default:
        return <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />;
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center text-sm ${className}`}
      >
        <ol className="flex items-center space-x-0">
          {items.map((item, index) => (
            <li key={item.href} className="flex items-center">
              {index > 0 && <Separator />}
              {item.current ? (
                <span
                  className="text-foreground font-medium"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

// Helper function to generate breadcrumbs for common pages
export function generateBreadcrumbs(
  path: string,
  currentPageTitle?: string,
): BreadcrumbItem[] {
  const baseUrl = getBaseUrl();
  const segments = path.split("/").filter(Boolean);

  const breadcrumbs: BreadcrumbItem[] = [
    {
      label: "Home",
      href: "/",
      current: segments.length === 0,
    },
  ];

  let currentPath = "";

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;

    // Skip numeric segments (like post IDs)
    if (!isNaN(Number(segment))) {
      return;
    }

    const isLast = index === segments.length - 1;

    if (isLast && currentPageTitle) {
      breadcrumbs.push({
        label: currentPageTitle,
        href: currentPath,
        current: true,
      });
    } else {
      // Convert slug to readable label
      const label = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      breadcrumbs.push({
        label,
        href: currentPath,
        current: isLast && !currentPageTitle,
      });
    }
  });

  return breadcrumbs;
}

// Specific breadcrumb generators for common pages
export const breadcrumbHelpers = {
  forHome: (): BreadcrumbItem[] => [
    { label: "Home", href: "/", current: true },
  ],

  forPosts: (): BreadcrumbItem[] => [
    { label: "Home", href: "/" },
    { label: "Posts", href: "/posts", current: true },
  ],

  forPost: (postTitle: string, postSlug: string): BreadcrumbItem[] => [
    { label: "Home", href: "/" },
    { label: "Posts", href: "/posts" },
    { label: postTitle, href: `/posts/${postSlug}`, current: true },
  ],

  forCategories: (): BreadcrumbItem[] => [
    { label: "Home", href: "/" },
    { label: "Categories", href: "/categories", current: true },
  ],

  forCategory: (
    categoryName: string,
    categorySlug: string,
  ): BreadcrumbItem[] => [
    { label: "Home", href: "/" },
    { label: "Categories", href: "/categories" },
    { label: categoryName, href: `/categories/${categorySlug}`, current: true },
  ],
};
