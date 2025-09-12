import { MetadataRoute } from 'next'
import { SITEMAP_CONFIG } from '@/lib/sitemap/config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/auth/callback', '/profile/edit', '/_next/', '/admin/'],
      },
    ],
    sitemap: `${SITEMAP_CONFIG.baseUrl}/sitemap.xml`,
  }
}
