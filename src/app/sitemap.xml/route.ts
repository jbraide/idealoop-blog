import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://blog.idealoop.xyz';

    // Get all published posts
    const posts = await prisma.post.findMany({
        where: { status: 'PUBLISHED' },
        select: { slug: true, updatedAt: true }
    });

    const postEntries = posts.map((post) => `
<url>
<loc>${baseUrl}/posts/${post.slug}</loc>
<lastmod>${post.updatedAt.toISOString().split('T')[0]}</lastmod>
<changefreq>weekly</changefreq>
<priority>0.7</priority>
</url>`).join('');

    // Get all categories
    const categories = await prisma.category.findMany({
        select: { slug: true, updatedAt: true }
    });

    const categoryEntries = categories.map((cat) => `
<url>
<loc>${baseUrl}/categories/${cat.slug}</loc>
<lastmod>${cat.updatedAt.toISOString().split('T')[0]}</lastmod>
<changefreq>monthly</changefreq>
<priority>0.5</priority>
</url>`).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
<url>
<loc>${baseUrl}</loc>
<lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
<changefreq>daily</changefreq>
<priority>1.0</priority>
</url>
<url>
<loc>${baseUrl}/about</loc>
<lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
<changefreq>monthly</changefreq>
<priority>0.8</priority>
</url>
<url>
<loc>${baseUrl}/contact</loc>
<lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
<changefreq>monthly</changefreq>
<priority>0.8</priority>
</url>${postEntries}${categoryEntries}
</urlset>`;

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'text/xml',
        },
    });
}
