"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Edit,
  Calendar,
  User,
  Tag,
  BookOpen,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { getPostById } from "@/lib/actions";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  status: string;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  mainImage: string | null;
  commentsEnabled: boolean;
  author: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

export default function PostPreviewPage({ params }: RouteParams) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [postId, setPostId] = useState<string>("");
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setPostId(resolvedParams.id);
    };
    loadParams();
  }, [params]);

  useEffect(() => {
    if (!postId) return;

    const loadPost = async () => {
      try {
        const result = await getPostById(postId);

        if (result.success && result.data) {
          setPost({
            ...result.data,
            excerpt: result.data.excerpt || "",
          });
        } else {
          setError(result.error || "Failed to load post");
        }
      } catch (error) {
        console.error("Error loading post:", error);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [postId]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (
    !session ||
    (session.user?.role !== "ADMIN" &&
      session.user?.role !== "admin" &&
      session.user?.role !== "EDITOR")
  ) {
    router.push("/auth/signin");
    return null;
  }

  if (error || !post) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/admin/posts">
              <ArrowLeft className="h-4 w-4" />
              Back to Posts
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Post Preview
            </h1>
          </div>
        </div>
        <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20">
          {error || "Post not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="gap-2">
              <Link href="/admin/posts">
                <ArrowLeft className="h-4 w-4" />
                Back to Posts
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Post Preview
              </h1>
              <p className="text-muted-foreground">Previewing: {post.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild className="gap-2">
              <Link href={`/admin/posts/${post.id}/edit`}>
                <Edit className="h-4 w-4" />
                Edit Post
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Preview Notice */}
      {post.status !== "published" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-lg bg-yellow-100 p-4 text-sm text-yellow-800 border border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-800"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Preview Mode</span>
          </div>
          <p className="mt-1">
            This post is currently in <strong>{post.status}</strong> status and
            is not visible to the public.
          </p>
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-3"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{post.title}</CardTitle>
              {post.excerpt && (
                <CardDescription className="text-lg">
                  {post.excerpt}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {/* Main Image */}
              {post.mainImage && (
                <div className="mb-6">
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                    <img
                      src={post.mainImage}
                      alt={post.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
              )}
              <div
                dangerouslySetInnerHTML={{ __html: post.content || "" }}
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
                .post-content img {
                  max-width: 100%;
                  height: auto;
                  border-radius: 0.5rem;
                  margin: 1rem 0;
                }
                .post-content code {
                  background-color: #f7fafc;
                  padding: 0.125rem 0.25rem;
                  border-radius: 0.25rem;
                  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
                  font-size: 0.875rem;
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
                  color: inherit;
                  padding: 0;
                }
              `}</style>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Post Info */}
          <Card>
            <CardHeader>
              <CardTitle>Post Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    post.status === "published"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : post.status === "draft"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                  }`}
                >
                  {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Comments:</span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    (post.commentsEnabled ?? true)
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                  }`}
                >
                  {(post.commentsEnabled ?? true)
                    ? "Comments Enabled"
                    : "Comments Disabled"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Slug:</span>
                <span className="font-mono">{post.slug}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Author:</span>
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  <span>{post.author.name || "Unknown"}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated:</span>
                <span>{new Date(post.updatedAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          {post.categories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {post.categories.map((category, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {post.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-secondary/10 px-2 py-1 text-xs font-medium text-secondary-foreground"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
