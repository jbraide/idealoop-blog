"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Eye,
  Search,
  Tag,
  Users,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Linkedin,
  Github,
  Instagram,
} from "lucide-react";
import Link from "next/link";
import { getPosts, getCategories } from "@/lib/actions";
import { BlogPost, Category } from "@/types";
import { cn, formatDate, formatReadingTime } from "@/lib/utils";

export default function Home() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [companySettings, setCompanySettings] = useState({
    companyName: "Modern Blog",
    companyDescription: "A beautiful, fast, and modern blog built with Next.js",
    companyEmail: "",
    companyPhone: "",
    companyAddress: "",
    companyLogo: "",
    primaryColor: "#2563EB",
    secondaryColor: "#1E293B",
    accentColor: "#059669",
    twitterUrl: "",
    linkedinUrl: "",
    githubUrl: "",
    instagramUrl: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [postsResult, categoriesResult, companyResponse] =
          await Promise.all([
            getPosts({ status: ["published"], limit: 6 }),
            getCategories(),
            fetch("/api/company-settings"),
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
              author: post.author,
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
              viewCount: post.viewCount || 0,
              uniqueViewCount: post.uniqueViewCount || 0,
              commentCount: post._count?.comments || 0,
            }),
          );
          setPosts(transformedPosts);
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
        // Fallback to empty arrays if database is not available
        setPosts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div
      className="min-h-screen bg-background"
      style={
        {
          "--company-primary": companySettings.primaryColor,
          "--company-secondary": companySettings.secondaryColor,
          "--company-accent": companySettings.accentColor,
        } as React.CSSProperties
      }
    >
      {/* Hero Section with Featured Post */}
      <section className="relative py-20 bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--company-primary)]/5 to-[var(--company-secondary)]/5"></div>
        <div className="relative z-10 mx-auto max-w-7xl px-4">
          {/* Company Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              {companySettings.companyName}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              {companySettings.companyDescription}
            </p>
          </motion.div>

          {/* Featured Post */}
          {!loading && posts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="grid lg:grid-cols-2 gap-12 items-center mb-16"
            >
              {/* Featured Post Image */}
              <div className="relative group cursor-pointer">
                <Link href={`/posts/${posts[0].slug}`}>
                  {posts[0].mainImage && (
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                      <img
                        src={posts[0].mainImage}
                        alt={posts[0].title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors rounded-xl" />
                    </div>
                  )}
                </Link>
              </div>

              {/* Featured Post Content */}
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(posts[0].publishedAt!)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{formatReadingTime(posts[0].readingTime)}</span>
                  </div>
                </div>

                <Link href={`/posts/${posts[0].slug}`}>
                  <h2 className="text-3xl font-bold tracking-tight text-foreground hover:text-[var(--company-primary)] transition-colors sm:text-4xl">
                    {posts[0].title}
                  </h2>
                </Link>

                <p className="text-lg text-muted-foreground leading-relaxed">
                  {posts[0].excerpt}
                </p>

                <div className="flex items-center gap-3">
                  {posts[0].categories.slice(0, 2).map((category, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded-full bg-[var(--company-primary)]/10 px-3 py-1 text-sm font-medium text-[var(--company-primary)] dark:bg-[var(--company-primary)]/20"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {category}
                    </span>
                  ))}
                </div>

                <Button
                  asChild
                  size="lg"
                  className="bg-[var(--company-accent)] hover:bg-[var(--company-accent)]/90"
                >
                  <Link href={`/posts/${posts[0].slug}`}>
                    Read Full Article
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center"
          >
            <div className="inline-flex flex-col items-center gap-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search all articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-80 rounded-lg border border-[var(--company-secondary)]/20 bg-background pl-10 pr-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--company-primary)] focus-visible:ring-offset-2"
                />
              </div>
              <Button
                asChild
                size="lg"
                className="bg-[var(--company-accent)] hover:bg-[var(--company-accent)]/90"
              >
                <Link href="/posts">
                  View All Articles
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Latest Articles Section */}
      <section className="py-20 bg-[var(--company-secondary)]/5">
        <div className="mx-auto max-w-7xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold text-foreground">
              Latest Articles
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Fresh content from our team of writers and developers
            </p>
          </motion.div>

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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.slice(1).map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="group h-full cursor-pointer transition-all hover:shadow-lg border-[var(--company-secondary)]/10">
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
                        <CardTitle className="line-clamp-2 text-lg group-hover:text-[var(--company-accent)] transition-colors">
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
                            {post.categories.slice(0, 2).map((category, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center rounded-full bg-[var(--company-accent)]/10 px-2 py-1 text-xs font-medium text-[var(--company-accent)] dark:bg-[var(--company-accent)]/20"
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
          )}

          {!loading && filteredPosts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No articles found
              </h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Check back soon for new content"}
              </p>
            </motion.div>
          )}

          {!loading && posts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-16 text-center"
            >
              <Button
                asChild
                size="lg"
                className="gap-2 bg-[var(--company-primary)] hover:bg-[var(--company-primary)]/90"
              >
                <Link href="/posts">
                  View All Articles
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-[var(--company-secondary)]/5">
        <div className="mx-auto max-w-7xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold text-foreground">
              Explore Categories
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Browse articles by topic and find what interests you most
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="group h-full cursor-pointer transition-all hover:shadow-lg border-[var(--company-secondary)]/10">
                  <Link href={`/categories/${category.slug}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="group-hover:text-[var(--company-accent)] transition-colors">
                          {category.name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {category.postCount} articles
                        </span>
                      </CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 gap-8 md:grid-cols-4"
          >
            {[
              { label: "Total Articles", value: posts.length, icon: BookOpen },
              { label: "Categories", value: categories.length, icon: Tag },
              {
                label: "Total Views",
                value: posts.reduce((sum, post) => sum + post.viewCount, 0),
                icon: Eye,
              },
              {
                label: "Active Readers",
                value: posts.reduce(
                  (sum, post) => sum + post.uniqueViewCount,
                  0,
                ),
                icon: Users,
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--company-accent)]/10 mx-auto mb-4">
                  <stat.icon className="h-6 w-6 text-[var(--company-accent)]" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Company Info Section */}
      <section className="py-20 bg-[var(--company-secondary)]/5">
        <div className="mx-auto max-w-7xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">
              About {companySettings.companyName}
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
              {companySettings.companyDescription}
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {companySettings.companyEmail && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--company-accent)]/10 mx-auto mb-4">
                  <Mail className="h-6 w-6 text-[var(--company-accent)]" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Email</h3>
                <p className="text-muted-foreground">
                  {companySettings.companyEmail}
                </p>
              </motion.div>
            )}

            {companySettings.companyPhone && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--company-accent)]/10 mx-auto mb-4">
                  <Phone className="h-6 w-6 text-[var(--company-accent)]" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Phone</h3>
                <p className="text-muted-foreground">
                  {companySettings.companyPhone}
                </p>
              </motion.div>
            )}

            {companySettings.companyAddress && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--company-accent)]/10 mx-auto mb-4">
                  <MapPin className="h-6 w-6 text-[var(--company-accent)]" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Location</h3>
                <p className="text-muted-foreground">
                  {companySettings.companyAddress}
                </p>
              </motion.div>
            )}
          </div>

          {/* Social Media Links */}
          {(companySettings.twitterUrl ||
            companySettings.linkedinUrl ||
            companySettings.githubUrl ||
            companySettings.instagramUrl) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center mt-12"
            >
              <h3 className="font-semibold text-foreground mb-6">Follow Us</h3>
              <div className="flex justify-center gap-4">
                {companySettings.twitterUrl && (
                  <a
                    href={companySettings.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-[var(--company-accent)]/10 text-[var(--company-accent)] hover:bg-[var(--company-accent)]/20 transition-colors"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
                {companySettings.linkedinUrl && (
                  <a
                    href={companySettings.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-[var(--company-accent)]/10 text-[var(--company-accent)] hover:bg-[var(--company-accent)]/20 transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {companySettings.githubUrl && (
                  <a
                    href={companySettings.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-[var(--company-accent)]/10 text-[var(--company-accent)] hover:bg-[var(--company-accent)]/20 transition-colors"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                )}
                {companySettings.instagramUrl && (
                  <a
                    href={companySettings.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-[var(--company-accent)]/10 text-[var(--company-accent)] hover:bg-[var(--company-accent)]/20 transition-colors"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
