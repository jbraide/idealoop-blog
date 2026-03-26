"use server";

import { prisma } from "@/lib/prisma";

export async function getCompetitors() {
    return prisma.competitor.findMany({
        include: {
            research: {
                orderBy: { scrapedAt: "desc" },
                take: 1,
            },
        },
        orderBy: { name: "asc" },
    });
}

export async function addCompetitor(name: string, domain: string, blogPath: string = "/blog") {
    // Clean domain (remove protocol and trailing slash)
    const cleanDomain = domain
        .replace(/^https?:\/\//, "")
        .replace(/\/$/, "");

    return prisma.competitor.create({
        data: {
            name,
            domain: cleanDomain,
            blogPath,
        },
    });
}

export async function removeCompetitor(id: string) {
    return prisma.competitor.delete({
        where: { id },
    });
}

export async function getResearchResults(competitorId?: string) {
    return prisma.competitorResearch.findMany({
        where: competitorId ? { competitorId } : {},
        include: {
            competitor: {
                select: { name: true, domain: true },
            },
        },
        orderBy: { scrapedAt: "desc" },
        take: 50,
    });
}

export async function getLatestResearch(competitorId: string) {
    const blogTopics = await prisma.competitorResearch.findFirst({
        where: { competitorId, category: "blog_topics" },
        orderBy: { scrapedAt: "desc" },
    });

    const contentGaps = await prisma.competitorResearch.findFirst({
        where: { competitorId, category: "content_gaps" },
        orderBy: { scrapedAt: "desc" },
    });

    return { blogTopics, contentGaps };
}

export async function triggerResearch() {
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const secret = process.env.CRON_SECRET;

    const res = await fetch(`${baseUrl}/api/cron/research-competitors?secret=${secret}`, {
        method: "GET",
    });

    return res.json();
}
