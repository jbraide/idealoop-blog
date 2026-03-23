import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://blog.idealoop.xyz'

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/sitemap.xml'],
      disallow: '/admin/',
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
