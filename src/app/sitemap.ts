import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://idealoop.xyz'

    // Get all published posts
    const posts = await prisma.post.findMany({
        where: { status: 'PUBLISHED' },
        select: { slug: true, updatedAt: true }
    })

    const postEntries = posts.map((post) => ({
        url: `${baseUrl}/posts/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    // Get all categories
    const categories = await prisma.category.findMany({
        select: { slug: true, updatedAt: true }
    })

    const categoryEntries = categories.map((cat) => ({
        url: `${baseUrl}/categories/${cat.slug}`,
        lastModified: cat.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.5,
    }))

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        ...postEntries,
        ...categoryEntries,
    ]
}
