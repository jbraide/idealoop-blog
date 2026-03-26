"use client";

import { useEffect, useState } from "react";
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
    Search,
    Plus,
    Trash2,
    RefreshCw,
    Globe,
    BookOpen,
    Lightbulb,
    TrendingUp,
    Loader2,
    ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import {
    getCompetitors,
    addCompetitor,
    removeCompetitor,
    getLatestResearch,
    triggerResearch,
} from "@/lib/research-actions";

interface Competitor {
    id: string;
    name: string;
    domain: string;
    blogPath: string;
    active: boolean;
    createdAt: Date;
    research: { scrapedAt: Date }[];
}

interface ResearchData {
    blogTopics: {
        data: any;
        summary: string;
        scrapedAt: Date;
    } | null;
    contentGaps: {
        data: any;
        summary: string;
        scrapedAt: Date;
    } | null;
}

export default function ResearchPage() {
    const [competitors, setCompetitors] = useState<Competitor[]>([]);
    const [selectedCompetitor, setSelectedCompetitor] = useState<string | null>(null);
    const [research, setResearch] = useState<ResearchData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isResearching, setIsResearching] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [loadingResearch, setLoadingResearch] = useState(false);

    // Form state
    const [newName, setNewName] = useState("");
    const [newDomain, setNewDomain] = useState("");
    const [newBlogPath, setNewBlogPath] = useState("/blog");

    useEffect(() => {
        loadCompetitors();
    }, []);

    async function loadCompetitors() {
        setIsLoading(true);
        try {
            const data = await getCompetitors();
            setCompetitors(data as any);
        } catch (error) {
            toast.error("Failed to load competitors");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleAddCompetitor(e: React.FormEvent) {
        e.preventDefault();
        if (!newName || !newDomain) return;

        try {
            await addCompetitor(newName, newDomain, newBlogPath);
            toast.success(`Added ${newName}`);
            setNewName("");
            setNewDomain("");
            setNewBlogPath("/blog");
            setIsAdding(false);
            loadCompetitors();
        } catch (error: any) {
            toast.error(error.message || "Failed to add competitor");
        }
    }

    async function handleRemove(id: string, name: string) {
        if (!confirm(`Remove ${name}? All research data will be deleted.`)) return;

        try {
            await removeCompetitor(id);
            toast.success(`Removed ${name}`);
            if (selectedCompetitor === id) {
                setSelectedCompetitor(null);
                setResearch(null);
            }
            loadCompetitors();
        } catch (error) {
            toast.error("Failed to remove competitor");
        }
    }

    async function handleViewResearch(competitorId: string) {
        setSelectedCompetitor(competitorId);
        setLoadingResearch(true);
        try {
            const data = await getLatestResearch(competitorId);
            setResearch(data as any);
        } catch (error) {
            toast.error("Failed to load research");
        } finally {
            setLoadingResearch(false);
        }
    }

    async function handleTriggerResearch() {
        setIsResearching(true);
        toast.info("Starting competitor research... This may take a few minutes.");
        try {
            const result = await triggerResearch();
            toast.success(`Research complete! ${result.successCount}/${result.processedCount} succeeded.`);
            loadCompetitors();
            if (selectedCompetitor) {
                handleViewResearch(selectedCompetitor);
            }
        } catch (error) {
            toast.error("Research failed. Check server logs.");
        } finally {
            setIsResearching(false);
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Competitor Research</h1>
                    <p className="text-muted-foreground mt-1">
                        AI-powered analysis of competitor blogs and content strategy
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setIsAdding(!isAdding)}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Competitor
                    </Button>
                    <Button
                        onClick={handleTriggerResearch}
                        disabled={isResearching || competitors.length === 0}
                    >
                        {isResearching ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        {isResearching ? "Researching..." : "Run Research"}
                    </Button>
                </div>
            </div>

            {/* Add Competitor Form */}
            {isAdding && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Add New Competitor</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddCompetitor} className="flex gap-3 items-end">
                                <div className="flex-1">
                                    <label className="text-sm font-medium mb-1 block">Name</label>
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        placeholder="e.g. Canny"
                                        className="w-full px-3 py-2 border rounded-md bg-background"
                                        required
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-sm font-medium mb-1 block">Domain</label>
                                    <input
                                        type="text"
                                        value={newDomain}
                                        onChange={(e) => setNewDomain(e.target.value)}
                                        placeholder="e.g. canny.io"
                                        className="w-full px-3 py-2 border rounded-md bg-background"
                                        required
                                    />
                                </div>
                                <div className="w-32">
                                    <label className="text-sm font-medium mb-1 block">Blog Path</label>
                                    <input
                                        type="text"
                                        value={newBlogPath}
                                        onChange={(e) => setNewBlogPath(e.target.value)}
                                        placeholder="/blog"
                                        className="w-full px-3 py-2 border rounded-md bg-background"
                                    />
                                </div>
                                <Button type="submit">Add</Button>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Competitor Cards */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : competitors.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Search className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium">No competitors added yet</p>
                        <p className="text-muted-foreground">Click &quot;Add Competitor&quot; to start tracking</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {competitors.map((competitor) => (
                        <motion.div
                            key={competitor.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card
                                className={`cursor-pointer transition-all hover:shadow-md ${selectedCompetitor === competitor.id ? "ring-2 ring-primary" : ""
                                    }`}
                                onClick={() => handleViewResearch(competitor.id)}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Globe className="h-4 w-4" />
                                                {competitor.name}
                                            </CardTitle>
                                            <CardDescription className="flex items-center gap-1 mt-1">
                                                <a
                                                    href={`https://${competitor.domain}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:underline flex items-center gap-1"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {competitor.domain}
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            </CardDescription>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemove(competitor.id, competitor.name);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <BookOpen className="h-3.5 w-3.5" />
                                        <span>Blog: {competitor.blogPath}</span>
                                    </div>
                                    {competitor.research.length > 0 && (
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Last scanned: {new Date(competitor.research[0].scrapedAt).toLocaleDateString()}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Research Results */}
            {selectedCompetitor && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <h2 className="text-xl font-semibold border-b pb-2">Research Results</h2>

                    {loadingResearch ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : !research?.blogTopics && !research?.contentGaps ? (
                        <Card>
                            <CardContent className="py-8 text-center">
                                <p className="text-muted-foreground">No research data yet. Click &quot;Run Research&quot; to get started.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Blog Topics */}
                            {research?.blogTopics && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <BookOpen className="h-5 w-5 text-blue-500" />
                                            Blog Topics Found
                                        </CardTitle>
                                        <CardDescription>
                                            Scanned {new Date(research.blogTopics.scrapedAt).toLocaleDateString()}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm mb-4">{research.blogTopics.summary}</p>
                                        {research.blogTopics.data?.posts && (
                                            <ul className="space-y-2 max-h-64 overflow-y-auto">
                                                {(research.blogTopics.data.posts as any[]).slice(0, 15).map((post: any, i: number) => (
                                                    <li key={i} className="text-sm flex items-start gap-2">
                                                        <span className="text-muted-foreground font-mono text-xs mt-0.5">{i + 1}.</span>
                                                        <a
                                                            href={post.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="hover:underline text-primary"
                                                        >
                                                            {post.title}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Content Gaps & Opportunities */}
                            {research?.contentGaps && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Lightbulb className="h-5 w-5 text-yellow-500" />
                                            AI Insights
                                        </CardTitle>
                                        <CardDescription>
                                            Content gaps and SEO opportunities
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {research.contentGaps.data?.keyThemes && (
                                            <div>
                                                <h4 className="text-sm font-semibold flex items-center gap-1 mb-1">
                                                    <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                                                    Key Themes
                                                </h4>
                                                <div className="flex flex-wrap gap-1">
                                                    {(research.contentGaps.data.keyThemes as string[]).map((theme: string, i: number) => (
                                                        <span key={i} className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-0.5 rounded-full">
                                                            {theme}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {research.contentGaps.data?.contentGaps && (
                                            <div>
                                                <h4 className="text-sm font-semibold flex items-center gap-1 mb-1">
                                                    <Lightbulb className="h-3.5 w-3.5 text-yellow-500" />
                                                    Content Gaps
                                                </h4>
                                                <ul className="space-y-1">
                                                    {(research.contentGaps.data.contentGaps as string[]).map((gap: string, i: number) => (
                                                        <li key={i} className="text-sm text-muted-foreground">• {gap}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {research.contentGaps.data?.recommendedTopics && (
                                            <div>
                                                <h4 className="text-sm font-semibold flex items-center gap-1 mb-1">
                                                    <Search className="h-3.5 w-3.5 text-blue-500" />
                                                    Recommended Topics
                                                </h4>
                                                <ul className="space-y-1">
                                                    {(research.contentGaps.data.recommendedTopics as string[]).map((topic: string, i: number) => (
                                                        <li key={i} className="text-sm text-muted-foreground">• {topic}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}
