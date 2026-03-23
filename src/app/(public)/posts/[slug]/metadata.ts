import type { Metadata } from "next";
import { getPostBySlug } from "@/lib/actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  try {
    const postResult = await getPostBySlug(slug);

    if (!postResult.success || !postResult.data) {
      return {
        title: "Post Not Found",
        description: "The requested post could not be found.",
      };
    }

    const post = postResult.data;
    const seo = {
      metaTitle: post.metaTitle || post.title,
      metaDescription: post.metaDescription || post.excerpt || "",
      keywords: post.keywords || "",
      canonicalUrl: post.canonicalUrl || `/posts/${post.slug}`,
      openGraph: {
        title: post.ogTitle || post.title,
        description: post.ogDescription || post.excerpt || "",
        image: post.ogImage || post.mainImage || "",
        type: (post.ogType as "article") || "article",
      },
      twitterCard: {
        card: "summary_large_image",
        title: post.twitterTitle || post.title,
        description: post.twitterDescription || post.excerpt || "",
        image: post.twitterImage || post.mainImage || "",
        creator: post.twitterCreator || "",
      },
    };

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const canonicalUrl = `${baseUrl}${seo.canonicalUrl}`;

    return {
      title: seo.metaTitle,
      description: seo.metaDescription,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: seo.openGraph.title,
        description: seo.openGraph.description,
        images: seo.openGraph.image ? [{ url: seo.openGraph.image }] : [],
        type: "article",
        publishedTime: post.publishedAt?.toISOString(),
        modifiedTime: post.updatedAt?.toISOString(),
        authors: post.author.name ? [post.author.name] : [],
      },
      twitter: {
        card: seo.twitterCard.card as
          | "summary"
          | "summary_large_image"
          | "player"
          | "app"
          | undefined,
        title: seo.twitterCard.title,
        description: seo.twitterCard.description,
        images: seo.twitterCard.image ? [seo.twitterCard.image] : [],
        creator: seo.twitterCard.creator || undefined,
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Error Loading Post",
      description: "There was an error loading the post metadata.",
    };
  }
}
