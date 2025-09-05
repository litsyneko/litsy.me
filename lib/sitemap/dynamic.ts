import { SitemapEntry } from './types'
import { SITEMAP_CONFIG } from './config'
import { filterValidEntries, logSitemapError, formatSitemapDate, sanitizeSlug } from './utils'
import { supabase } from '@/lib/supabase'

/**
 * 블로그 포스트들의 sitemap URL을 생성합니다
 */
export async function generateBlogUrls(): Promise<SitemapEntry[]> {
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('slug, updated_at, published_at')
      .eq('published', true)
      .order('published_at', { ascending: false })

    if (error) {
      logSitemapError('generateBlogUrls', error)
      return []
    }

    if (!posts || posts.length === 0) {
      return []
    }

    const blogEntries: SitemapEntry[] = posts.map(post => ({
      url: `${SITEMAP_CONFIG.baseUrl}/blog/${sanitizeSlug(post.slug)}`,
      lastModified: formatSitemapDate(post.updated_at),
      changeFrequency: SITEMAP_CONFIG.dynamicContent.posts.changeFrequency,
      priority: SITEMAP_CONFIG.dynamicContent.posts.priority
    }))

    return filterValidEntries(blogEntries)
  } catch (error) {
    logSitemapError('generateBlogUrls', error)
    return []
  }
}

/**
 * 프로젝트들의 sitemap URL을 생성합니다
 */
export async function generateProjectUrls(): Promise<SitemapEntry[]> {
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('slug, updated_at')
      .eq('published', true)
      .order('created_at', { ascending: false })

    if (error) {
      logSitemapError('generateProjectUrls', error)
      return []
    }

    if (!projects || projects.length === 0) {
      return []
    }

    const projectEntries: SitemapEntry[] = projects.map(project => ({
      url: `${SITEMAP_CONFIG.baseUrl}/projects/${sanitizeSlug(project.slug)}`,
      lastModified: formatSitemapDate(project.updated_at),
      changeFrequency: SITEMAP_CONFIG.dynamicContent.projects.changeFrequency,
      priority: SITEMAP_CONFIG.dynamicContent.projects.priority
    }))

    return filterValidEntries(projectEntries)
  } catch (error) {
    logSitemapError('generateProjectUrls', error)
    return []
  }
}