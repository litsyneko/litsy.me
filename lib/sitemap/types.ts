export interface SitemapEntry {
  url: string
  lastModified?: Date
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}

export interface StaticPageConfig {
  path: string
  changeFrequency: SitemapEntry['changeFrequency']
  priority: number
}

export interface DynamicContentConfig {
  baseUrl: string
  changeFrequency: SitemapEntry['changeFrequency']
  priority: number
}