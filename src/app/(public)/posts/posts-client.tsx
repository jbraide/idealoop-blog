"use client";

import { useState, useEffect, useTransition } from "react";
import { motion } from "framer-motion";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Eye,
    Search,
    ArrowLeft,
    ArrowRight,
    BookOpen,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { BlogPost, Category } from "@/types";
import { cn, formatDate, formatReadingTime } from "@/lib/utils";

interface PostsClientProps {
    posts: BlogPost[];
    categories: Category[];
    companySettings: any;
    totalPages: number;
    initialSearchQuery: string;
    initialCategory: string;
    initialPage: number;
}

export function PostsClient({
    posts,
    categories,
    companySettings,
    totalPages,
    initialSearchQuery,
    initialCategory,
    initialPage,
}: PostsClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
    // We use local state for search input to prevent lagging while typing,
    // but we trigger navigation after a delay.

    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchQuery !== initialSearchQuery) {
                updateFilters("q", searchQuery);
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery, initialSearchQuery]);

    const updateFilters = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }

        // Always reset to page 1 when changing filters other than page
        if (key !== "page") {
            params.delete("page");
        }

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    };

    const handleCategoryChange = (categorySlug: string) => {
        const newCategory = initialCategory === categorySlug ? "" : categorySlug;
        updateFilters("category", newCategory);
    };

    const clearFilters = () => {
        setSearchQuery("");
        startTransition(() => {
            router.push(pathname);
        });
    };

    return (
        <div
            className={cn("min-h-screen bg-background transition-opacity", isPending && "opacity-60")}
            style={{
                "--company-primary": companySettings?.primaryColor || "#4F46E5",
                "--company-secondary": companySettings?.secondaryColor || "#0F172A",
                "--company-accent": companySettings?.accentColor || "#10B981",
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
                                        initialCategory === ""
                                            ? "bg-[var(--company-primary)] text-white shadow-md shadow-[var(--company-primary)]/20"
                                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <span>All Articles</span>
                                </button>
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => handleCategoryChange(category.slug)}
                                        className={cn(
                                            "w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-between group",
                                            initialCategory === category.slug
                                                ? "bg-[var(--company-primary)] text-white shadow-md shadow-[var(--company-primary)]/20"
                                                : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <span className="truncate">{category.name}</span>
                                        <span className={cn("text-xs px-2 py-0.5 rounded-full", initialCategory === category.slug ? "bg-white/20" : "bg-muted text-muted-foreground")}>
                                            {category.postCount || 0}
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
                                                            {post.categories?.[0] || "General"}
                                                        </span>
                                                    </div>
                                                </Link>
                                                <CardHeader className="flex-1 space-y-4 pt-8 px-8 text-left">
                                                    <div className="flex items-center gap-3 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                                                        <span>{post.publishedAt ? formatDate(new Date(post.publishedAt)) : "Draft"}</span>
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
                                            onClick={() => updateFilters("page", String(Math.max(initialPage - 1, 1)))}
                                            disabled={initialPage === 1}
                                            className="rounded-xl"
                                        >
                                            <ArrowLeft className="mr-2 h-4 w-4" /> Prev
                                        </Button>
                                        <div className="flex items-center gap-2">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                <Button
                                                    key={page}
                                                    variant={initialPage === page ? "default" : "ghost"}
                                                    onClick={() => updateFilters("page", String(page))}
                                                    className={cn(
                                                        "w-10 h-10 rounded-xl font-bold",
                                                        initialPage === page ? "bg-[var(--company-primary)] shadow-lg shadow-[var(--company-primary)]/25" : ""
                                                    )}
                                                >
                                                    {page}
                                                </Button>
                                            ))}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            onClick={() => updateFilters("page", String(Math.min(initialPage + 1, totalPages)))}
                                            disabled={initialPage === totalPages}
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
                    </main>
                </div>
            </div>
        </div>
    );
}
