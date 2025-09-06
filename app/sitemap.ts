import { MetadataRoute } from 'next'
import { generateStaticUrls } from '@/lib/sitemap/static'
import { generateBlogUrls, generateProjectUrls } from '@/lib/sitemap/dynamic'
import { logSitemapError } from '@/lib/sitemap/utils'

// 캐시 설정 - 5분마다 재생성
export const revalidate = 300

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    console.log('🗺️ Generating dynamic sitemap...')
    
    // 병렬로 모든 URL 생성 함수 실행
    const [staticUrls, blogUrls, projectUrls] = await Promise.all([
      generateStaticUrls(),
      generateBlogUrls(),
      generateProjectUrls()
    ])

    // 모든 URL을 병합하여 반환
    const allUrls = [...staticUrls, ...blogUrls, ...projectUrls]
    
    console.log(`✅ Generated sitemap with ${allUrls.length} URLs (${blogUrls.length} blog posts, ${projectUrls.length} projects)`)
    
    return allUrls
  } catch (error) {
    logSitemapError('sitemap generation', error)
    
    // 에러 발생 시 최소한 정적 페이지라도 반환
    try {
      const fallbackUrls = await generateStaticUrls()
      console.warn(`⚠️ Fallback to static URLs only: ${fallbackUrls.length} URLs`)
      return fallbackUrls
    } catch (fallbackError) {
      logSitemapError('sitemap fallback', fallbackError)
      // 최후의 수단으로 홈페이지만 반환
      return [{
        url: process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1.0
      }]
    }
  }
}