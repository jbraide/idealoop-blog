import * as cheerio from "cheerio";

export interface ScrapedBlogPost {
    title: string;
    url: string;
    date?: string;
    excerpt?: string;
}

export interface ScrapedMeta {
    title: string;
    description: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    h1?: string;
}

export interface BlogScrapeResult {
    posts: ScrapedBlogPost[];
    meta: ScrapedMeta;
    scrapedUrl: string;
    scrapedAt: string;
}

/**
 * Scrape blog post listings from a competitor's blog page.
 * Targets common blog patterns: article titles inside <a>, <h2>, <h3> tags.
 */
export async function scrapeBlog(domain: string, blogPath: string = "/blog"): Promise<BlogScrapeResult> {
    const url = `https://${domain}${blogPath}`;

    const response = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (compatible; IdealoopBot/1.0; +https://idealoop.xyz)",
            "Accept": "text/html,application/xhtml+xml",
        },
        signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract blog posts using common selectors
    const posts: ScrapedBlogPost[] = [];
    const seen = new Set<string>();

    // Strategy 1: Look for <article> elements
    $("article").each((_, el) => {
        const titleEl = $(el).find("h1 a, h2 a, h3 a, h2, h3, h1").first();
        const linkEl = $(el).find("a[href]").first();
        const title = titleEl.text().trim();
        const href = linkEl.attr("href") || "";
        const dateEl = $(el).find("time, [datetime], .date, .post-date").first();
        const date = dateEl.attr("datetime") || dateEl.text().trim() || undefined;
        const excerptEl = $(el).find("p").first();
        const excerpt = excerptEl.text().trim().slice(0, 200) || undefined;

        if (title && !seen.has(title)) {
            seen.add(title);
            posts.push({
                title,
                url: href.startsWith("http") ? href : `https://${domain}${href}`,
                date,
                excerpt,
            });
        }
    });

    // Strategy 2: If no articles found, look for common blog listing patterns
    if (posts.length === 0) {
        // Target link-heavy headings that are likely blog posts
        $("a h2, a h3, h2 a, h3 a").each((_, el) => {
            const isLink = $(el).is("a");
            const anchor = isLink ? $(el) : $(el).closest("a").length ? $(el).closest("a") : $(el).find("a");
            const title = $(el).text().trim();
            const href = anchor.attr("href") || "";

            if (title && title.length > 10 && !seen.has(title)) {
                seen.add(title);
                posts.push({
                    title,
                    url: href.startsWith("http") ? href : `https://${domain}${href}`,
                });
            }
        });
    }

    // Strategy 3: Fallback — grab any <a> with long text that lives inside a list/card
    if (posts.length === 0) {
        $("ul li a, .card a, .post a, [class*='blog'] a, [class*='post'] a").each((_, el) => {
            const title = $(el).text().trim();
            const href = $(el).attr("href") || "";
            if (title && title.length > 15 && !seen.has(title) && !href.includes("#")) {
                seen.add(title);
                posts.push({
                    title,
                    url: href.startsWith("http") ? href : `https://${domain}${href}`,
                });
            }
        });
    }

    // Extract page meta
    const meta: ScrapedMeta = {
        title: $("title").text().trim(),
        description: $('meta[name="description"]').attr("content") || "",
        ogTitle: $('meta[property="og:title"]').attr("content") || undefined,
        ogDescription: $('meta[property="og:description"]').attr("content") || undefined,
        ogImage: $('meta[property="og:image"]').attr("content") || undefined,
        h1: $("h1").first().text().trim() || undefined,
    };

    return {
        posts: posts.slice(0, 30), // Cap at 30 posts
        meta,
        scrapedUrl: url,
        scrapedAt: new Date().toISOString(),
    };
}
