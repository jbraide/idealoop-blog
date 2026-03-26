import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scrapeBlog } from "@/lib/ai/scraper";
import { analyzeCompetitorBlog } from "@/lib/ai/deepseek";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    // 1. Verify authentication
    const authHeader = request.headers.get("authorization");
    const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
    const isDev = process.env.NODE_ENV === "development";
    const manualSecret = request.nextUrl.searchParams.get("secret");
    const isManual = manualSecret === process.env.CRON_SECRET;

    if (!isCron && !isManual && !isDev) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        // 2. Get all active competitors
        const competitors = await prisma.competitor.findMany({
            where: { active: true },
        });

        if (competitors.length === 0) {
            return NextResponse.json({ message: "No active competitors configured" });
        }

        console.log(`Starting research for ${competitors.length} competitors...`);

        // 3. Process each competitor concurrently
        const researchPromises = competitors.map(async (competitor) => {
            try {
                console.log(`Scraping ${competitor.name} (${competitor.domain})...`);

                // Scrape the blog
                const blogData = await scrapeBlog(competitor.domain, competitor.blogPath);
                console.log(`Found ${blogData.posts.length} blog posts from ${competitor.name}`);

                if (blogData.posts.length === 0) {
                    return {
                        success: false,
                        competitor: competitor.name,
                        error: "No blog posts found",
                    };
                }

                // Analyze with AI
                console.log(`Analyzing ${competitor.name} with DeepSeek...`);
                const analysis = await analyzeCompetitorBlog(
                    competitor.name,
                    blogData.posts,
                    blogData.meta
                );

                // Store blog topics
                await prisma.competitorResearch.create({
                    data: {
                        competitorId: competitor.id,
                        category: "blog_topics",
                        data: blogData as any,
                        summary: analysis.summary,
                        source: blogData.scrapedUrl,
                    },
                });

                // Store content analysis
                await prisma.competitorResearch.create({
                    data: {
                        competitorId: competitor.id,
                        category: "content_gaps",
                        data: {
                            keyThemes: analysis.keyThemes,
                            contentGaps: analysis.contentGaps,
                            seoOpportunities: analysis.seoOpportunities,
                            recommendedTopics: analysis.recommendedTopics,
                        },
                        summary: `Key themes: ${analysis.keyThemes.join(", ")}. Content gaps: ${analysis.contentGaps.join(", ")}. Recommended topics: ${analysis.recommendedTopics.join(", ")}.`,
                        source: blogData.scrapedUrl,
                    },
                });

                return {
                    success: true,
                    competitor: competitor.name,
                    postsFound: blogData.posts.length,
                    themes: analysis.keyThemes.length,
                    gaps: analysis.contentGaps.length,
                    recommendations: analysis.recommendedTopics.length,
                };
            } catch (error: any) {
                console.error(`Failed research for ${competitor.name}:`, error);
                return {
                    success: false,
                    competitor: competitor.name,
                    error: error.message,
                };
            }
        });

        const results = await Promise.allSettled(researchPromises);
        const outcomes = results.map((r) =>
            r.status === "fulfilled" ? r.value : { success: false, error: "Promise rejected" }
        );

        return NextResponse.json({
            message: "Research completed",
            processedCount: outcomes.length,
            successCount: outcomes.filter((o) => o.success).length,
            results: outcomes,
        });
    } catch (error: any) {
        console.error("Research cron error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
