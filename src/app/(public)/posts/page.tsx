import { getPosts, getCategories } from "@/lib/actions";
import { getCompanySettings } from "@/lib/company-settings";
import { BlogPost, Category } from "@/types";
import { PostsClient } from "./posts-client";

interface PostsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const resolvedParams = await searchParams;
  const category = typeof resolvedParams.category === "string" ? resolvedParams.category : undefined;
  const search = typeof resolvedParams.q === "string" ? resolvedParams.q : undefined;
  const page = typeof resolvedParams.page === "string" ? parseInt(resolvedParams.page, 10) : 1;

  const [postsResult, categoriesResult, companySettings] = await Promise.all([
    getPosts({
      status: ["PUBLISHED"],
      category,
      search,
      page,
      limit: 9,
    }),
    getCategories(),
    getCompanySettings(),
  ]);

  // Transform data ensuring types are strictly respected
  const posts: BlogPost[] = postsResult.success && postsResult.data
    ? postsResult.data.posts.map((post: any) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || "",
      authorId: post.authorId,
      mainImage: post.mainImage || "",
      author: {
        id: post.author?.id || "",
        email: post.author?.email || "",
        name: post.author?.name || "",
        image: post.author?.image || "",
        role: "admin",
      },
      status: (post.status?.toLowerCase() as "draft" | "published" | "archived") || "draft",
      categories: post.categories?.map((cat: any) => cat.name) || [],
      tags: post.tags?.map((tag: any) => tag.name) || [],
      seo: {
        metaTitle: post.metaTitle || post.title,
        metaDescription: post.metaDescription || post.excerpt || "",
        canonicalUrl: post.canonicalUrl || `/posts/${post.slug}`,
        openGraph: {
          title: post.ogTitle || post.title,
          description: post.ogDescription || post.excerpt || "",
          image: post.ogImage || "",
          type: (post.ogType as "article") || "article",
        },
        twitterCard: {
          card: "summary",
          title: post.twitterTitle || post.title,
          description: post.twitterDescription || post.excerpt || "",
          image: post.twitterImage || "",
          creator: post.twitterCreator || "",
        },
      },
      publishedAt: post.publishedAt || undefined,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      readingTime: Math.ceil((post.content || "").split(/\s+/).length / 200),
      viewCount: post.viewCount || 0,
      uniqueViewCount: post.uniqueViewCount || 0,
      commentCount: post._count?.comments || 0,
    }))
    : [];

  const categories: Category[] = categoriesResult.success && categoriesResult.data
    ? categoriesResult.data.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      color: cat.color || "#3B82F6",
      postCount: cat.postCount || 0,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    }))
    : [];

  const totalPages = postsResult.success && postsResult.data
    ? (postsResult.data.pagination?.pages || postsResult.data.totalPages || 1)
    : 1;

  return (
    <PostsClient
      posts={posts}
      categories={categories}
      companySettings={companySettings}
      totalPages={totalPages}
      initialSearchQuery={search || ""}
      initialCategory={category || ""}
      initialPage={page}
    />
  );
}
