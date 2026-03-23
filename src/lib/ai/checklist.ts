import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

const CHECKLIST_PATH = path.join(process.cwd(), "idealoop_seo_200_articles_checklist.md");

export interface Topic {
    number: number;
    title: string;
}

function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
        .replace(/--+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "");
}

export async function getNextTopics(count: number = 5): Promise<Topic[]> {
    const content = fs.readFileSync(CHECKLIST_PATH, "utf8");
    const lines = content.split("\n");

    // Get all existing slugs and titles from database to skip already published topics
    const existingPosts = await prisma.post.findMany({
        select: { slug: true, title: true }
    });
    const existingSlugs = new Set(existingPosts.map(p => p.slug));
    const existingTitles = new Set(existingPosts.map(p => p.title.toLowerCase().trim()));

    const topics: Topic[] = [];

    for (const line of lines) {
        // ONLY match UNCHECKED items: - [ ]
        // We strictly ignore anything with [x], [X], or other marks
        const match = line.match(/^-\s*\[\s*\]\s*(\d+)\.\s*(.+)$/);
        if (match) {
            const num = parseInt(match[1]);
            const title = match[2].trim();
            const topicSlug = slugify(title);

            // Skip if slug or title already exists in database
            if (existingSlugs.has(topicSlug)) continue;
            if (existingTitles.has(title.toLowerCase().trim())) continue;

            topics.push({
                number: num,
                title: title,
            });
            if (topics.length >= count) break;
        }
    }

    return topics;
}

export function markTopicComplete(topicNumber: number): void {
    // This is now purely for local file sync (optional/best effort)
    try {
        const content = fs.readFileSync(CHECKLIST_PATH, "utf8");
        const lines = content.split("\n");

        const updatedLines = lines.map(line => {
            const regex = new RegExp(`^-\\s*\\[\\s*\\]\\s*${topicNumber}\\.\\s*(.+)$`);
            if (regex.test(line)) {
                return line.replace(/\[\s*\]/, "[x]");
            }
            return line;
        });

        fs.writeFileSync(CHECKLIST_PATH, updatedLines.join("\n"), "utf8");
    } catch (error) {
        console.warn("Could not update local checklist file (expected on Vercel)");
    }
}
