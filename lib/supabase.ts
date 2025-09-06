import { createBrowserClient, type CookieOptions } from '@supabase/ssr'
import { type Session } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

// 환경 변수 검증
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// NOTE: Do NOT create a browser client at module evaluation time. Creating a
// browser client (which accesses `document`) during build/server runtime will
// throw `ReferenceError: document is not defined`.
//
// Use `createSupabaseClient()` from client-side code (e.g. inside React
// components or effects). For server code (server components, `sitemap.ts`,
// API routes), use `createSupabaseServerClient()` from
// `lib/supabase-server.ts`.

// 클라이언트 생성 함수 (호환성을 위해) - createBrowserClient로 업데이트
export function createSupabaseClient(): SupabaseClient {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    throw new Error(
      'createSupabaseClient() must be called in a browser environment. For server-side usage, use createSupabaseServerClient() from lib/supabase-server.ts.'
    )
  }

  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          const cookie = document.cookie.split(';').find((c) => c.trim().startsWith(`${name}=`))
          return cookie ? cookie.split('=')[1] : null
        },
        set(name: string, value: string, options: CookieOptions) {
          let cookieString = `${name}=${value};`
          for (const key in options) {
            cookieString += ` ${key}=${options[key as keyof CookieOptions]};`
          }
          document.cookie = cookieString
        },
        remove(name: string, options: CookieOptions) {
          document.cookie = `${name}=; Max-Age=0; ${Object.entries(options).map(([key, val]) => `${key}=${val}`).join('; ')}`
        },
      },
    }
  )
}

// Export a `supabase` binding that resolves to the server client when running
// in Node (server-side) and to a lazily-created browser client in the
// browser. This keeps imports safe during build/SSR while preserving the
// existing `import { supabase } from '@/lib/supabase'` usage in client code.
// Use a singleton browser client so multiple imports/usages share the same
// Supabase instance. Creating a new client on every property access caused
// subscriptions and session state to diverge (e.g. onAuthStateChange not
// matching the client used for signIn), which breaks login flows.
let _browserSupabase: SupabaseClient<Database> | null = null
function getBrowserSupabaseClient(): SupabaseClient<Database> {
  if (!_browserSupabase) {
    _browserSupabase = createSupabaseClient()
  }
  return _browserSupabase
}

