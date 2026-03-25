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
      <section className="relative py-24 overflow-hidden">
        {/* Modern Background Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--company-primary),transparent_50%),radial-gradient(circle_at_bottom_left,var(--company-accent),transparent_50%)] opacity-[0.03]"></div>
        <div className="absolute inset-0 bg-grid-slate-900/[0.02] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.02]"></div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center">
          {/* Featured Post */}
          {!loading && posts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative group mx-auto max-w-5xl"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-[var(--company-primary)] to-[var(--company-accent)] rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-card border border-[var(--company-secondary)]/10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="relative aspect-video md:aspect-auto overflow-hidden">
                    <Link href={`/posts/${posts[0].slug}`}>
                      {posts[0].mainImage ? (
                        <img
                          src={posts[0].mainImage}
                          alt={posts[0].title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[var(--company-primary)]/20 to-[var(--company-accent)]/20 flex items-center justify-center">
                          <BookOpen className="w-16 h-16 text-[var(--company-primary)]/40" />
                        </div>
                      )}
                    </Link>
                  </div>
                  <div className="p-8 md:p-12 flex flex-col justify-center text-left">
                    <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground mb-6">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(posts[0].publishedAt!)}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {formatReadingTime(posts[0].readingTime)}
                      </span>
                    </div>
                    <Link href={`/posts/${posts[0].slug}`}>
                      <h2 className="text-3xl font-bold mb-4 group-hover:text-[var(--company-primary)] transition-colors leading-tight">
                        {posts[0].title}
                      </h2>
                    </Link>
                    <p className="text-muted-foreground text-lg mb-8 line-clamp-3">
                      {posts[0].excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex gap-2">
                        {posts[0].categories.slice(0, 1).map((category, i) => (
                          <span key={i} className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--company-primary)]/10 text-[var(--company-primary)]">
                            {category}
                          </span>
                        ))}
                      </div>
                      <Link href={`/posts/${posts[0].slug}`} className="inline-flex items-center font-semibold text-[var(--company-primary)] hover:underline">
                        Read Story <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Latest Articles Section */}
      <section className="py-24 relative bg-muted/30">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-end justify-between mb-12">
            <div className="max-w-xl text-left">
              <h2 className="text-4xl font-bold mb-4">Latest Insights</h2>
              <p className="text-lg text-muted-foreground">
                Deep dives into product strategy, feedback loops, and customer-centric design.
              </p>
            </div>
            <Button asChild variant="ghost" className="hidden sm:flex group">
              <Link href="/posts">
                View All Articles <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-[400px] rounded-2xl bg-muted animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.slice(1).map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="group flex flex-col h-full border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden bg-card">
                    <Link href={`/posts/${post.slug}`} className="relative h-56 overflow-hidden">
                      {post.mainImage ? (
                        <img
                          src={post.mainImage}
                          alt={post.title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-[var(--company-primary)]/5 flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-[var(--company-primary)]/20" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 dark:bg-black/90 text-foreground shadow-sm">
                          {post.categories[0] || "General"}
                        </span>
                      </div>
                    </Link>
                    <CardHeader className="flex-1 space-y-4 pt-6">
                      <div className="flex items-center gap-3 text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-left">
                        <span>{formatDate(post.publishedAt!)}</span>
                        <span className="text-[var(--company-primary)]">•</span>
                        <span>{formatReadingTime(post.readingTime)}</span>
                      </div>
                      <Link href={`/posts/${post.slug}`}>
                        <CardTitle className="text-xl leading-tight group-hover:text-[var(--company-primary)] transition-colors line-clamp-2 text-left">
                          {post.title}
                        </CardTitle>
                      </Link>
                      <CardDescription className="line-clamp-2 text-sm leading-relaxed text-left">
                        {post.excerpt}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 pb-6 text-left">
                      <Link href={`/posts/${post.slug}`} className="inline-flex items-center text-sm font-bold text-[var(--company-primary)] group/link">
                        Read More <ArrowRight className="ml-2 w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories & Stats section combined for modern feel */}
      <section className="py-24 border-t border-muted">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-bold mb-8 text-left">Trending Categories</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {categories.map((category) => (
                  <Link key={category.id} href={`/categories/${category.slug}`}>
                    <div className="group p-6 rounded-xl border border-muted hover:border-[var(--company-primary)]/30 hover:bg-[var(--company-primary)]/5 transition-all flex items-center justify-between text-left">
                      <div>
                        <h3 className="font-bold text-lg group-hover:text-[var(--company-primary)] transition-colors">{category.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">{category.description}</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted group-hover:bg-[var(--company-primary)] group-hover:text-white transition-all">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-8 text-left">
              <h2 className="text-3xl font-bold mb-8">Community Impact</h2>
              <div className="space-y-6">
                {[
                  { label: "Articles Published", value: posts.length, icon: BookOpen },
                  { label: "Community Members", value: "2.4k+", icon: Users },
                  { label: "Monthly Readers", value: "15k+", icon: Eye },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-6 p-6 rounded-xl bg-card border border-muted">
                    <div className="h-12 w-12 rounded-lg bg-[var(--company-accent)]/10 flex items-center justify-center">
                      <stat.icon className="h-6 w-6 text-[var(--company-accent)]" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Idealoop CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-4">
          <div className="relative rounded-3xl overflow-hidden bg-[var(--company-secondary)] p-12 text-center text-white">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--company-primary)] opacity-10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--company-accent)] opacity-10 rounded-full -ml-32 -mb-32"></div>
            <h2 className="text-4xl font-bold mb-6 relative z-10">Build Better Products with Idealoop</h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto relative z-10">
              Idealoop helps you capture, manage, and act on user feedback to drive product excellence.
            </p>
            <div className="flex flex-wrap justify-center gap-4 relative z-10">
              <Button size="lg" className="bg-white text-[var(--company-secondary)] hover:bg-white/90 font-bold" asChild>
                <a href="https://idealoop.xyz" target="_blank" rel="noopener noreferrer">Get Started Free</a>
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 font-bold" asChild>
                <a href="https://app.idealoop.xyz" target="_blank" rel="noopener noreferrer">Member Login</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Links */}
      {(companySettings.twitterUrl ||
        companySettings.linkedinUrl ||
        companySettings.githubUrl ||
        companySettings.instagramUrl) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mt-12 mb-12"
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
  );
}
