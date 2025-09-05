# SEO Sitemap 설계 문서

## 개요

Next.js 15.2.4 App Router 환경에서 동적 sitemap.xml 생성 시스템을 구현합니다. 정적 페이지와 Supabase에서 조회한 동적 콘텐츠(블로그 포스트, 프로젝트)를 포함하는 표준 XML sitemap을 자동 생성하여 SEO 최적화와 검색 엔진 크롤링을 개선합니다.

## 아키텍처

### 전체 구조
```
app/
├── sitemap.ts          # Next.js sitemap 생성 함수
├── robots.ts           # robots.txt 생성 (sitemap 위치 포함)
└── lib/
    └── sitemap/
        ├── types.ts    # sitemap 관련 타입 정의
        ├── config.ts   # sitemap 설정 및 상수
        ├── static.ts   # 정적 페이지 URL 생성
        ├── dynamic.ts  # 동적 페이지 URL 생성
        └── utils.ts    # sitemap 유틸리티 함수
```

### Next.js Sitemap API 활용
Next.js 13+의 내장 sitemap 기능을 사용하여 `app/sitemap.ts`에서 sitemap 객체 배열을 반환합니다.

## 컴포넌트 및 인터페이스

### 1. 타입 정의 (lib/sitemap/types.ts)

```typescript
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
```

### 2. 설정 관리 (lib/sitemap/config.ts)

```typescript
export const SITEMAP_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  maxUrls: 50000, // XML Sitemap 표준 제한
  staticPages: [
    { path: '/', changeFrequency: 'weekly', priority: 1.0 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/contact', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/blog', changeFrequency: 'daily', priority: 0.9 },
    { path: '/projects', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/auth/login', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/auth/signup', changeFrequency: 'yearly', priority: 0.3 }
  ],
  dynamicContent: {
    posts: { baseUrl: '/blog', changeFrequency: 'weekly', priority: 0.8 },
    projects: { baseUrl: '/projects', changeFrequency: 'monthly', priority: 0.7 }
  }
}
```

### 3. 정적 페이지 처리 (lib/sitemap/static.ts)

```typescript
export function generateStaticUrls(): SitemapEntry[] {
  return SITEMAP_CONFIG.staticPages.map(page => ({
    url: `${SITEMAP_CONFIG.baseUrl}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority
  }))
}
```

### 4. 동적 콘텐츠 처리 (lib/sitemap/dynamic.ts)

```typescript
export async function generateBlogUrls(): Promise<SitemapEntry[]> {
  const { data: posts } = await supabase
    .from('posts')
    .select('slug, updated_at, published_at')
    .eq('published', true)
    .order('published_at', { ascending: false })

  return posts?.map(post => ({
    url: `${SITEMAP_CONFIG.baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: SITEMAP_CONFIG.dynamicContent.posts.changeFrequency,
    priority: SITEMAP_CONFIG.dynamicContent.posts.priority
  })) || []
}

export async function generateProjectUrls(): Promise<SitemapEntry[]> {
  const { data: projects } = await supabase
    .from('projects')
    .select('slug, updated_at')
    .eq('published', true)
    .order('created_at', { ascending: false })

  return projects?.map(project => ({
    url: `${SITEMAP_CONFIG.baseUrl}/projects/${project.slug}`,
    lastModified: new Date(project.updated_at),
    changeFrequency: SITEMAP_CONFIG.dynamicContent.projects.changeFrequency,
    priority: SITEMAP_CONFIG.dynamicContent.projects.priority
  })) || []
}
```

### 5. 메인 Sitemap 생성 (app/sitemap.ts)

```typescript
import { MetadataRoute } from 'next'
import { generateStaticUrls } from '@/lib/sitemap/static'
import { generateBlogUrls, generateProjectUrls } from '@/lib/sitemap/dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [staticUrls, blogUrls, projectUrls] = await Promise.all([
      generateStaticUrls(),
      generateBlogUrls(),
      generateProjectUrls()
    ])

    return [...staticUrls, ...blogUrls, ...projectUrls]
  } catch (error) {
    console.error('Sitemap generation error:', error)
    // 에러 발생 시 최소한 정적 페이지라도 반환
    return generateStaticUrls()
  }
}
```

### 6. Robots.txt 생성 (app/robots.ts)

```typescript
import { MetadataRoute } from 'next'
import { SITEMAP_CONFIG } from '@/lib/sitemap/config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/auth/callback', '/settings/', '/profile/edit']
    },
    sitemap: `${SITEMAP_CONFIG.baseUrl}/sitemap.xml`
  }
}
```

## 데이터 모델

### Supabase 테이블 활용
기존 `posts`와 `projects` 테이블을 활용하며, sitemap 생성에 필요한 필드들:

**Posts 테이블:**
- `slug`: URL 생성용
- `published`: 공개 여부 필터링
- `updated_at`: lastModified 값
- `published_at`: 정렬용

**Projects 테이블:**
- `slug`: URL 생성용  
- `published`: 공개 여부 필터링
- `updated_at`: lastModified 값
- `created_at`: 정렬용

## 에러 처리

### 1. 데이터베이스 연결 실패
- Supabase 연결 실패 시 정적 페이지만 포함하는 기본 sitemap 반환
- 에러 로깅으로 문제 추적

### 2. 개별 콘텐츠 조회 실패
- Promise.allSettled 사용하여 일부 실패해도 다른 콘텐츠는 포함
- 실패한 콘텐츠 타입에 대한 로깅

### 3. URL 생성 오류
- 잘못된 slug나 데이터에 대한 검증
- 유효하지 않은 URL 필터링

## 테스팅 전략

### 1. 단위 테스트
- 각 URL 생성 함수의 정확성 검증
- 설정값 검증
- 에러 처리 로직 테스트

### 2. 통합 테스트
- 전체 sitemap 생성 프로세스 테스트
- Supabase 연동 테스트
- 실제 XML 출력 검증

### 3. E2E 테스트
- `/sitemap.xml` 엔드포인트 접근 테스트
- 생성된 XML의 표준 준수 검증
- 검색 엔진 도구를 통한 sitemap 유효성 검사

## 성능 최적화

### 1. 데이터베이스 쿼리 최적화
- 필요한 필드만 선택 (slug, updated_at, published 등)
- published=true 필터링으로 불필요한 데이터 제외
- 적절한 정렬과 제한

### 2. 캐싱 전략
- Next.js의 기본 캐싱 활용
- 정적 생성 시 sitemap 캐싱
- 개발 환경에서는 캐싱 비활성화

### 3. 병렬 처리
- Promise.all을 사용한 동시 데이터 조회
- 정적/동적 URL 생성의 병렬 처리

## 배포 및 모니터링

### 1. 환경별 설정
- `NEXT_PUBLIC_APP_URL` 환경 변수로 도메인 설정
- 개발/스테이징/프로덕션 환경별 URL 관리

### 2. 모니터링
- sitemap 생성 에러 로깅
- 성능 메트릭 수집
- 검색 엔진 크롤링 상태 모니터링

### 3. 검색 엔진 제출
- Google Search Console에 sitemap 제출
- Bing Webmaster Tools 등록
- 정기적인 sitemap 상태 확인