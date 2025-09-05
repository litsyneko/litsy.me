import { SitemapEntry } from './types'

/**
 * URL이 유효한지 검증합니다
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * slug를 안전한 URL 경로로 변환합니다
 */
export function sanitizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * 유효하지 않은 sitemap 엔트리를 필터링합니다
 */
export function filterValidEntries(entries: SitemapEntry[]): SitemapEntry[] {
  return entries.filter(entry => {
    if (!entry.url || !isValidUrl(entry.url)) {
      console.warn(`Invalid URL filtered from sitemap: ${entry.url}`)
      return false
    }
    
    if (entry.priority !== undefined && (entry.priority < 0 || entry.priority > 1)) {
      console.warn(`Invalid priority filtered from sitemap: ${entry.priority} for URL: ${entry.url}`)
      return false
    }
    
    return true
  })
}

/**
 * sitemap 생성 에러를 로깅합니다
 */
export function logSitemapError(context: string, error: unknown): void {
  console.error(`Sitemap generation error in ${context}:`, error)
  
  // 프로덕션 환경에서는 추가 모니터링 서비스로 전송 가능
  if (process.env.NODE_ENV === 'production') {
    // TODO: 모니터링 서비스 연동 (예: Sentry, DataDog 등)
  }
}

/**
 * 날짜를 sitemap에 적합한 형식으로 변환합니다
 */
export function formatSitemapDate(date: string | Date): Date {
  return new Date(date)
}