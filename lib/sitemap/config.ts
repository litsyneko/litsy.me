import { StaticPageConfig, DynamicContentConfig } from './types'

export const SITEMAP_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  maxUrls: 50000, // XML Sitemap 표준 제한
  staticPages: [
    { path: '/', changeFrequency: 'weekly', priority: 1.0 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/contact', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/blog', changeFrequency: 'daily', priority: 0.9 },
    { path: '/projects', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/auth/login', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/auth/signup', changeFrequency: 'yearly', priority: 0.3 }
  ] as StaticPageConfig[],
  dynamicContent: {
    posts: { baseUrl: '/blog', changeFrequency: 'daily', priority: 0.8 }, // 블로그는 더 자주 업데이트
    projects: { baseUrl: '/projects', changeFrequency: 'weekly', priority: 0.7 } // 프로젝트는 주간 업데이트
  } as Record<string, DynamicContentConfig>
} as const