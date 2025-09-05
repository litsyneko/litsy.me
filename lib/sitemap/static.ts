import { SitemapEntry } from './types'
import { SITEMAP_CONFIG } from './config'
import { filterValidEntries } from './utils'

/**
 * 정적 페이지들의 sitemap URL을 생성합니다
 */
export function generateStaticUrls(): SitemapEntry[] {
  const staticEntries: SitemapEntry[] = SITEMAP_CONFIG.staticPages.map(page => ({
    url: `${SITEMAP_CONFIG.baseUrl}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority
  }))

  return filterValidEntries(staticEntries)
}