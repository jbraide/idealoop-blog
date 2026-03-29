import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://blog.idealoop.xyz'

    const posts = await prisma.post.findMany({
        where: { status: 'PUBLISHED' },
        select: { slug: true, updatedAt: true },
    })

    const categories = await prisma.category.findMany({
        select: { slug: true, updatedAt: true },
    })

    return [
        {
            url: baseUrl,
            lastModified: new Date().toISOString().split('T')[0],
            changeFrequency: 'daily' as const,
            priority: 1.0,
        },
        ...posts.map((post) => ({
            url: `${baseUrl}/posts/${post.slug}`,
            lastModified: post.updatedAt.toISOString().split('T')[0],
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        })),

        ...categories.map((cat) => ({
            url: `${baseUrl}/categories/${cat.slug}`,
            lastModified: cat.updatedAt.toISOString().split('T')[0],
            changeFrequency: 'weekly' as const,
            priority: 0.5,
        })),
    ]
}
