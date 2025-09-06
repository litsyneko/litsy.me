import { createSupabaseClient } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

export type BlogPost = Database['public']['Tables']['posts']['Row']
export type BlogPostInsert = Database['public']['Tables']['posts']['Insert']
export type BlogPostUpdate = Database['public']['Tables']['posts']['Update']

export interface CreatePostData {
  title: string
  summary: string
  content: string
  tags: string[]
  cover: string
  author: string
  user_id: string
}

export interface UpdatePostData extends Partial<CreatePostData> {
  id: string
}

export class BlogService {
  private supabase = createSupabaseClient()

  /**
   * 새 블로그 포스트 생성
   */
  async createPost(data: CreatePostData): Promise<BlogPost> {
    const slug = this.generateSlug(data.title)
    
    const postData: BlogPostInsert = {
      title: data.title,
      slug,
      summary: data.summary || null,
      content: data.content || null,
      tags: data.tags.length > 0 ? data.tags : null,
      cover_url: data.cover || null,
      user_id: data.user_id,
      published: true,
      published_at: new Date().toISOString()
    }

    const { data: result, error } = await this.supabase
      .from('posts')
      .insert([postData])
      .select()
      .single()

    if (error) {
      console.error('Error creating post:', error)
      throw new Error(`포스트 생성 실패: ${error.message}`)
    }

    return result
  }

  /**
   * 블로그 포스트 업데이트
   */
  async updatePost(data: UpdatePostData): Promise<BlogPost> {
    const updateData: BlogPostUpdate = {
      updated_at: new Date().toISOString()
    }

    if (data.title) {
      updateData.title = data.title
      updateData.slug = this.generateSlug(data.title)
    }
    if (data.summary !== undefined) updateData.summary = data.summary || null
    if (data.content !== undefined) updateData.content = data.content || null
    if (data.tags !== undefined) updateData.tags = data.tags.length > 0 ? data.tags : null
    if (data.cover !== undefined) updateData.cover_url = data.cover || null

    const { data: result, error } = await this.supabase
      .from('posts')
      .update(updateData)
      .eq('id', data.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating post:', error)
      throw new Error(`포스트 업데이트 실패: ${error.message}`)
    }

    return result
  }

  /**
   * 블로그 포스트 삭제
   */
  async deletePost(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('posts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting post:', error)
      throw new Error(`포스트 삭제 실패: ${error.message}`)
    }
  }

  /**
   * 블로그 포스트 목록 조회
   */
  async getPosts(options: {
    published?: boolean
    limit?: number
    offset?: number
    userId?: string
  } = {}): Promise<BlogPost[]> {
    let query = this.supabase
      .from('posts')
      .select('*')
      .order('published_at', { ascending: false })

    if (options.published !== undefined) {
      query = query.eq('published', options.published)
    }

    if (options.userId) {
      query = query.eq('user_id', options.userId)
    }

    if (options.limit) {
      query = query.limit(options.limit)
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching posts:', error)
      throw new Error(`포스트 조회 실패: ${error.message}`)
    }

    return data || []
  }

  /**
   * 특정 블로그 포스트 조회
   */
  async getPost(slug: string): Promise<BlogPost | null> {
    const { data, error } = await this.supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // 포스트를 찾을 수 없음
      }
      console.error('Error fetching post:', error)
      throw new Error(`포스트 조회 실패: ${error.message}`)
    }

    return data
  }

  /**
   * 포스트 발행/비발행 토글
   */
  async togglePublished(id: string, published: boolean): Promise<BlogPost> {
    const updateData: BlogPostUpdate = {
      published,
      published_at: published ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    }

    const { data: result, error } = await this.supabase
      .from('posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error toggling post published status:', error)
      throw new Error(`포스트 발행 상태 변경 실패: ${error.message}`)
    }

    return result
  }

  /**
   * 제목으로부터 슬러그 생성
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, '') // 특수문자 제거 (한글 포함)
      .replace(/\s+/g, '-') // 공백을 하이픈으로
      .replace(/-+/g, '-') // 연속된 하이픈을 하나로
      .replace(/^-|-$/g, '') // 시작과 끝의 하이픈 제거
  }

  /**
   * 태그별 포스트 조회
   */
  async getPostsByTag(tag: string): Promise<BlogPost[]> {
    const { data, error } = await this.supabase
      .from('posts')
      .select('*')
      .contains('tags', [tag])
      .eq('published', true)
      .order('published_at', { ascending: false })

    if (error) {
      console.error('Error fetching posts by tag:', error)
      throw new Error(`태그별 포스트 조회 실패: ${error.message}`)
    }

    return data || []
  }

  /**
   * 모든 태그 조회
   */
  async getAllTags(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('posts')
      .select('tags')
      .eq('published', true)
      .not('tags', 'is', null)

    if (error) {
      console.error('Error fetching tags:', error)
      throw new Error(`태그 조회 실패: ${error.message}`)
    }

    // 모든 태그를 평면화하고 중복 제거
    const allTags = data
      ?.flatMap(post => post.tags || [])
      .filter((tag, index, array) => array.indexOf(tag) === index)
      .sort()

    return allTags || []
  }
}