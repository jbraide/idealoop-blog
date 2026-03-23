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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CKEditorComponent } from "@/components/ui/ckeditor";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Save,
  FileText,
  Calendar,
  Eye,
  Tag,
  BookOpen,
  X,
  Image,
  MessageSquare,
  Search,
  Share2,
  Twitter,
} from "lucide-react";
import Link from "next/link";

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

export default function EditPostPage({ params }: RouteParams) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [postId, setPostId] = useState<string>("");
  const [post, setPost] = useState<Post | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    status: "draft" as "draft" | "published",
    categories: [] as string[],
    tags: [] as string[],
    mainImage: "",
    commentsEnabled: true,
    // SEO Fields
    metaTitle: "",
    metaDescription: "",
    keywords: "",
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    ogType: "article",
    twitterTitle: "",
    twitterDescription: "",
    twitterImage: "",
    twitterCreator: "",
  });

  const [availableCategories, setAvailableCategories] = useState<any[]>([]);
  const [availableTags, setAvailableTags] = useState<any[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setPostId(resolvedParams.id);
    };
    loadParams();
  }, [params]);

  useEffect(() => {
    const loadCategoriesAndTags = async () => {
      try {
        const [categoriesResponse, tagsResponse] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/tags"),
        ]);

        const categoriesResult = await categoriesResponse.json();
        const tagsResult = await tagsResponse.json();

        if (categoriesResult.success) {
          setAvailableCategories(categoriesResult.data);
        }
        if (tagsResult.success) {
          setAvailableTags(tagsResult.data);
        }
      } catch (error) {
        console.error("Error loading categories and tags:", error);
      }
    };

    loadCategoriesAndTags();
  }, []);

  useEffect(() => {
    if (!postId) return;

    const loadPost = async () => {
      try {
        const response = await fetch(`/api/admin/posts/${postId}`);
        const result = await response.json();

        if (result.success && result.data) {
          const foundPost = result.data;
          setPost(foundPost);
          setFormData({
            title: foundPost.title,
            content: foundPost.content,
            excerpt: foundPost.excerpt || "",
            status: foundPost.status.toLowerCase() as "draft" | "published",
            categories: foundPost.categories.map((c: any) => c.id),
            tags: foundPost.tags.map((t: any) => t.id),
            mainImage: foundPost.mainImage || "",
            commentsEnabled: foundPost.commentsEnabled ?? true,
            // SEO Fields
            metaTitle: foundPost.metaTitle || "",
            metaDescription: foundPost.metaDescription || "",
            keywords: foundPost.keywords || "",
            canonicalUrl: foundPost.canonicalUrl || "",
            ogTitle: foundPost.ogTitle || "",
            ogDescription: foundPost.ogDescription || "",
            ogImage: foundPost.ogImage || "",
            ogType: foundPost.ogType || "article",
            twitterTitle: foundPost.twitterTitle || "",
            twitterDescription: foundPost.twitterDescription || "",
            twitterImage: foundPost.twitterImage || "",
            twitterCreator: foundPost.twitterCreator || "",
          });
        } else {
          setError(result.error || "Failed to load post");
        }
      } catch (error) {
        console.error("Error loading post:", error);
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    loadPost();
  }, [postId]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-background font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
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

  if (error && !post) {
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
              Edit Post
            </h1>
          </div>
        </div>
        <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20">
          {error}
        </div>
      </div>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((id) => id !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  const handleTagToggle = (tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter((id) => id !== tagId)
        : [...prev.tags, tagId],
    }));
  };

  const removeCategory = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter((id) => id !== categoryId),
    }));
  };

  const removeTag = (tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((id) => id !== tagId),
    }));
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    setIsCreatingTag(true);
    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newTagName.trim() }),
      });

      const result = await response.json();

      if (result.success) {
        setAvailableTags((prev) => [...prev, result.data]);
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, result.data.id],
        }));
        setNewTagName("");
      } else {
        setError(result.error || "Failed to create tag");
      }
    } catch (error) {
      console.error("Error creating tag:", error);
      setError("Failed to create tag");
    } finally {
      setIsCreatingTag(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // Set publishedAt date if status is changing to published
      const updateData: any = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        status: formData.status.toUpperCase(),
        categories: formData.categories,
        tags: formData.tags,
        mainImage: formData.mainImage,
        commentsEnabled: formData.commentsEnabled,
        // SEO Fields
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        keywords: formData.keywords,
        canonicalUrl: formData.canonicalUrl,
        ogTitle: formData.ogTitle,
        ogDescription: formData.ogDescription,
        ogImage: formData.ogImage,
        ogType: formData.ogType,
        twitterTitle: formData.twitterTitle,
        twitterDescription: formData.twitterDescription,
        twitterImage: formData.twitterImage,
        twitterCreator: formData.twitterCreator,
      };

      // If status is changing to published and it wasn't published before, set publishedAt
      if (formData.status === "published" && post?.status !== "published") {
        updateData.publishedAt = new Date().toISOString();
      }

      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess("Post updated successfully!");

        // Redirect to posts list after a short delay
        setTimeout(() => {
          router.push("/admin/posts");
        }, 1500);
      } else {
        setError(result.error || "Failed to update post");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
                Edit Post
              </h1>
              <p className="text-muted-foreground">
                Update and manage your blog post
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Success/Error Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20"
        >
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-lg bg-green-100 p-4 text-sm text-green-800 border border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800"
        >
          {success}
        </motion.div>
      )}

      {post && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Post Content
                </CardTitle>
                <CardDescription>
                  Update your blog post content and metadata
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      type="text"
                      placeholder="Enter post title..."
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      className="text-lg font-medium"
                    />
                  </div>

                  {/* Excerpt */}
                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      name="excerpt"
                      placeholder="Brief description of your post..."
                      value={formData.excerpt}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      A short summary that will appear in post listings and meta
                      descriptions.
                    </p>
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <CKEditorComponent
                      content={formData.content}
                      onChange={(content) =>
                        setFormData((prev) => ({ ...prev, content }))
                      }
                      placeholder="Write your post content here..."
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* SEO Fields */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      SEO Settings
                    </h3>
                    <div className="grid gap-4">
                      {/* Meta Title */}
                      <div className="space-y-2">
                        <Label htmlFor="metaTitle">Meta Title</Label>
                        <Input
                          id="metaTitle"
                          name="metaTitle"
                          type="text"
                          placeholder="Custom title for search engines (optional)"
                          value={formData.metaTitle}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                        />
                        <p className="text-xs text-muted-foreground">
                          If empty, the post title will be used. Recommended:
                          50-60 characters.
                        </p>
                      </div>

                      {/* Keywords */}
                      <div className="space-y-2">
                        <Label htmlFor="keywords">Keywords</Label>
                        <Input
                          id="keywords"
                          name="keywords"
                          type="text"
                          placeholder="keyword1, keyword2, keyword3 (optional)"
                          value={formData.keywords}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                        />
                        <p className="text-xs text-muted-foreground">
                          Comma-separated list of keywords for search engines.
                        </p>
                      </div>

                      {/* Meta Description */}
                      <div className="space-y-2">
                        <Label htmlFor="metaDescription">
                          Meta Description
                        </Label>
                        <Textarea
                          id="metaDescription"
                          name="metaDescription"
                          placeholder="Custom description for search engines (optional)"
                          value={formData.metaDescription}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                          rows={3}
                        />
                        <p className="text-xs text-muted-foreground">
                          If empty, the post excerpt will be used. Recommended:
                          150-160 characters.
                        </p>
                      </div>

                      {/* Canonical URL */}
                      <div className="space-y-2">
                        <Label htmlFor="canonicalUrl">Canonical URL</Label>
                        <Input
                          id="canonicalUrl"
                          name="canonicalUrl"
                          type="text"
                          placeholder="https://example.com/posts/slug (optional)"
                          value={formData.canonicalUrl}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                        />
                        <p className="text-xs text-muted-foreground">
                          Specify if this content appears on multiple URLs to
                          avoid duplicate content.
                        </p>
                      </div>

                      {/* Open Graph Fields */}
                      <div className="border-t pt-4">
                        <h4 className="text-md font-medium mb-3 flex items-center gap-2">
                          <Share2 className="h-4 w-4" />
                          Open Graph Settings
                        </h4>
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="ogTitle">Open Graph Title</Label>
                            <Input
                              id="ogTitle"
                              name="ogTitle"
                              type="text"
                              placeholder="Custom title for social sharing (optional)"
                              value={formData.ogTitle}
                              onChange={handleInputChange}
                              disabled={isSubmitting}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="ogDescription">
                              Open Graph Description
                            </Label>
                            <Textarea
                              id="ogDescription"
                              name="ogDescription"
                              placeholder="Custom description for social sharing (optional)"
                              value={formData.ogDescription}
                              onChange={handleInputChange}
                              disabled={isSubmitting}
                              rows={2}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="ogImage">
                              Open Graph Image URL
                            </Label>
                            <Input
                              id="ogImage"
                              name="ogImage"
                              type="text"
                              placeholder="https://example.com/image.jpg (optional)"
                              value={formData.ogImage}
                              onChange={handleInputChange}
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Twitter Card Fields */}
                      <div className="border-t pt-4">
                        <h4 className="text-md font-medium mb-3 flex items-center gap-2">
                          <Twitter className="h-4 w-4" />
                          Twitter Card Settings
                        </h4>
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="twitterTitle">Twitter Title</Label>
                            <Input
                              id="twitterTitle"
                              name="twitterTitle"
                              type="text"
                              placeholder="Custom title for Twitter (optional)"
                              value={formData.twitterTitle}
                              onChange={handleInputChange}
                              disabled={isSubmitting}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="twitterDescription">
                              Twitter Description
                            </Label>
                            <Textarea
                              id="twitterDescription"
                              name="twitterDescription"
                              placeholder="Custom description for Twitter (optional)"
                              value={formData.twitterDescription}
                              onChange={handleInputChange}
                              disabled={isSubmitting}
                              rows={2}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="twitterImage">
                              Twitter Image URL
                            </Label>
                            <Input
                              id="twitterImage"
                              name="twitterImage"
                              type="text"
                              placeholder="https://example.com/image.jpg (optional)"
                              value={formData.twitterImage}
                              onChange={handleInputChange}
                              disabled={isSubmitting}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="twitterCreator">
                              Twitter Creator
                            </Label>
                            <Input
                              id="twitterCreator"
                              name="twitterCreator"
                              type="text"
                              placeholder="@username (optional)"
                              value={formData.twitterCreator}
                              onChange={handleInputChange}
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/admin/posts")}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        type="submit"
                        name="status"
                        value="draft"
                        variant="outline"
                        disabled={isSubmitting}
                        className="gap-2"
                      >
                        {isSubmitting ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Save as Draft
                      </Button>

                      <Button
                        type="submit"
                        name="status"
                        value="published"
                        disabled={isSubmitting}
                        className="gap-2"
                      >
                        {isSubmitting ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        Update & Publish
                      </Button>
                    </div>
                  </div>
                </form>
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
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Post Status</Label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Post Info */}
            <Card>
              <CardHeader>
                <CardTitle>Post Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Slug:</span>
                  <span className="font-mono">{post.slug}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Author:</span>
                  <span>{post.author.name || "Unknown"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span>{new Date(post.updatedAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Comments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="commentsEnabled">Allow Comments</Label>
                    <p className="text-xs text-muted-foreground">
                      Enable or disable comments for this post
                    </p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="commentsEnabled"
                      name="commentsEnabled"
                      checked={formData.commentsEnabled}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          commentsEnabled: e.target.checked,
                        }))
                      }
                      disabled={isSubmitting}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Image */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Main Image
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mainImage">Image URL</Label>
                  <Input
                    id="mainImage"
                    name="mainImage"
                    type="text"
                    placeholder="Enter image URL or select from media library..."
                    value={formData.mainImage}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    The main image that will be displayed at the top of your
                    post.
                  </p>
                  {formData.mainImage && (
                    <div className="mt-2">
                      <div className="text-xs text-muted-foreground mb-2">
                        Preview:
                      </div>
                      <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                        <img
                          src={formData.mainImage}
                          alt="Main image preview"
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* SEO Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  SEO Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    name="metaTitle"
                    type="text"
                    placeholder="Custom meta title (optional)"
                    value={formData.metaTitle}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    Custom title for search engines. Leave empty to use post
                    title.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <textarea
                    id="metaDescription"
                    name="metaDescription"
                    placeholder="Custom meta description (optional)"
                    value={formData.metaDescription}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    rows={3}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Custom description for search engines. Leave empty to use
                    post excerpt.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input
                    id="keywords"
                    name="keywords"
                    type="text"
                    placeholder="Comma-separated keywords (optional)"
                    value={formData.keywords}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    Keywords for search engine optimization.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="canonicalUrl">Canonical URL</Label>
                  <Input
                    id="canonicalUrl"
                    name="canonicalUrl"
                    type="text"
                    placeholder="/posts/slug (optional)"
                    value={formData.canonicalUrl}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    Canonical URL to prevent duplicate content.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ogTitle">Open Graph Title</Label>
                  <Input
                    id="ogTitle"
                    name="ogTitle"
                    type="text"
                    placeholder="Custom OG title (optional)"
                    value={formData.ogTitle}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    Title for social media sharing.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ogDescription">Open Graph Description</Label>
                  <textarea
                    id="ogDescription"
                    name="ogDescription"
                    placeholder="Custom OG description (optional)"
                    value={formData.ogDescription}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    rows={2}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Description for social media sharing.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ogImage">Open Graph Image</Label>
                  <Input
                    id="ogImage"
                    name="ogImage"
                    type="text"
                    placeholder="OG image URL (optional)"
                    value={formData.ogImage}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    Image for social media sharing.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitterTitle">Twitter Title</Label>
                  <Input
                    id="twitterTitle"
                    name="twitterTitle"
                    type="text"
                    placeholder="Custom Twitter title (optional)"
                    value={formData.twitterTitle}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    Title for Twitter sharing.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitterDescription">
                    Twitter Description
                  </Label>
                  <textarea
                    id="twitterDescription"
                    name="twitterDescription"
                    placeholder="Custom Twitter description (optional)"
                    value={formData.twitterDescription}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    rows={2}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Description for Twitter sharing.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitterImage">Twitter Image</Label>
                  <Input
                    id="twitterImage"
                    name="twitterImage"
                    type="text"
                    placeholder="Twitter image URL (optional)"
                    value={formData.twitterImage}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    Image for Twitter sharing.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitterCreator">Twitter Creator</Label>
                  <Input
                    id="twitterCreator"
                    name="twitterCreator"
                    type="text"
                    placeholder="@username (optional)"
                    value={formData.twitterCreator}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    Twitter handle of the content creator.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Selected Categories</Label>
                  <div className="flex flex-wrap gap-2 min-h-10">
                    {formData.categories.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No categories assigned
                      </p>
                    ) : (
                      formData.categories.map((categoryId) => {
                        const category = availableCategories.find(
                          (c) => c.id === categoryId,
                        );
                        return category ? (
                          <div
                            key={category.id}
                            className="inline-flex items-center gap-1 bg-primary/10 text-primary rounded-full px-3 py-1 text-sm"
                          >
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: category.color || "#3B82F6",
                              }}
                            />
                            <span>{category.name}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeCategory(category.id);
                              }}
                              className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : null;
                      })
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Available Categories</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableCategories.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No categories available
                      </p>
                    ) : (
                      availableCategories
                        .filter(
                          (category) =>
                            !formData.categories.includes(category.id),
                        )
                        .map((category) => (
                          <div
                            key={category.id}
                            className="flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                            onClick={() => handleCategoryToggle(category.id)}
                          >
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: category.color || "#3B82F6",
                              }}
                            />
                            <span className="text-sm">{category.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({category.postCount || 0})
                            </span>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Selected Tags</Label>
                  <div className="flex flex-wrap gap-2 min-h-10">
                    {formData.tags.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No tags assigned
                      </p>
                    ) : (
                      formData.tags.map((tagId) => {
                        const tag = availableTags.find((t) => t.id === tagId);
                        return tag ? (
                          <div
                            key={tag.id}
                            className="inline-flex items-center gap-1 bg-secondary/10 text-secondary-foreground rounded-full px-3 py-1 text-sm"
                          >
                            <Tag className="h-3 w-3" />
                            <span>{tag.name}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeTag(tag.id);
                              }}
                              className="ml-1 hover:bg-secondary/20 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : null;
                      })
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Available Tags</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableTags.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No tags available
                      </p>
                    ) : (
                      availableTags
                        .filter((tag) => !formData.tags.includes(tag.id))
                        .map((tag) => (
                          <div
                            key={tag.id}
                            className="flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                            onClick={() => handleTagToggle(tag.id)}
                          >
                            <Tag className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{tag.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({tag.postCount || 0})
                            </span>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                {/* Create New Tag */}
                <div className="space-y-2">
                  <Label htmlFor="newTag">Create New Tag</Label>
                  <div className="flex gap-2">
                    <Input
                      id="newTag"
                      type="text"
                      placeholder="Enter tag name..."
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      disabled={isCreatingTag || isSubmitting}
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleCreateTag();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleCreateTag}
                      disabled={
                        !newTagName.trim() || isCreatingTag || isSubmitting
                      }
                    >
                      {isCreatingTag ? "..." : "Add"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
