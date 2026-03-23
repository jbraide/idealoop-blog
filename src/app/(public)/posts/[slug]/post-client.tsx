"use client";

import { getBaseUrl } from "@/lib/seo-utils";

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
  Bookmark,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPostBySlug,
  getCommentsByPostId,
  createComment,
} from "@/lib/actions";
import { BlogPost, Comment } from "@/types";
import { cn, formatDate, formatReadingTime } from "@/lib/utils";
import { SocialShare } from "@/components/seo/social-share";
import { BlogPostStructuredData } from "@/components/seo/structured-data";
import { Breadcrumbs, breadcrumbHelpers } from "@/components/seo/breadcrumbs";
import { OptimizedImage } from "@/components/seo/optimized-image";

interface PostClientProps {
  slug: string;
}

export function PostClient({ slug }: PostClientProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [uniqueViewCount, setUniqueViewCount] = useState(0);

  useEffect(() => {
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

        // Transform comments
        if (commentsResult.success && commentsResult.data) {
          const transformedComments: Comment[] = commentsResult.data.map(
            (comment) => ({
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
            }),
          );
          setComments(transformedComments);
        }

        // Track view (only for published posts)
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
          } catch (viewError) {
            console.error("Error tracking view:", viewError);
          }
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
    if (!post || !newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const result = await createComment({
        content: newComment,
        postId: post.id,
        authorName: "Anonymous",
        authorEmail: "anonymous@example.com",
      });

      if (result.success && result.data) {
        const newCommentData: Comment = {
          id: result.data.id,
          postId: result.data.postId,
          author: {
            name: result.data.authorName || "Anonymous",
            email: result.data.authorEmail || "",
            website: result.data.authorUrl || null,
            avatar: null,
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
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    if (typeof window !== "undefined" && navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="space-y-4">
              <div className="h-12 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    notFound();
  }

  const baseUrl = getBaseUrl();
  const postUrl = `${baseUrl}/posts/${post.slug}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Structured Data */}
      <BlogPostStructuredData
        title={post.title}
        description={post.excerpt}
        image={post.mainImage || "/og-image.jpg"}
        url={postUrl}
        publishedTime={post.publishedAt?.toISOString()}
        modifiedTime={post.updatedAt.toISOString()}
        author={post.author?.name || undefined}
        categories={post.categories}
      />

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs
            items={breadcrumbHelpers.forPost(post.title, post.slug)}
            separator="chevron"
          />
        </div>

        {/* Back Button */}
        <Button variant="ghost" size="sm" className="mb-6 gap-2" asChild>
          <Link href="/posts">
            <ArrowLeft className="h-4 w-4" />
            Back to Posts
          </Link>
        </Button>

        <motion.div
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
                url={postUrl}
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
                <OptimizedImage
                  src={post.mainImage}
                  alt={post.title}
                  width={800}
                  height={450}
                  className="object-cover w-full h-full"
                  priority={true}
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
                margin-bottom: 1rem;
                line-height: 1.3;
                color: #2d3748;
              }
              .post-content h3 {
                font-size: 1.5rem;
                font-weight: 600;
                margin-top: 1.25rem;
                margin-bottom: 0.75rem;
                line-height: 1.4;
                color: #4a5568;
              }
              .post-content p {
                margin-bottom: 1rem;
                line-height: 1.7;
                color: #4a5568;
              }
              .post-content ul,
              .post-content ol {
                margin-bottom: 1rem;
                padding-left: 1.5rem;
              }
              .post-content li {
                margin-bottom: 0.5rem;
                line-height: 1.6;
              }
              .post-content blockquote {
                border-left: 4px solid #e2e8f0;
                padding-left: 1rem;
                margin: 1.5rem 0;
                font-style: italic;
                color: #718096;
              }
              .post-content code {
                background-color: #f7fafc;
                border: 1px solid #e2e8f0;
                border-radius: 0.25rem;
                padding: 0.125rem 0.25rem;
                font-size: 0.875em;
                color: #e53e3e;
              }
              .post-content pre {
                background-color: #1a202c;
                color: #e2e8f0;
                padding: 1rem;
                border-radius: 0.5rem;
                overflow-x: auto;
                margin: 1.5rem 0;
              }
              .post-content pre code {
                background-color: transparent;
                border: none;
                padding: 0;
                color: inherit;
                font-size: 0.875em;
              }
              .post-content img {
                max-width: 100%;
                height: auto;
                border-radius: 0.5rem;
                margin: 1.5rem 0;
              }
              .post-content table {
                width: 100%;
                border-collapse: collapse;
                margin: 1.5rem 0;
              }
              .post-content th,
              .post-content td {
                border: 1px solid #e2e8f0;
                padding: 0.75rem;
                text-align: left;
              }
              .post-content th {
                background-color: #f7fafc;
                font-weight: 600;
              }
            `}</style>
          </div>

          {/* Comments Section */}
          {post.commentsEnabled && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="border-t pt-8"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  <h2 className="text-2xl font-bold text-foreground">
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
                      <div>
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Share your thoughts..."
                          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={submittingComment || !newComment.trim()}
                        className="gap-2"
                      >
                        {submittingComment ? "Posting..." : "Post Comment"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground">
                                  {comment.author.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(comment.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm text-foreground">
                                {comment.content}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {comments.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 text-muted-foreground"
                  >
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No comments yet. Be the first to share your thoughts!</p>
                  </motion.div>
                )}
              </div>
            </motion.section>
          )}
        </motion.div>
      </div>
    </div>
  );
}
