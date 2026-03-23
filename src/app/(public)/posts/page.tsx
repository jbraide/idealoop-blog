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
  ArrowRight,
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
  const [companySettings, setCompanySettings] = useState({
    companyName: "Idealoop",
    companyDescription: "Insights for Product-Led Growth",
    primaryColor: "#4F46E5",
    secondaryColor: "#0F172A",
    accentColor: "#10B981",
  });
  const postsPerPage = 9;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [postsResult, categoriesResult, companyResponse] = await Promise.all([
          getPosts({
            status: ["published"],
            category: selectedCategory || undefined,
            search: searchQuery || undefined,
            page: currentPage,
            limit: postsPerPage,
          }),
          getCategories(),
          fetch("/api/company-settings"),
        ]);

        if (postsResult.success && postsResult.data) {
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
              status: post.status.toLowerCase() as "draft" | "published" | "archived",
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
              viewCount: post.viewCount || 0,
              uniqueViewCount: post.uniqueViewCount || 0,
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

        if (companyResponse.ok) {
          const companyData = await companyResponse.json();
          setCompanySettings(companyData);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [searchQuery, selectedCategory, currentPage]);

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
    <div
      className="min-h-screen bg-background"
      style={{
        "--company-primary": companySettings.primaryColor,
        "--company-secondary": companySettings.secondaryColor,
        "--company-accent": companySettings.accentColor,
      } as React.CSSProperties}
    >
      {/* Header Section */}
      <section className="relative py-20 overflow-hidden border-b border-muted">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--company-primary),transparent_50%)] opacity-[0.02]"></div>
        <div className="relative z-10 mx-auto max-w-7xl px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl text-left">
              <Button variant="ghost" asChild className="gap-2 mb-6 -ml-4 hover:bg-transparent">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Overview
                </Link>
              </Button>
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl mb-4">
                The <span className="text-[var(--company-primary)]">Library</span> of Insights
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Explore deep dives into building customer-driven products and scaling startups.
              </p>
            </div>

            <div className="flex-shrink-0">
              <div className="relative group w-full md:w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-[var(--company-primary)] transition-colors" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-muted bg-card pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--company-primary)]/20 focus:border-[var(--company-primary)] transition-all shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-12">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1 space-y-10 text-left">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--company-primary)] mb-6">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleCategoryChange("")}
                  className={cn(
                    "w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-between group",
                    selectedCategory === ""
                      ? "bg-[var(--company-primary)] text-white shadow-md shadow-[var(--company-primary)]/20"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>All Articles</span>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full", selectedCategory === "" ? "bg-white/20" : "bg-muted text-muted-foreground")}>
                    {posts.length}
                  </span>
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.name)}
                    className={cn(
                      "w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-between group",
                      selectedCategory === category.name
                        ? "bg-[var(--company-primary)] text-white shadow-md shadow-[var(--company-primary)]/20"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span className="truncate">{category.name}</span>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full", selectedCategory === category.name ? "bg-white/20" : "bg-muted text-muted-foreground")}>
                      {category.postCount}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-[var(--company-secondary)] p-6 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--company-primary)] opacity-20 rounded-full -mr-12 -mt-12"></div>
              <h4 className="font-bold text-lg mb-3 relative z-10">Subscribe</h4>
              <p className="text-sm text-white/70 mb-6 relative z-10">Get the latest product insights delivered to your inbox.</p>
              <div className="space-y-3 relative z-10">
                <input
                  type="email"
                  placeholder="name@email.com"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <Button className="w-full bg-white text-[var(--company-secondary)] hover:bg-white/90 font-bold">Join Newsletter</Button>
              </div>
            </div>
          </aside>

          {/* Grid Area */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="grid gap-8 md:grid-cols-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-96 rounded-2xl bg-muted animate-pulse"></div>
                ))}
              </div>
            ) : (
              <>
                {posts.length > 0 ? (
                  <>
                    <div className="grid gap-8 md:grid-cols-2">
                      {posts.map((post, index) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                        >
                          <Card className="group flex flex-col h-full border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden bg-card">
                            <Link href={`/posts/${post.slug}`} className="relative h-60 overflow-hidden">
                              {post.mainImage ? (
                                <img
                                  src={post.mainImage}
                                  alt={post.title}
                                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                                />
                              ) : (
                                <div className="w-full h-full bg-[var(--company-primary)]/5 flex items-center justify-center">
                                  <BookOpen className="w-12 h-12 text-[var(--company-primary)]/20" />
                                </div>
                              )}
                              <div className="absolute top-4 left-4">
                                <span className="px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-white/90 dark:bg-black/90 text-foreground shadow-lg backdrop-blur-sm">
                                  {post.categories[0] || "General"}
                                </span>
                              </div>
                            </Link>
                            <CardHeader className="flex-1 space-y-4 pt-8 px-8 text-left">
                              <div className="flex items-center gap-3 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                                <span>{formatDate(post.publishedAt!)}</span>
                                <span className="text-[var(--company-primary)]">•</span>
                                <span>{formatReadingTime(post.readingTime)}</span>
                              </div>
                              <Link href={`/posts/${post.slug}`}>
                                <CardTitle className="text-2xl leading-tight group-hover:text-[var(--company-primary)] transition-colors line-clamp-2">
                                  {post.title}
                                </CardTitle>
                              </Link>
                              <CardDescription className="line-clamp-3 text-base leading-relaxed">
                                {post.excerpt}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0 pb-8 px-8 flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                                <Eye className="h-4 w-4" />
                                <span>{post.viewCount}</span>
                              </div>
                              <Link href={`/posts/${post.slug}`} className="inline-flex items-center text-sm font-bold text-[var(--company-primary)] group/link">
                                Read Story <ArrowRight className="ml-2 w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                              </Link>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="mt-16 flex items-center justify-center gap-3">
                        <Button
                          variant="ghost"
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="rounded-xl"
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" /> Prev
                        </Button>
                        <div className="flex items-center gap-2">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "ghost"}
                              onClick={() => setCurrentPage(page)}
                              className={cn(
                                "w-10 h-10 rounded-xl font-bold",
                                currentPage === page ? "bg-[var(--company-primary)] shadow-lg shadow-[var(--company-primary)]/25" : ""
                              )}
                            >
                              {page}
                            </Button>
                          ))}
                        </div>
                        <Button
                          variant="ghost"
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="rounded-xl"
                        >
                          Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-24 bg-muted/20 rounded-3xl border-2 border-dashed border-muted">
                    <BookOpen className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
                    <h3 className="text-2xl font-bold mb-2">No matching stories</h3>
                    <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                      We couldn't find any articles matching your current search or category filter.
                    </p>
                    <Button onClick={clearFilters} variant="outline" className="rounded-xl px-8">Reset All Filters</Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
