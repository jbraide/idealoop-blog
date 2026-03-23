export interface GeneratedPost {
    title: string;
    content: string;
    excerpt: string;
    slug: string;
    metaTitle: string;
    metaDescription: string;
    keywords: string;
}

export async function generatePost(title: string): Promise<GeneratedPost> {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
        throw new Error("DEEPSEEK_API_KEY is not defined");
    }

    const prompt = `
    Write a high-quality, SEO-optimized blog post for a SaaS platform called "Idealoop" which is a customer-driven product management tool (similar to Canny, Upvoty).
    
    Topic: ${title}
    
    Requirements:
    1. Content: Write comprehensive, engaging content (minimum 1000 words). Use HTML tags for formatting (h2, h3, p, ul, li, strong) as this will be used in a rich text editor.
    2. Linking Strategy:
       - When mentioning "Idealoop", include a link to https://idealoop.xyz or https://app.idealoop.xyz where appropriate.
       - When mentioning competitors (e.g., Canny, Upvoty, Featurebase, Productboard), include a link to their respective websites to provide value and context.
    3. Excerpt: A 2-3 sentence summary of the post.
    4. Slug: A URL-friendly slug based on the title.
    5. SEO Meta Title: A compelling title for search engines (max 60 chars).
    6. SEO Meta Description: A descriptive meta description (max 160 chars).
    7. Keywords: A comma-separated list of relevant keywords.
    
    Respond STRICTLY with a JSON object in this format:
    {
      "title": "...",
      "content": "...",
      "excerpt": "...",
      "slug": "...",
      "metaTitle": "...",
      "metaDescription": "...",
      "keywords": "..."
    }
  `;

    try {
        const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: "You are a professional SaaS copywriter and SEO expert." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" },
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`DeepSeek API error: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);
        return result as GeneratedPost;
    } catch (error) {
        console.error("Error generating post with DeepSeek:", error);
        throw error;
    }
}
