"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Clock,
  Eye,
  Tag,
  Search,
  Filter,
  ArrowLeft,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { getPosts, getCategories } from "@/lib/actions";
import { BlogPost, Category } from "@/types";
import { cn, formatDate, formatReadingTime } from "@/lib/utils";

export default function PostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 9;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [postsResult, categoriesResult] = await Promise.all([
          getPosts({
            status: ["published"],
            category: selectedCategory || undefined,
            search: searchQuery || undefined,
            page: currentPage,
            limit: postsPerPage,
          }),
          getCategories(),
        ]);

        if (postsResult.success && postsResult.data) {
          // Transform the data to match BlogPost interface
          const transformedPosts: BlogPost[] = postsResult.data.posts.map(
            (post) => ({
              id: post.id,
              title: post.title,
              slug: post.slug,
              content: post.content,
              excerpt: post.excerpt || "",
              authorId: post.authorId,
              mainImage: post.mainImage || "",
              author: {
                id: post.author.id,
                email: post.author.email,
                name: post.author.name || "",
                image: post.author.image || "",
                role: "admin",
              },
              status: post.status.toLowerCase() as
                | "draft"
                | "published"
                | "archived",
              categories: post.categories.map((cat) => cat.name),
              tags: post.tags.map((tag) => tag.name),
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
              readingTime: Math.ceil(post.content.split(/\s+/).length / 200),
              viewCount: 0,
              uniqueViewCount: 0,
              commentCount: post._count?.comments || 0,
            }),
          );
          setPosts(transformedPosts);
          setTotalPages(postsResult.data.pagination?.pages || 1);
        }

        if (categoriesResult.success && categoriesResult.data) {
          const transformedCategories: Category[] = categoriesResult.data.map(
            (category) => ({
              id: category.id,
              name: category.name,
              slug: category.slug,
              description: category.description || "",
              color: category.color || "#3B82F6",
              postCount: category.postCount,
              createdAt: category.createdAt,
              updatedAt: category.updatedAt,
            }),
          );
          setCategories(transformedCategories);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [searchQuery, selectedCategory, currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category === selectedCategory ? "" : category);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <Button variant="ghost" asChild className="gap-2 mb-4">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                All Articles
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Browse our complete collection of articles and tutorials
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span>Filter by:</span>
              </div>
              <Button
                variant={selectedCategory === "" ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryChange("")}
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.name ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handleCategoryChange(category.name)}
                >
                  {category.name}
                </Button>
              ))}
            </div>

            {/* Clear Filters */}
            {(searchQuery || selectedCategory) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground"
              >
                Clear all
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {posts.length} articles
                {selectedCategory && ` in "${selectedCategory}"`}
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            </div>

            {/* Posts Grid */}
            {posts.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="group h-full cursor-pointer transition-all hover:shadow-lg">
                      <Link href={`/posts/${post.slug}`}>
                        {post.mainImage && (
                          <div className="relative aspect-video w-full overflow-hidden">
                            <img
                              src={post.mainImage}
                              alt={post.title}
                              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(post.publishedAt!)}</span>
                            <Clock className="h-3 w-3 ml-2" />
                            <span>{formatReadingTime(post.readingTime)}</span>
                          </div>
                          <CardTitle className="line-clamp-2 text-lg group-hover:text-primary transition-colors">
                            {post.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-2">
                            {post.excerpt}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Eye className="h-3 w-3" />
                              <span>{post.viewCount} views</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {post.categories
                                .slice(0, 2)
                                .map((category, i) => (
                                  <span
                                    key={i}
                                    className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                                  >
                                    <Tag className="h-2 w-2 mr-1" />
                                    {category}
                                  </span>
                                ))}
                            </div>
                          </div>
                        </CardContent>
                      </Link>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <BookOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium text-foreground mb-2">
                  No articles found
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || selectedCategory
                    ? "Try adjusting your search terms or filters"
                    : "Check back soon for new content"}
                </p>
                {(searchQuery || selectedCategory) && (
                  <Button onClick={clearFilters}>Clear filters</Button>
                )}
              </motion.div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ),
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
