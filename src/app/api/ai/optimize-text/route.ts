import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (
            !session ||
            (session.user?.role !== "ADMIN" && session.user?.role !== "EDITOR")
        ) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { text, tone } = await req.json();

        if (!text || !tone) {
            return NextResponse.json(
                { error: "Text and tone are required" },
                { status: 400 }
            );
        }

        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "API key not configured" },
                { status: 500 }
            );
        }

        const toneInstructions: Record<string, string> = {
            professional: "formal, authoritative, and polished",
            casual: "conversational, friendly, and approachable",
            persuasive: "compelling, action-oriented, and convincing",
            seo: "keyword-rich, search-friendly, and highly relevant to product management or SaaS",
            concise: "tight, shorter phrasing without losing the core meaning",
            engaging: "dynamic, reader-grabbing, and interesting",
        };

        const instruction = toneInstructions[tone?.toLowerCase()] || toneInstructions.professional;

        const prompt = `
      You are an expert copywriter for a SaaS product management tool.
      Rewrite the following text to make it ${instruction}.
      
      Maintain any HTML formatting (like <strong>, <em>, <a>) if present in the original text.
      Return ONLY the optimized text. Do not include any explanations or conversational filler.
      
      Original text:
      ${text}
    `;

        const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert SaaS copywriter.",
                    },
                    { role: "user", content: prompt },
                ],
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`DeepSeek API error: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        const optimizedText = data.choices[0].message.content.trim();

        return NextResponse.json({ optimizedText });
    } catch (error: any) {
        console.error("Error optimizing text:", error);
        return NextResponse.json(
            { error: error.message || "Failed to optimize text" },
            { status: 500 }
        );
    }
}
