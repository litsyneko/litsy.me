import { createClient } from '@supabase/supabase-js'
import { validateClientEnvVars } from './utils/env'

// 환경 변수 검증
validateClientEnvVars()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 클라이언트 사이드 Supabase 클라이언트 (브라우저용)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web'
    }
  }
})

// 타입 정의 - Supabase Auth 직접 사용으로 단순화
export type Database = {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string
          title: string
          slug: string
          summary: string | null
          content: string | null
          tags: string[] | null
          cover_url: string | null
          published: boolean
          published_at: string | null
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          summary?: string | null
          content?: string | null
          tags?: string[] | null
          cover_url?: string | null
          published?: boolean
          published_at?: string | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          summary?: string | null
          content?: string | null
          tags?: string[] | null
          cover_url?: string | null
          published?: boolean
          published_at?: string | null
          user_id?: string | null
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string | null
          user_id: string | null
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id?: string | null
          user_id?: string | null
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string | null
          user_id?: string | null
          content?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          slug: string
          summary: string | null
          body: string | null
          cover_url: string | null
          tech: string[] | null
          repo_url: string | null
          live_url: string | null
          published: boolean
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          summary?: string | null
          body?: string | null
          cover_url?: string | null
          tech?: string[] | null
          repo_url?: string | null
          live_url?: string | null
          published?: boolean
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          summary?: string | null
          body?: string | null
          cover_url?: string | null
          tech?: string[] | null
          repo_url?: string | null
          live_url?: string | null
          published?: boolean
          user_id?: string | null
          updated_at?: string
        }
      }
    }
  }
}

export type Post = Database['public']['Tables']['posts']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type Project = Database['public']['Tables']['projects']['Row']

// Supabase Auth User 타입 (auth.users에서 직접 사용)
export interface AuthUser {
  id: string
  email?: string
  user_metadata: {
    full_name?: string
    name?: string
    username?: string
    display_name?: string
    avatar_url?: string
    [key: string]: any
  }
  app_metadata: {
    provider?: string
    [key: string]: any
  }
  email_confirmed_at?: string
  created_at: string
  updated_at: string
}

// 확장된 타입 정의
export interface CommentWithAuthor extends Comment {
  author: AuthUser | null
}

export interface PostWithAuthor extends Post {
  author: AuthUser | null
}

export interface ProjectWithAuthor extends Project {
  author: AuthUser | null
}

// 유틸리티 함수들
export function getUserDisplayName(user: AuthUser | null): string {
  if (!user) return 'Anonymous'

  return (
    user.user_metadata?.display_name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.user_metadata?.username ||
    user.email?.split('@')[0] ||
    'User'
  )
}

export function getUserAvatar(user: AuthUser | null): string | null {
  if (!user) return null

  return user.user_metadata?.avatar_url || null
}

export function isEmailVerified(user: AuthUser | null): boolean {
  return !!(user?.email_confirmed_at)
}

// 프로필 관련 타입들
export interface UserProfile {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  website: string | null
  location: string | null
  email: string
  created_at: string
  updated_at: string
}

export interface ProfileUpdateData {
  username?: string
  display_name?: string
  avatar_url?: string
  bio?: string
  website?: string
  location?: string
}

// 프로필 관련 함수들
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .rpc('get_user_profile', { user_id: userId })
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

export async function updateUserProfile(userId: string, updates: ProfileUpdateData): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .rpc('update_user_profile', {
        user_id: userId,
        new_username: updates.username || null,
        new_display_name: updates.display_name || null,
        new_avatar_url: updates.avatar_url || null,
        new_bio: updates.bio || null,
        new_website: updates.website || null,
        new_location: updates.location || null
      })

    if (error) {
      console.error('Error updating user profile:', error)
      return false
    }

    return data === true
  } catch (error) {
    console.error('Error updating user profile:', error)
    return false
  }
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    return await getUserProfile(user.id)
  } catch (error) {
    console.error('Error fetching current user profile:', error)
    return null
  }
}