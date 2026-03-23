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
  Send,
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
    <div className="min-h-screen bg-background" style={{
      "--company-primary": post?.categories[0] ? "#4F46E5" : "#4F46E5", // Can be dynamic based on category later
      "--company-secondary": "#0F172A",
      "--company-accent": "#10B981"
    } as any}>
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

      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-[var(--company-primary)] z-50 origin-left"
        style={{ scaleX: 0 }} // Logic to be added for scroll progress if needed, for now just a static line or handled by framer
      />

      <div className="relative">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-[var(--company-primary)]/5 to-transparent pointer-events-none"></div>
        <div className="absolute top-24 left-10 w-64 h-64 bg-[var(--company-primary)] opacity-[0.03] rounded-full blur-3xl pointer-events-none"></div>

        <div className="mx-auto max-w-4xl px-4 py-12 relative z-10">
          {/* Top Navigation */}
          <div className="flex items-center justify-between mb-12">
            <Button variant="ghost" size="sm" className="gap-2 rounded-xl hover:bg-[var(--company-primary)]/10 text-muted-foreground hover:text-[var(--company-primary)] transition-all" asChild>
              <Link href="/posts">
                <ArrowLeft className="h-4 w-4" />
                Back to Articles
              </Link>
            </Button>
            <div className="hidden sm:block">
              <Breadcrumbs
                items={breadcrumbHelpers.forPost(post.title, post.slug)}
                separator="chevron"
              />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-12"
          >
            {/* Post Header */}
            <header className="space-y-8 text-left">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {post.categories.map((category, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[var(--company-primary)]/10 text-[var(--company-primary)] border border-[var(--company-primary)]/20 shadow-sm"
                    >
                      {category}
                    </span>
                  ))}
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground leading-[1.1]">
                  {post.title}
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium line-clamp-3">
                  {post.excerpt}
                </p>
              </div>

              {/* Author & Meta Glassmorphism Card */}
              <div className="p-6 rounded-3xl bg-card/50 backdrop-blur-xl border border-muted shadow-sm flex flex-wrap items-center justify-between gap-8">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-muted overflow-hidden border-2 border-white shadow-sm">
                    {post.author?.image ? (
                      <img src={post.author.image} alt={post.author.name || ""} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--company-primary)]/20 to-[var(--company-accent)]/20">
                        <User className="h-6 w-6 text-[var(--company-primary)]/40" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{post.author?.name}</div>
                    <div className="text-sm text-muted-foreground font-medium">Author & Strategy</div>
                  </div>
                </div>

                <div className="flex items-center gap-8 text-sm font-bold text-muted-foreground uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[var(--company-primary)]" />
                    <span>{formatDate(post.publishedAt!)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[var(--company-accent)]" />
                    <span>{formatReadingTime(post.readingTime)}</span>
                  </div>
                </div>
              </div>
            </header>

            {/* Main Image */}
            {post.mainImage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-[var(--company-primary)] to-[var(--company-accent)] rounded-[2rem] blur opacity-10"></div>
                <div className="relative aspect-[21/9] w-full overflow-hidden rounded-[2rem] border shadow-2xl">
                  <OptimizedImage
                    src={post.mainImage}
                    alt={post.title}
                    width={1200}
                    height={600}
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                    priority={true}
                  />
                </div>
              </motion.div>
            )}

            {/* Post Layout: Content + Action Sidebar (Desktop) */}
            <div className="grid lg:grid-cols-12 gap-16 relative">
              {/* Floating Social Sidebar */}
              <div className="hidden lg:block lg:col-span-1">
                <div className="sticky top-24 space-y-4">
                  <SocialShare
                    url={postUrl}
                    title={post.title}
                    description={post.excerpt}
                    variant="dropdown"
                  />
                  <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl bg-card/50 backdrop-blur-md border hover:border-[var(--company-primary)] group transition-all">
                    <Bookmark className="h-5 w-5 group-hover:text-[var(--company-primary)]" />
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-11 max-w-3xl">
                {/* Content */}
                <article className="prose prose-lg dark:prose-invert max-w-none prose-headings:tracking-tighter prose-headings:font-black prose-p:leading-relaxed prose-p:text-muted-foreground/90">
                  <div
                    dangerouslySetInnerHTML={{ __html: post.content }}
                    className="post-content-container"
                  />
                </article>

                <style jsx global>{`
                  .post-content-container {
                    font-size: 1.125rem;
                    line-height: 1.8;
                    color: hsl(var(--foreground));
                  }
                  .post-content-container h2 {
                    font-size: 2.25rem;
                    font-weight: 900;
                    margin-top: 3rem;
                    margin-bottom: 1.5rem;
                    letter-spacing: -0.05em;
                    line-height: 1.1;
                  }
                  .post-content-container h3 {
                    font-size: 1.75rem;
                    font-weight: 800;
                    margin-top: 2.5rem;
                    margin-bottom: 1rem;
                    letter-spacing: -0.02em;
                  }
                  .post-content-container p {
                    margin-bottom: 1.5rem;
                  }
                  .post-content-container blockquote {
                    position: relative;
                    padding: 2rem;
                    margin: 3rem 0;
                    background: hsl(var(--primary) / 0.05);
                    border-radius: 2rem;
                    border-left: 8px solid hsl(var(--primary));
                    font-style: italic;
                    font-size: 1.25rem;
                    font-weight: 600;
                  }
                  .post-content-container ul {
                    list-style-type: none;
                    padding-left: 0;
                    margin-bottom: 2rem;
                  }
                  .post-content-container li {
                    position: relative;
                    padding-left: 2rem;
                    margin-bottom: 0.75rem;
                  }
                  .post-content-container li::before {
                    content: "→";
                    position: absolute;
                    left: 0;
                    color: hsl(var(--primary));
                    font-weight: bold;
                  }
                  .post-content-container pre {
                    background: #0f172a;
                    padding: 2rem;
                    border-radius: 1.5rem;
                    margin: 2.5rem 0;
                    overflow-x: auto;
                    box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
                  }
                  .post-content-container img {
                    border-radius: 2rem;
                    margin: 3rem 0;
                    box-shadow: var(--shadow-xl);
                  }
                `}</style>

                {/* Tags Footer */}
                <div className="mt-16 pt-8 border-t flex flex-wrap gap-3">
                  <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground w-full mb-2">Explore more</span>
                  {post.tags.map((tag, i) => (
                    <Link key={i} href={`/tags/${tag.toLowerCase()}`} className="px-5 py-2 rounded-xl bg-muted hover:bg-[var(--company-primary)] hover:text-white transition-all font-bold text-sm shadow-sm">
                      #{tag}
                    </Link>
                  ))}
                </div>

                {/* Comments Section */}
                {post.commentsEnabled && (
                  <section className="mt-24 pt-24 border-t space-y-12">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-[var(--company-primary)]/10 flex items-center justify-center text-[var(--company-primary)]">
                          <MessageSquare className="h-6 w-6" />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight">
                          Pulse ({comments.length})
                        </h2>
                      </div>
                    </div>

                    {/* Modern Comment Form */}
                    <div className="p-8 rounded-[2rem] bg-card border border-muted shadow-lg space-y-6">
                      <h3 className="text-xl font-bold">What's your take?</h3>
                      <form onSubmit={handleSubmitComment} className="space-y-4">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Your perspective matters..."
                          className="w-full min-h-[120px] rounded-2xl bg-muted/50 border-none p-5 text-base focus:ring-2 focus:ring-[var(--company-primary)] transition-all resize-none"
                          required
                        />
                        <div className="flex justify-end">
                          <Button
                            type="submit"
                            disabled={submittingComment || !newComment.trim()}
                            className="bg-[var(--company-primary)] hover:bg-[var(--company-primary)]/90 text-white font-bold h-14 px-8 rounded-2xl shadow-xl shadow-[var(--company-primary)]/20 transition-all hover:-translate-y-1"
                          >
                            {submittingComment ? "Syncing..." : "Post Reflection"} <Send className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </form>
                    </div>

                    {/* Comments Timeline */}
                    <div className="space-y-8">
                      {comments.map((comment) => (
                        <motion.div
                          key={comment.id}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          className="relative pl-8 before:absolute before:left-0 before:top-4 before:bottom-0 before:w-px before:bg-muted"
                        >
                          <div className="flex items-start gap-4">
                            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground font-bold shrink-0">
                              {comment.author.name[0]}
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-foreground">
                                  {comment.author.name}
                                </span>
                                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                  {formatDate(comment.createdAt)}
                                </span>
                              </div>
                              <p className="text-muted-foreground leading-relaxed">
                                {comment.content}
                              </p>
                              <Button variant="ghost" size="sm" className="h-auto p-0 text-xs font-bold text-[var(--company-primary)] hover:bg-transparent">
                                Reply
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {comments.length === 0 && (
                      <div className="text-center py-16 bg-muted/20 rounded-[2rem] border border-dashed">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                        <p className="font-bold text-muted-foreground">Start the conversation</p>
                      </div>
                    )}
                  </section>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
