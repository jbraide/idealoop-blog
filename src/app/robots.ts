import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/auth/", "/_next/", "/static/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/auth/"],
        crawlDelay: 1,
      },
    ],
    sitemap: `https://blog.buildscalably.xyz/sitemap.xml`,
    host: "https://blog.buildscalably.xyz",
  };
}
