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

export default function NewPostPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
          setAvailableCategories(categoriesResult.data || []);
        }

        if (tagsResult.success) {
          setAvailableTags(tagsResult.data || []);
        }
      } catch (error) {
        console.error("Error loading categories and tags:", error);
      }
    };

    loadCategoriesAndTags();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        body: JSON.stringify({
          name: newTagName.trim(),
        }),
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
      setError("Failed to create tag");
    } finally {
      setIsCreatingTag(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const postData: any = {
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

      // Set publishedAt date if status is published
      if (formData.status === "published") {
        postData.publishedAt = new Date().toISOString();
      }

      const response = await fetch("/api/admin/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess("Post created successfully!");
        setFormData({
          title: "",
          content: "",
          excerpt: "",
          status: "draft",
          categories: [],
          tags: [],
          mainImage: "",
          commentsEnabled: true,
          // Reset SEO Fields
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

        // Redirect to posts list after a short delay
        setTimeout(() => {
          router.push("/admin/posts");
        }, 1500);
      } else {
        setError(result.error || "Failed to create post");
      }
    } catch (error) {
      setError("Failed to create post");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    router.push("/auth/signin");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/posts">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Posts
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  Create New Post
                </h1>
                <p className="text-muted-foreground">
                  Write and publish a new blog post
                </p>
              </div>
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
                Write your blog post content and metadata
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                        disabled={isLoading}
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
                        disabled={isLoading}
                      />
                      <p className="text-xs text-muted-foreground">
                        Comma-separated list of keywords for search engines.
                      </p>
                    </div>

                    {/* Meta Description */}
                    <div className="space-y-2">
                      <Label htmlFor="metaDescription">Meta Description</Label>
                      <Textarea
                        id="metaDescription"
                        name="metaDescription"
                        placeholder="Custom description for search engines (optional)"
                        value={formData.metaDescription}
                        onChange={handleInputChange}
                        disabled={isLoading}
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
                        disabled={isLoading}
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
                            disabled={isLoading}
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
                            disabled={isLoading}
                            rows={2}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ogImage">Open Graph Image URL</Label>
                          <Input
                            id="ogImage"
                            name="ogImage"
                            type="text"
                            placeholder="https://example.com/image.jpg (optional)"
                            value={formData.ogImage}
                            onChange={handleInputChange}
                            disabled={isLoading}
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
                            disabled={isLoading}
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
                            disabled={isLoading}
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
                            disabled={isLoading}
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
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-muted-foreground">
                    {formData.content.length} characters
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading || !formData.title || !formData.content}
                    className="gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Create Post
                      </>
                    )}
                  </Button>
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
                <Calendar className="h-5 w-5" />
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
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as "draft" | "published",
                    }))
                  }
                  disabled={isLoading}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Categories</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availableCategories.map((category) => (
                    <div key={category.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`category-${category.id}`}
                        checked={formData.categories.includes(category.id)}
                        onChange={() => handleCategoryToggle(category.id)}
                        disabled={isLoading}
                        className="rounded border-gray-300"
                      />
                      <Label
                        htmlFor={`category-${category.id}`}
                        className="text-sm font-normal"
                      >
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              {formData.categories.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Categories</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.categories.map((categoryId) => {
                      const category = availableCategories.find(
                        (c) => c.id === categoryId,
                      );
                      return category ? (
                        <span
                          key={category.id}
                          className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                        >
                          {category.name}
                          <button
                            type="button"
                            onClick={() => removeCategory(category.id)}
                            disabled={isLoading}
                            className="hover:text-primary/70"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Tags</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availableTags.map((tag) => (
                    <div key={tag.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`tag-${tag.id}`}
                        checked={formData.tags.includes(tag.id)}
                        onChange={() => handleTagToggle(tag.id)}
                        disabled={isLoading}
                        className="rounded border-gray-300"
                      />
                      <Label
                        htmlFor={`tag-${tag.id}`}
                        className="text-sm font-normal"
                      >
                        {tag.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newTag">Create New Tag</Label>
                <div className="flex gap-2">
                  <Input
                    id="newTag"
                    type="text"
                    placeholder="New tag name..."
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    disabled={isLoading || isCreatingTag}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleCreateTag}
                    disabled={!newTagName.trim() || isCreatingTag || isLoading}
                    size="sm"
                  >
                    {isCreatingTag ? "..." : "Add"}
                  </Button>
                </div>
              </div>
              {formData.tags.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tagId) => {
                      const tag = availableTags.find((t) => t.id === tagId);
                      return tag ? (
                        <span
                          key={tag.id}
                          className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2 py-1 text-xs font-medium text-secondary-foreground"
                        >
                          {tag.name}
                          <button
                            type="button"
                            onClick={() => removeTag(tag.id)}
                            disabled={isLoading}
                            className="hover:text-secondary-foreground/70"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Featured Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mainImage">Image URL</Label>
                <Input
                  id="mainImage"
                  name="mainImage"
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={formData.mainImage}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
              {formData.mainImage && (
                <div className="aspect-video w-full overflow-hidden rounded-lg border">
                  <img
                    src={formData.mainImage}
                    alt="Featured preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="commentsEnabled"
                  checked={formData.commentsEnabled}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      commentsEnabled: e.target.checked,
                    }))
                  }
                  disabled={isLoading}
                  className="rounded border-gray-300"
                />
                <Label
                  htmlFor="commentsEnabled"
                  className="text-sm font-normal"
                >
                  Enable comments for this post
                </Label>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
