import { SitemapEntry } from './types'
import { SITEMAP_CONFIG } from './config'
import { filterValidEntries, logSitemapError, formatSitemapDate, sanitizeSlug } from './utils'
import { supabaseServiceRole as supabase } from '@/lib/supabase-server'

/**
 * 블로그 포스트들의 sitemap URL을 생성합니다
 */
export async function generateBlogUrls(): Promise<SitemapEntry[]> {
  try {
    console.log('📝 Fetching blog posts for sitemap...')
    
    const { data: posts, error } = await supabase
      .from('posts')
      .select('slug, updated_at, published_at, created_at')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(1000) // 성능을 위한 제한

    if (error) {
      console.error('❌ Error fetching blog posts:', error)
      logSitemapError('generateBlogUrls', error)
      return []
    }

    if (!posts || posts.length === 0) {
      console.log('📝 No published blog posts found')
      return []
    }

    const blogEntries: SitemapEntry[] = posts.map(post => ({
      url: `${SITEMAP_CONFIG.baseUrl}/blog/${sanitizeSlug((post as any).slug)}`,
      lastModified: formatSitemapDate((post as any).updated_at || (post as any).created_at),
      changeFrequency: SITEMAP_CONFIG.dynamicContent.posts.changeFrequency,
      priority: SITEMAP_CONFIG.dynamicContent.posts.priority
    }))

    console.log(`📝 Generated ${blogEntries.length} blog URLs`)
    return filterValidEntries(blogEntries)
  } catch (error) {
    console.error('❌ Unexpected error in generateBlogUrls:', error)
    logSitemapError('generateBlogUrls', error)
    return []
  }
}

/**
 * 프로젝트들의 sitemap URL을 생성합니다
 */
export async function generateProjectUrls(): Promise<SitemapEntry[]> {
  try {
    console.log('🚀 Fetching projects for sitemap...')
    
    const { data: projects, error } = await supabase
      .from('projects')
      .select('slug, updated_at, created_at')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(500) // 성능을 위한 제한

    if (error) {
      console.error('❌ Error fetching projects:', error)
      logSitemapError('generateProjectUrls', error)
      return []
    }

    if (!projects || projects.length === 0) {
      console.log('🚀 No published projects found')
      return []
    }

    const projectEntries: SitemapEntry[] = projects.map(project => ({
      url: `${SITEMAP_CONFIG.baseUrl}/projects/${sanitizeSlug((project as any).slug)}`,
      lastModified: formatSitemapDate((project as any).updated_at || (project as any).created_at),
      changeFrequency: SITEMAP_CONFIG.dynamicContent.projects.changeFrequency,
      priority: SITEMAP_CONFIG.dynamicContent.projects.priority
    }))

    console.log(`🚀 Generated ${projectEntries.length} project URLs`)
    return filterValidEntries(projectEntries)
  } catch (error) {
    console.error('❌ Unexpected error in generateProjectUrls:', error)
    logSitemapError('generateProjectUrls', error)
    return []
  }
}