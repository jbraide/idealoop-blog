import { getPosts, getCategories } from "@/lib/actions";

interface SitemapUrl {
  url: string;
  lastmod: string;
  priority: string;
  changefreq: string;
}

export async function GET() {
  const baseUrl = "https://blog.buildscalably.xyz";

  // Get all published posts
  const postsResult = await getPosts({
    status: ["published"],
    limit: 1000,
  });

  // Get all categories
  const categoriesResult = await getCategories();

  const posts = postsResult.success ? postsResult.data?.posts || [] : [];
  const categories = categoriesResult.success
    ? categoriesResult.data || []
    : [];

  // Helper function to format date as YYYY-MM-DD
  const formatDate = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  // Static routes
  const staticUrls: SitemapUrl[] = [
    {
      url: baseUrl,
      lastmod: formatDate(new Date()),
      priority: "1.0",
      changefreq: "daily",
    },
    {
      url: `${baseUrl}/posts`,
      lastmod: formatDate(new Date()),
      priority: "0.8",
      changefreq: "daily",
    },
    {
      url: `${baseUrl}/categories`,
      lastmod: formatDate(new Date()),
      priority: "0.7",
      changefreq: "weekly",
    },
  ];

  // Post routes
  const postUrls: SitemapUrl[] = posts.map((post: any) => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastmod: formatDate(new Date(post.updatedAt)),
    priority: "0.9",
    changefreq: "monthly",
  }));

  // Category routes
  const categoryUrls: SitemapUrl[] = categories.map((category: any) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    lastmod: formatDate(new Date(category.updatedAt)),
    priority: "0.6",
    changefreq: "weekly",
  }));

  const allUrls = [...staticUrls, ...postUrls, ...categoryUrls];

  // Generate XML sitemap with proper formatting and xhtml namespace
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${allUrls
  .map(
    (url) => `  <url>
    <loc>${url.url}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  // Return XML response with proper headers
  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
    },
  });
}

// Optional: Add revalidation configuration
export const revalidate = 3600; // Revalidate every hour