export const supabase: SupabaseClient<Database> = (typeof window === 'undefined')
  ? new Proxy({} as SupabaseClient<Database>, {
      get() {
        throw new Error(
          'Do not import `supabase` from lib/supabase in server code. Use createSupabaseServerClient() from lib/supabase-server.ts in server components and API routes.'
        )
      },
    })
  : new Proxy({} as SupabaseClient<Database>, {
      get(_target, prop: string | symbol) {
        const client = getBrowserSupabaseClient()
        // @ts-ignore - forward the access to the real client
        const value = (client as any)[prop]
        // If it's a function, bind it to the client to preserve `this`.
        if (typeof value === 'function') return value.bind(client)
        return value
      },
      set(_target, prop: string | symbol, value: any) {
        const client = getBrowserSupabaseClient()
        ;(client as any)[prop] = value
        return true
      },
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
          author_id: string | null // user_id -> author_id
          created_at: string
          updated_at: string
          author_name?: string | null // RPC 함수 반환용
          author_avatar?: string | null // RPC 함수 반환용
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
          author_id?: string | null // user_id -> author_id
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
          author_id?: string | null // user_id -> author_id
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string | null
          author_id: string | null // user_id -> author_id
          content: string
          created_at: string
          updated_at: string
          author_name?: string | null // RPC 함수 반환용
          author_avatar?: string | null // RPC 함수 반환용
        }
        Insert: {
          id?: string
          post_id?: string | null
          author_id?: string | null // user_id -> author_id
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string | null
          author_id?: string | null // user_id -> author_id
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
          author_id: string | null // user_id -> author_id
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
          author_id?: string | null // user_id -> author_id
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
          author_id?: string | null // user_id -> author_id
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string // Not null
          username: string | null
          display_name: string | null
          avatar: string | null // avatar_url -> avatar
          bio: string | null
          website: string | null
          location: string | null
          role: string | null // role 추가
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string // Not null
          username?: string | null
          display_name?: string | null
          avatar?: string | null // avatar_url -> avatar
          bio?: string | null
          website?: string | null
          location?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string
          username?: string | null
          display_name?: string | null
          avatar?: string | null // avatar_url -> avatar
          bio?: string | null
          website?: string | null
          location?: string | null
          role?: string | null
          updated_at?: string
        }
      }
      project_members: { // project_members 테이블 추가
        Row: {
          id: string
          project_id: string | null
          user_id: string | null
          role: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id?: string | null
          user_id?: string | null
          role?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string | null
          user_id?: string | null
          role?: string | null
          created_at?: string
        }
      }
    }
    Functions: {
      get_posts_with_authors: { // get_posts_with_authors 함수 추가
        Args: {
          limit_count?: number
          offset_count?: number
          published_only?: boolean
        }
        Returns: {
          id: string
          title: string
          slug: string
          summary: string | null
          content: string | null
          cover_url: string | null
          tags: string[] | null
          published: boolean
          published_at: string | null
          created_at: string
          updated_at: string
          author_id: string
          author_email: string | null
          author_username: string | null
          author_display_name: string | null
          author_avatar: string | null
        }[]
      }
      get_comments_with_authors: { // get_comments_with_authors 함수 추가
        Args: {
          post_id: string
        }
        Returns: {
          id: string
          content: string
          created_at: string
          updated_at: string
          author_id: string
          author_username: string | null
          author_display_name: string | null
          author_avatar: string | null
        }[]
      }
      get_projects_with_authors: { // get_projects_with_authors 함수 추가
        Args: {
          limit_count?: number
          offset_count?: number
          published_only?: boolean
        }
        Returns: {
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
          created_at: string
          updated_at: string
          author_id: string
          author_username: string | null
          author_display_name: string | null
          author_avatar: string | null
        }[]
      }
      get_user_profile: {
        Args: {
          user_id: string
        }
        Returns: {
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
      }
      update_user_profile: {
        Args: {
          user_id: string
          new_username: string | null
          new_display_name: string | null
          new_avatar_url: string | null
          new_bio: string | null
          new_website: string | null
          new_location: string | null
        }
        Returns: boolean
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

// 확장된 타입 정의 업데이트 (RPC 함수 반환 타입에 맞춰 수정)
export interface CommentWithAuthor extends Comment {
  author_id: string
  author_username: string | null
  author_display_name: string | null
  author_avatar: string | null
}

export interface PostWithAuthor extends Post {
  author_id: string
  author_email: string | null
  author_username: string | null
  author_display_name: string | null
  author_avatar: string | null
}

export interface ProjectWithAuthor extends Project {
  author_id: string
  author_username: string | null
  author_display_name: string | null
  author_avatar: string | null
}

// UserProfile 인터페이스 업데이트 (avatar_url -> avatar, role, email not null)
export interface UserProfile {
  id: string
  email: string // Not null
  username: string | null
  display_name: string | null
  avatar: string | null // avatar_url -> avatar
  bio: string | null
  website: string | null
  location: string | null
  role: string | null // role 추가
  created_at: string
  updated_at: string
}

// ProfileUpdateData 인터페이스 업데이트 (avatar_url -> avatar)
export interface ProfileUpdateData {
  username?: string
  display_name?: string
  avatar_url?: string // avatar_url -> avatar
  bio?: string
  website?: string
  location?: string
  role?: string // role 추가
}

// 유틸리티 함수들 업데이트 (getUserProfile, updateUserProfile, getUserAvatar 등)
// - getUserProfile: public.users 테이블에서 가져온 'avatar' 컬럼을 사용하도록 수정
// - updateUserProfile: 'avatar_url' 대신 'avatar'를 사용하도록 수정
// - getUserAvatar: user.user_metadata?.avatar_url 또는 public.users.avatar 사용하도록 수정

export function getUserDisplayName(user: AuthUser | UserProfile | null): string {
  if (!user) return 'Anonymous'

  if ('user_metadata' in user) { // AuthUser 타입일 경우
    return (
      user.user_metadata?.display_name ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.user_metadata?.username ||
      user.email?.split('@')[0] ||
      'User'
    )
  } else { // UserProfile 타입일 경우
    return user.display_name || user.username || user.email?.split('@')[0] || 'User'
  }
}

export function getUserAvatar(user: AuthUser | UserProfile | null): string | null {
  if (!user) return null

  if ('user_metadata' in user) { // AuthUser 타입일 경우
    return user.user_metadata?.avatar_url || null
  } else { // UserProfile 타입일 경우
    return user.avatar || null
  }
}

export function isEmailVerified(user: AuthUser | null): boolean {
  return !!(user?.email_confirmed_at)
}

// 프로필 관련 함수들 - 단순화된 버전 (RPC 함수 대신 직접 테이블 접근)
export async function getUserProfile(userId: string, client?: SupabaseClient<Database>): Promise<UserProfile | null> {
  try {
  // supabase client (인자로 전달된 클라이언트 우선, 없으면 브라우저에서 생성)
  const supabase = client ?? createSupabaseClient()

  // auth.users에서 직접 사용자 정보 가져오기
  const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user || user.id !== userId) {
      return null
    }

    // public.users 테이블에서 추가 정보 가져오기 (있는 경우)
    const { data: publicUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    const publicUserData = publicUser as Database['public']['Tables']['users']['Row'] | null

    return {
      id: user.id,
      email: user.email || '',
      username: publicUserData?.username || user.user_metadata?.username || null,
      display_name: publicUserData?.display_name || user.user_metadata?.display_name || user.user_metadata?.full_name || null,
      avatar: publicUserData?.avatar || user.user_metadata?.avatar_url || null, // avatar_url -> avatar
      bio: publicUserData?.bio || user.user_metadata?.bio || null,
      website: publicUserData?.website || user.user_metadata?.website || null,
      location: publicUserData?.location || user.user_metadata?.location || null,
      role: publicUserData?.role || null, // role 추가
      created_at: user.created_at,
      updated_at: user.updated_at || user.created_at
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

export async function updateUserProfile(userId: string, updates: ProfileUpdateData, client?: SupabaseClient<Database>): Promise<boolean> {
  try {
  const supabase = client ?? createSupabaseClient()

  // auth.users 메타데이터 업데이트 (여기서는 email 변경은 직접 하지 않음, 다른 방법을 통해야 함)
  const { error: authError } = await supabase.auth.updateUser({
      data: {
        display_name: updates.display_name,
        username: updates.username,
        avatar_url: updates.avatar_url || null, // auth.users의 user_metadata는 avatar_url을 사용
      }
    })

    if (authError) {
      console.error('Error updating auth user metadata:', authError)
      return false
    }

    // public.users 테이블 업데이트 (있는 경우)
    const updateData: Database['public']['Tables']['users']['Update'] = {
      username: updates.username || null,
      display_name: updates.display_name || null,
      avatar: updates.avatar_url || null, // public.users는 avatar를 사용
      bio: updates.bio || null,
      website: updates.website || null,
      location: updates.location || null,
      role: updates.role || null,
      updated_at: new Date().toISOString()
    }

    const { error: publicError } = await (supabase as any)
      .from('users')
      .update(updateData)
      .eq('id', userId)

    if (publicError) {
      console.warn('Error updating public user profile:', publicError)
      // public.users 업데이트 실패는 치명적이지 않음
    }

    return true
  } catch (error) {
    console.error('Error updating user profile:', error)
    return false
  }
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
  const supabase = createSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // auth.users의 user_metadata에서 email을 가져와서 getUserProfile에 전달
  return await getUserProfile(user.id, supabase)
  } catch (error) {
    console.error('Error fetching current user profile:', error)
    return null
  }
}
