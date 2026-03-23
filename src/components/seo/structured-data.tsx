"use client";

import {
  generateBlogPostStructuredData,
  generateOrganizationStructuredData,
  getBaseUrl,
} from "@/lib/seo-utils";

interface StructuredDataProps {
  type: "blogPost" | "organization" | "website";
  data?: {
    title: string;
    description: string;
    image: string;
    url: string;
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    categories?: string[];
  };
}

export function StructuredData({ type, data }: StructuredDataProps) {
  let structuredData: object;

  switch (type) {
    case "blogPost":
      if (!data) {
        console.error("Data is required for blogPost structured data");
        return null;
      }
      structuredData = generateBlogPostStructuredData(data);
      break;
    case "organization":
      structuredData = generateOrganizationStructuredData();
      break;
    case "website":
      structuredData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Modern Blog",
        url: getBaseUrl(),
        description: "A beautiful, fast, and modern blog built with Next.js",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${getBaseUrl()}/posts?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      };
      break;
    default:
      console.error("Invalid structured data type");
      return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}

interface BlogPostStructuredDataProps {
  title: string;
  description: string;
  image: string;
  url: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  categories?: string[];
}

export function BlogPostStructuredData(props: BlogPostStructuredDataProps) {
  return <StructuredData type="blogPost" data={props} />;
}

export function OrganizationStructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Modern Blog",
          url: getBaseUrl(),
          logo: "/logo.png",
          description: "A beautiful, fast, and modern blog built with Next.js",
        }),
      }}
    />
  );
}

export function WebsiteStructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Modern Blog",
          url: getBaseUrl(),
          description: "A beautiful, fast, and modern blog built with Next.js",
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${getBaseUrl()}/posts?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        }),
      }}
    />
  );
}
