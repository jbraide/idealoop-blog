import type { Metadata } from "next";
import { SocialShare } from "@/components/seo/social-share";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  try {
    const postResult = await import("@/lib/actions").then(({ getPostBySlug }) =>
      getPostBySlug(slug),
    );

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

    const baseUrl = getBaseUrl();
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
        modifiedTime: post.updatedAt.toISOString(),
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

("use client");

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Eye,
  Tag,
  User,
  ArrowLeft,
  Share2,
  Bookmark,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBaseUrl } from "@/lib/seo-utils";
import {
  getPostBySlug,
  getCommentsByPostId,
  createComment,
} from "@/lib/actions";
import { BlogPost, Comment } from "@/types";
import { cn, formatDate, formatReadingTime } from "@/lib/utils";

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function PostPage({ params }: PostPageProps) {
  const [slug, setSlug] = useState<string>("");
  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [uniqueViewCount, setUniqueViewCount] = useState(0);

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setSlug(resolvedParams.slug);
    };

    loadParams();
  }, [params]);

  useEffect(() => {
    if (!slug) return;

    const loadData = async () => {
      try {
        const postResult = await getPostBySlug(slug);

        if (!postResult.success || !postResult.data) {
          notFound();
        }

        const postData = postResult.data;

        // Now load comments with the actual post ID
        const commentsResult = await getCommentsByPostId(postData.id);

        // Transform the data to match BlogPost interface
        const transformedPost: BlogPost = {
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
          status: postData.status.toLowerCase() as
            | "draft"
            | "published"
            | "archived",
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
              description:
                postData.twitterDescription || postData.excerpt || "",
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

        setPost(transformedPost);
        setViewCount(postData.viewCount || 0);
        setUniqueViewCount(postData.uniqueViewCount || 0);

        // Track post view (only for published posts)
        if (postData.status === "PUBLISHED") {
          try {
            const viewResponse = await fetch(`/api/posts/${slug}/views`, {
              method: "POST",
            });
            const viewResult = await viewResponse.json();

            if (viewResult.success) {
              setViewCount(viewResult.data.viewCount);
              setUniqueViewCount(viewResult.data.uniqueViewCount);
            }
          } catch (error) {
            console.error("Failed to track post view:", error);
          }
        }

        // Load comments with actual post ID
        if (commentsResult.success && commentsResult.data) {
          const transformedComments: Comment[] = commentsResult.data.map(
            (comment) => ({
              id: comment.id,
              postId: comment.postId,
              author: {
                name: comment.authorName || comment.user?.name || "Anonymous",
                email: comment.authorEmail || comment.user?.email || "",
                website: comment.authorUrl,
                avatar: comment.user?.image || null,
              },
              content: comment.content,
              status: comment.status.toLowerCase() as
                | "pending"
                | "approved"
                | "rejected"
                | "spam",
              parentId: comment.parentId || undefined,
              replies:
                comment.replies?.map((reply) => ({
                  id: reply.id,
                  postId: reply.postId,
                  author: {
                    name: reply.authorName || reply.user?.name || "Anonymous",
                    email: reply.authorEmail || reply.user?.email || "",
                    website: reply.authorUrl,
                    avatar: reply.user?.image || null,
                  },
                  content: reply.content,
                  status: reply.status.toLowerCase() as
                    | "pending"
                    | "approved"
                    | "rejected"
                    | "spam",
                  parentId: reply.parentId || undefined,
                  createdAt: reply.createdAt,
                  updatedAt: reply.updatedAt,
                  likes: 0,
                })) || [],
              createdAt: comment.createdAt,
              updatedAt: comment.updatedAt,
              likes: 0,
            }),
          );
          setComments(transformedComments);
        }
      } catch (error) {
        console.error("Error loading post:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !post) return;

    // Check if comments are enabled for this post
    if (post.commentsEnabled === false) {
      return;
    }

    setSubmittingComment(true);
    try {
      const result = await createComment({
        content: newComment,
        postId: post.id,
        authorName: "Current User",
        authorEmail: "user@example.com",
      });

      if (result.success && result.data) {
        const newCommentData: Comment = {
          id: result.data.id,
          postId: result.data.postId,
          author: {
            name:
              result.data.authorName || result.data.user?.name || "Anonymous",
            email: result.data.authorEmail || result.data.user?.email || "",
            website: result.data.authorUrl,
            avatar: result.data.user?.image || null,
          },
          content: result.data.content,
          status: result.data.status.toLowerCase() as
            | "pending"
            | "approved"
            | "rejected"
            | "spam",
          parentId: result.data.parentId || undefined,
          replies: [],
          createdAt: result.data.createdAt,
          updatedAt: result.data.updatedAt,
          likes: 0,
        };

        setComments((prev) => [newCommentData, ...prev]);
        setNewComment("");
        alert("Comment submitted for moderation!");
      } else {
        alert(result.error || "Failed to submit comment. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert("Failed to submit comment. Please try again.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="mx-auto max-w-4xl px-4">
          <div className="animate-pulse space-y-8">
            {/* Back button skeleton */}
            <div className="h-8 w-24 bg-muted rounded"></div>

            {/* Title skeleton */}
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>

            {/* Content skeleton */}
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded w-full"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Back Navigation */}
      <div className="border-b">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Articles
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Post Header */}
          <header className="space-y-6 text-center">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                {post.title}
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {post.excerpt}
              </p>
            </div>

            {/* Post Meta */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{post.author?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.publishedAt!)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{formatReadingTime(post.readingTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{viewCount || post.viewCount} views</span>
              </div>
            </div>

            {/* Categories and Tags */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {post.categories.map((category, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                >
                  <Tag className="h-3 w-3" />
                  {category}
                </span>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4">
              <SocialShare
                url={`${getBaseUrl()}/posts/${post.slug}`}
                title={post.title}
                description={post.excerpt}
                variant="dropdown"
              />
              <Button variant="outline" size="sm" className="gap-2">
                <Bookmark className="h-4 w-4" />
                Save
              </Button>
            </div>
          </header>

          {/* Main Image */}
          {post.mainImage && (
            <div className="w-full max-w-3xl mx-auto">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                <img
                  src={post.mainImage}
                  alt={post.title}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          )}

          {/* Post Content */}
          <div className="max-w-none">
            <div
              dangerouslySetInnerHTML={{ __html: post.content }}
              className="leading-relaxed text-base post-content"
            />
            <style jsx global>{`
              .post-content h1 {
                font-size: 2.5rem;
                font-weight: 700;
                margin-top: 2rem;
                margin-bottom: 1rem;
                line-height: 1.2;
                color: #1a202c;
                border-bottom: 2px solid #e2e8f0;
                padding-bottom: 0.5rem;
              }
              .post-content h2 {
                font-size: 2rem;
                font-weight: 600;
                margin-top: 1.5rem;
                margin-bottom: 0.75rem;
                line-height: 1.3;
                color: #2d3748;
              }
              .post-content h3 {
                font-size: 1.5rem;
                font-weight: 600;
                margin-top: 1.25rem;
                margin-bottom: 0.5rem;
                line-height: 1.4;
                color: #4a5568;
              }
              .post-content h4 {
                font-size: 1.25rem;
                font-weight: 600;
                margin-top: 1rem;
                margin-bottom: 0.5rem;
                line-height: 1.4;
                color: #718096;
              }
              .post-content h5 {
                font-size: 1.125rem;
                font-weight: 600;
                margin-top: 0.75rem;
                margin-bottom: 0.25rem;
                line-height: 1.4;
                color: #a0aec0;
              }
              .post-content h6 {
                font-size: 1rem;
                font-weight: 600;
                margin-top: 0.5rem;
                margin-bottom: 0.25rem;
                line-height: 1.4;
                color: #cbd5e0;
              }
              .post-content p {
                margin-bottom: 1rem;
                line-height: 1.6;
                color: #4a5568;
              }
              .post-content ul,
              .post-content ol {
                margin: 1rem 0;
                padding-left: 2rem;
              }
              .post-content li {
                margin: 0.5rem 0;
              }
              .post-content ul li {
                list-style-type: disc;
              }
              .post-content ol li {
                list-style-type: decimal;
              }
              .post-content blockquote {
                border-left: 4px solid #4299e1;
                background-color: #ebf8ff;
                padding: 1rem 1.5rem;
                margin: 1.5rem 0;
                font-style: italic;
                color: #2d3748;
              }
              .post-content table {
                width: 100%;
                border-collapse: collapse;
                margin: 1.5rem 0;
              }
              .post-content table th,
              .post-content table td {
                border: 1px solid #e2e8f0;
                padding: 0.75rem;
                text-align: left;
              }
              .post-content table th {
                background-color: #f7fafc;
                font-weight: 600;
              }
              .post-content hr {
                border: none;
                border-top: 2px solid #e2e8f0;
                margin: 2rem 0;
              }
              .post-content a {
                color: #3182ce;
                text-decoration: underline;
              }
              .post-content a:hover {
                color: #2c5aa0;
              }
              .post-content code {
                background-color: #f7fafc;
                padding: 0.125rem 0.25rem;
                border-radius: 0.25rem;
                font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
                font-size: 0.875rem;
              }
              .post-content pre {
                background-color: #1a202c;
                color: #e2e8f0;
                padding: 1rem;
                border-radius: 0.5rem;
                overflow-x: auto;
                margin: 1.5rem 0;
              }
              .post-content img {
                max-width: 100%;
                height: auto;
                border-radius: 0.5rem;
                margin: 1.5rem 0;
              }
            `}</style>
          </div>

          {/* Post Footer */}
          <footer className="border-t pt-8">
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>Published on {formatDate(post.publishedAt!)}</span>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share Article
                </Button>
              </div>
            </div>
          </footer>
        </motion.article>

        {/* Comments Section */}
        {post.commentsEnabled !== false && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-16 space-y-8"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="h-6 w-6" />
                Comments ({comments.length})
              </h2>
            </div>

            {/* Comment Form */}
            <Card>
              <CardHeader>
                <CardTitle>Leave a Comment</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitComment} className="space-y-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Comments are moderated and will appear after approval.
                    </p>
                    <Button
                      type="submit"
                      disabled={submittingComment || !newComment.trim()}
                      className="gap-2"
                    >
                      {submittingComment ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="h-4 w-4" />
                          Post Comment
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Comments List */}
            <div className="space-y-6">
              {comments
                .filter((comment) => comment.status === "approved")
                .map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                                {comment.author.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-medium text-foreground">
                                  {comment.author.name}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(comment.createdAt)}
                                </p>
                              </div>
                            </div>
                            <p className="text-foreground leading-relaxed">
                              {comment.content}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <button className="hover:text-foreground transition-colors">
                              ❤️ {comment.likes}
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

              {comments.filter((comment) => comment.status === "approved")
                .length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No comments yet
                  </h3>
                  <p className="text-muted-foreground">
                    Be the first to share your thoughts!
                  </p>
                </div>
              )}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
