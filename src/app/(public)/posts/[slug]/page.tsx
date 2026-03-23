export { generateMetadata } from "./metadata";

import { PostClient } from "./post-client";
import { getPostBySlug, getCommentsByPostId } from "@/lib/actions";
import { notFound } from "next/navigation";
import { BlogPost, Comment } from "@/types";

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;

  const postResult = await getPostBySlug(slug);

  if (!postResult.success || !postResult.data) {
    notFound();
  }

  const postData = postResult.data;
  const commentsResult = await getCommentsByPostId(postData.id);

  // Transform the data to match BlogPost interface
  const post: BlogPost = {
    id: postData.id,
    title: postData.title,
    slug: postData.slug,
    content: postData.content,
    excerpt: postData.excerpt || "",
    authorId: postData.authorId,
    mainImage: postData.mainImage || "",
    commentsEnabled: postData.commentsEnabled ?? true,
    author: {
      id: postData.author.id,
      email: postData.author.email,
      name: postData.author.name || "",
      image: postData.author.image || "",
    },
    status: postData.status.toLowerCase() as "draft" | "published" | "archived",
    categories: postData.categories.map((cat) => cat.name),
    tags: postData.tags.map((tag) => tag.name),
    seo: {
      metaTitle: postData.metaTitle || postData.title,
      metaDescription: postData.metaDescription || postData.excerpt || "",
      canonicalUrl: postData.canonicalUrl || `/posts/${postData.slug}`,
      openGraph: {
        title: postData.ogTitle || postData.title,
        description: postData.ogDescription || postData.excerpt || "",
        image: postData.ogImage || "",
        type: (postData.ogType as "article") || "article",
      },
      twitterCard: {
        card: "summary",
        title: postData.twitterTitle || postData.title,
        description: postData.twitterDescription || postData.excerpt || "",
        image: postData.twitterImage || "",
        creator: postData.twitterCreator || "",
      },
    },
    publishedAt: postData.publishedAt || undefined,
    createdAt: postData.createdAt,
    updatedAt: postData.updatedAt,
    readingTime: Math.ceil(postData.content.split(/\s+/).length / 200),
    viewCount: postData.viewCount || 0,
    uniqueViewCount: postData.uniqueViewCount || 0,
    commentCount: postData._count?.comments || 0,
  };

  const initialComments: Comment[] =
    commentsResult.success && commentsResult.data
      ? commentsResult.data.map((comment) => ({
        id: comment.id,
        postId: comment.postId,
        author: {
          name: comment.authorName || "",
          email: comment.authorEmail || "",
          website: comment.authorUrl || null,
          avatar: null,
        },
        content: comment.content,
        status: comment.status.toLowerCase() as
          | "pending"
          | "approved"
          | "rejected"
          | "spam",
        parentId: comment.parentId || undefined,
        replies: [],
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        likes: 0,
      }))
      : [];

  return <PostClient post={post} initialComments={initialComments} />;
}
