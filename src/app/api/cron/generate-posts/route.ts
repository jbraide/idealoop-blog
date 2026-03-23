import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getNextTopics, markTopicComplete } from "@/lib/ai/checklist";
import { generatePost } from "@/lib/ai/deepseek";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    // 1. Verify CRON_SECRET or Manual Trigger
    const authHeader = request.headers.get("authorization");
    const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
    const isDev = process.env.NODE_ENV === "development";
    const manualSecret = request.nextUrl.searchParams.get("secret");
    const isManual = manualSecret === process.env.CRON_SECRET;

    if (!isCron && !isManual && !isDev) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        // 2. Get next topic (manual override or next uncompleted)
        const topicNumber = request.nextUrl.searchParams.get("topicNumber");
        console.log(`LOG: Requested topicNumber: ${topicNumber}`);
        let topics;

        if (topicNumber) {
            const allTopics = await getNextTopics(200);
            console.log(`LOG: Total topics checked: ${allTopics.length}`);
            const topic = allTopics.find(t => t.number === parseInt(topicNumber));
            console.log(`LOG: Found specific topic: ${topic ? JSON.stringify(topic) : "NONE"}`);
            topics = topic ? [topic] : [];
        } else {
            topics = await getNextTopics(1);
            console.log(`LOG: Auto-picked next topic: ${JSON.stringify(topics[0])}`);
        }

        if (topics.length === 0) {
            return NextResponse.json({
                message: "No suitable topic found",
                debug: {
                    requestedNumber: topicNumber,
                    availableTopics: (await getNextTopics(200)).map(t => t.number)
                }
            });
        }

        // 3. Find first Admin user for author assignment
        const admin = await prisma.user.findFirst({
            where: { role: "ADMIN" },
        });

        if (!admin) {
            return NextResponse.json({ error: "No Admin user found to assign as author" }, { status: 500 });
        }

        const results = [];

        // 4. Generate and save posts
        for (const topic of topics) {
            try {
                console.log(`Generating post for: ${topic.title}`);
                const postData = await generatePost(topic.title);

                const createdPost = await prisma.post.create({
                    data: {
                        title: postData.title,
                        slug: postData.slug,
                        content: postData.content,
                        excerpt: postData.excerpt,
                        metaTitle: postData.metaTitle,
                        metaDescription: postData.metaDescription,
                        keywords: postData.keywords,
                        status: "DRAFT",
                        authorId: admin.id,
                    },
                });

                // 5. Mark topic as complete in checklist
                markTopicComplete(topic.number);

                results.push({
                    topicNumber: topic.number,
                    title: topic.title,
                    postId: createdPost.id,
                    status: "success",
                });
            } catch (error: any) {
                console.error(`Failed to generate post for topic ${topic.number}:`, error);
                results.push({
                    topicNumber: topic.number,
                    title: topic.title,
                    status: "failed",
                    error: error.message,
                });
            }
        }

        return NextResponse.json({
            message: "Processing completed",
            processedCount: results.length,
            results,
        });
    } catch (error: any) {
        console.error("Cron job error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
