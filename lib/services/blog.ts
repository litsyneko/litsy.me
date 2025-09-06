import { SupabaseClient } from '@supabase/supabase-js'
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

export interface BlogPostWithAuthor extends BlogPost {
  author_email?: string
  author_username?: string
  author_display_name?: string
  author_avatar?: string
}

export class BlogService {
  private supabase: SupabaseClient<Database>

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase
  }

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
      author_id: data.user_id, // user_id -> author_id
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
    // author_id 업데이트는 선택적. 필요시 추가

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
   * 블로그 포스트 목록 조회 (작성자 정보 포함)
   */
  async getPosts(options: {
    published?: boolean
    limit?: number
    offset?: number
    authorId?: string // user_id -> authorId
  } = {}): Promise<BlogPostWithAuthor[]> {
    try {
      // 데이터베이스 함수를 사용하여 작성자 정보와 함께 조회
      const { data, error } = await this.supabase.rpc('get_posts_with_authors', {
        limit_count: options.limit || 10,
        offset_count: options.offset || 0,
        published_only: options.published !== false
      })

      if (error) {
        console.error('Error fetching posts with authors:', error)
        // 폴백: 기본 쿼리 사용
        return this.getPostsFallback(options)
      }

      // 결과를 BlogPostWithAuthor 형태로 변환
      return (data || []).map((post: any) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        summary: post.summary,
        content: post.content,
        tags: post.tags,
        cover_url: post.cover_url,
        published: post.published,
        published_at: post.published_at,
        author_id: post.author_id, // author_id 매핑
        created_at: post.created_at,
        updated_at: post.updated_at,
        author_email: post.author_email,
        author_username: post.author_username,
        author_display_name: post.author_display_name,
        author_avatar: post.author_avatar
      }))
    } catch (error) {
      console.error('Error in getPosts:', error)
      return this.getPostsFallback(options)
    }
  }

  // 폴백: 기본 쿼리를 사용한 포스트 조회 (author join 추가)
  private async getPostsFallback(options: {
    published?: boolean
    limit?: number
    offset?: number
    authorId?: string
  } = {}): Promise<BlogPostWithAuthor[]> {
    // RPC 함수를 활용한 폴백
    const { data, error } = await this.supabase.rpc('get_posts_with_authors', {
      limit_count: options.limit || 10,
      offset_count: options.offset || 0,
      published_only: options.published !== false
    })

    if (error) {
      console.error('Error fetching posts with authors (RPC fallback):', error)
      throw new Error(`포스트 조회 실패: ${error.message}`)
    }

    return (data || []).map((post: any) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      summary: post.summary,
      content: post.content,
      tags: post.tags,
      cover_url: post.cover_url,
      published: post.published,
      published_at: post.published_at,
      author_id: post.author_id, // author_id 매핑
      created_at: post.created_at,
      updated_at: post.updated_at,
      author_email: post.author_email,
      author_username: post.author_username,
      author_display_name: post.author_display_name,
      author_avatar: post.author_avatar
    }))
  }

  /**
   * 특정 블로그 포스트 조회 (작성자 정보 포함) - get_posts_with_authors 활용
   */
  async getPost(slug: string): Promise<BlogPostWithAuthor | null> {
    // RPC 함수를 활용
    const { data, error } = await this.supabase.rpc('get_posts_with_authors', {
      limit_count: 1,
      offset_count: 0,
      published_only: false // 단일 포스트 조회이므로 published 여부 무관
    })
    .filter('slug', 'eq', slug) // filter를 사용하여 slug 필터링

    if (error) {
      console.error('Error fetching post with author (RPC):', error)
      // RPC 함수가 실패하면 에러를 던집니다. PostgREST 관계 조인 폴백 제거.
      throw new Error(`포스트 조회 실패: ${error.message}`)
    }

    if (!data || data.length === 0) {
      return null
    }

    const post = data[0]
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      summary: post.summary,
      content: post.content,
      tags: post.tags,
      cover_url: post.cover_url,
      published: post.published,
      published_at: post.published_at,
      author_id: post.author_id, // author_id 매핑
      created_at: post.created_at,
      updated_at: post.updated_at,
      author_email: post.author_email,
      author_username: post.author_username,
      author_display_name: post.author_display_name,
      author_avatar: post.author_avatar
    }
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
   * 태그별 포스트 조회 (get_posts_with_authors 활용)
   */
  async getPostsByTag(tag: string): Promise<BlogPostWithAuthor[]> {
    const { data, error } = await this.supabase.rpc('get_posts_with_authors', {
      published_only: true // 태그별 조회는 발행된 포스트만
    })
    .filter('tags', 'cs', `{${tag}}`) // tags 배열에 tag가 포함되어 있는지 필터링

    if (error) {
      console.error('Error fetching posts by tag with authors (RPC):', error)
      throw new Error(`태그별 포스트 조회 실패: ${error.message}`)
    }

    return (data || []).map((post: any) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      summary: post.summary,
      content: post.content,
      tags: post.tags,
      cover_url: post.cover_url,
      published: post.published,
      published_at: post.published_at,
      author_id: post.author_id, // author_id 매핑
      created_at: post.created_at,
      updated_at: post.updated_at,
      author_email: post.author_email,
      author_username: post.author_username,
      author_display_name: post.author_display_name,
      author_avatar: post.author_avatar
    }))
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

  /**
   * 댓글 조회 (작성자 정보 포함)
   */
  async getComments(postId: string): Promise<any[]> {
    const { data, error } = await this.supabase.rpc('get_comments_with_authors', {
      post_id: postId // 파라미터 이름 수정
    })

    if (error) {
      console.error('Error fetching comments with authors (RPC):', error)
      throw new Error(`댓글 조회 실패: ${error.message}`)
    }

    return (data || []).map((comment: any) => ({
      id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      author_id: comment.author_id,
      author_username: comment.author_username,
      author_display_name: comment.author_display_name,
      author_avatar: comment.author_avatar
    }))
  }
}