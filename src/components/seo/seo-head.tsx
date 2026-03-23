import { SEOData } from "@/types";

interface SEOHeadProps {
  seo: SEOData;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  type?: "article" | "website";
}

export function SEOHead({
  seo,
  publishedTime,
  modifiedTime,
  author,
  type = "article",
}: SEOHeadProps) {
  return (
    <>
      {/* Basic Meta Tags */}
      <title>{seo.metaTitle}</title>
      <meta name="description" content={seo.metaDescription} />
      {seo.keywords && <meta name="keywords" content={seo.keywords} />}

      {/* Canonical URL */}
      <link rel="canonical" href={seo.canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={seo.openGraph.title} />
      <meta property="og:description" content={seo.openGraph.description} />
      <meta property="og:image" content={seo.openGraph.image} />
      <meta property="og:url" content={seo.canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Modern Blog" />

      {/* Open Graph - Article specific */}
      {type === "article" && (
        <>
          {publishedTime && (
            <meta property="article:published_time" content={publishedTime} />
          )}
          {modifiedTime && (
            <meta property="article:modified_time" content={modifiedTime} />
          )}
          {author && <meta property="article:author" content={author} />}
        </>
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content={seo.twitterCard.card} />
      <meta name="twitter:title" content={seo.twitterCard.title} />
      <meta name="twitter:description" content={seo.twitterCard.description} />
      <meta name="twitter:image" content={seo.twitterCard.image} />
      {seo.twitterCard.creator && (
        <meta name="twitter:creator" content={seo.twitterCard.creator} />
      )}

      {/* Additional SEO Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content={author || "Modern Blog"} />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": type === "article" ? "Article" : "WebSite",
            headline: seo.metaTitle,
            description: seo.metaDescription,
            image: seo.openGraph.image,
            url: seo.canonicalUrl,
            ...(type === "article" && {
              datePublished: publishedTime,
              dateModified: modifiedTime,
              author: {
                "@type": "Person",
                name: author,
              },
              publisher: {
                "@type": "Organization",
                name: "Modern Blog",
                logo: {
                  "@type": "ImageObject",
                  url: "/logo.png",
                },
              },
            }),
          }),
        }}
      />
    </>
  );
}
