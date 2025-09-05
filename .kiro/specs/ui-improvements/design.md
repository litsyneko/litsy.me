# Design Document

## Overview

이 디자인 문서는 포트폴리오 웹사이트의 UI 개선을 위한 구체적인 설계 방안을 제시합니다. 주요 목표는 라이트 모드에서의 텍스트 가독성 개선과 about, blog 페이지의 모바일 반응형 최적화입니다.

## Architecture

### 현재 구조 분석

1. **테마 시스템**: Next.js + next-themes를 사용한 다크/라이트 모드 지원
2. **스타일링**: Tailwind CSS + CSS 변수를 통한 테마별 색상 관리
3. **반응형**: Tailwind의 responsive breakpoints 활용
4. **컴포넌트 구조**: 
   - About 페이지: 단일 페이지 컴포넌트 (`app/about/page.tsx`)
   - Blog 페이지: BlogHome → BlogList → BlogCard 구조

### 개선 방향

1. **색상 시스템 개선**: 라이트 모드에서 텍스트 대비 강화
2. **반응형 레이아웃 최적화**: 모바일 우선 접근법 적용
3. **터치 인터페이스 최적화**: 모바일 터치 타겟 크기 개선

## Components and Interfaces

### 1. 색상 시스템 개선

#### 문제점 분석
- 현재 라이트 모드 색상 설정:
  - `--foreground: #1a1a1a` (주 텍스트)
  - `--muted-foreground: #64748b` (보조 텍스트)
  - `--background: #fafafa` (배경)

#### 개선 방안
```css
:root {
  /* 개선된 라이트 모드 색상 */
  --foreground: #0f172a; /* 더 진한 텍스트 색상 */
  --muted-foreground: #475569; /* 더 진한 보조 텍스트 */
  --card-foreground: #0f172a; /* 카드 내 텍스트 */
}
```

#### 대비율 목표
- 주 텍스트: 최소 7:1 (AAA 등급)
- 보조 텍스트: 최소 4.5:1 (AA 등급)

### 2. About 페이지 모바일 최적화

#### 현재 구조 분석
- Hero Section: 프로필 카드 + 통계 카드
- Values Section: 4개 가치 카드
- Experience Timeline: 연도별 경험 타임라인
- Skills Section: 3개 기술 카테고리
- Philosophy Section: 개발 철학

#### 모바일 최적화 설계

##### Hero Section
```tsx
// 현재: md:flex-row (768px+에서 가로 배치)
// 개선: 모바일에서 세로 배치, 패딩 조정
<div className="flex flex-col items-center gap-4 sm:gap-6 md:flex-row md:gap-8">
  {/* 프로필 이미지 크기 조정 */}
  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32">
  {/* 텍스트 크기 반응형 조정 */}
  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
```

##### Timeline Section
```tsx
// 모바일에서 왼쪽 정렬 타임라인으로 변경
<div className="relative pl-8 md:pl-0"> {/* 모바일에서 왼쪽 여백 */}
  {/* 타임라인 라인 위치 조정 */}
  <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b...">
```

##### Skills Section
```tsx
// 모바일에서 1열, 태블릿에서 2열, 데스크톱에서 3열
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
```

### 3. Blog 페이지 모바일 최적화

#### 현재 구조 분석
- 메인 레이아웃: `lg:grid-cols-4` (3:1 비율)
- 검색 및 필터 UI
- 블로그 카드 그리드: `md:grid-cols-2`
- 사이드바: 태그 + 작성자 정보

#### 모바일 최적화 설계

##### 레이아웃 구조
```tsx
// 모바일에서 세로 배치, 데스크톱에서 가로 배치
<div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
  <main className="lg:col-span-3 order-2 lg:order-1">
  <aside className="lg:col-span-1 order-1 lg:order-2">
```

##### 검색 UI
```tsx
// 모바일에서 세로 배치, 버튼 크기 확대
<div className="flex flex-col sm:flex-row gap-3 mb-6">
  <input className="flex-1 p-3 sm:p-2 text-base sm:text-sm rounded-md">
  <button className="px-4 py-3 sm:px-3 sm:py-2 bg-muted rounded-md min-h-[44px]">
```

##### 블로그 카드 그리드
```tsx
// 모바일에서 1열, 태블릿에서 2열
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
```

##### 태그 버튼
```tsx
// 터치 친화적 크기로 조정
<button className="px-3 py-2 rounded-md text-sm min-h-[44px] min-w-[44px]">
```

## Data Models

### 반응형 Breakpoints
```typescript
const breakpoints = {
  sm: '640px',   // 모바일 가로/작은 태블릿
  md: '768px',   // 태블릿
  lg: '1024px',  // 작은 데스크톱
  xl: '1280px',  // 큰 데스크톱
  '2xl': '1536px' // 매우 큰 화면
}
```

### 터치 타겟 최소 크기
```typescript
const touchTargets = {
  minHeight: '44px', // iOS/Android 권장 최소 크기
  minWidth: '44px',
  padding: '12px',   // 내부 패딩
  margin: '8px'      // 요소 간 간격
}
```

## Error Handling

### 반응형 이미지 처리
- 이미지 로딩 실패 시 placeholder 표시
- 다양한 화면 크기에 맞는 이미지 최적화

### 텍스트 오버플로우 처리
- 긴 제목/내용에 대한 말줄임 처리
- 모바일에서 텍스트 줄바꿈 최적화

## Testing Strategy

### 반응형 테스트
1. **Breakpoint 테스트**: 각 breakpoint에서 레이아웃 확인
2. **터치 테스트**: 모바일 기기에서 터치 타겟 크기 확인
3. **가독성 테스트**: 다양한 화면에서 텍스트 가독성 확인

### 접근성 테스트
1. **색상 대비**: WCAG 2.1 AA/AAA 기준 준수 확인
2. **키보드 네비게이션**: 터치 없이 모든 기능 접근 가능 확인
3. **스크린 리더**: 의미 있는 구조와 레이블 제공

### 크로스 브라우저 테스트
1. **모바일 브라우저**: Safari (iOS), Chrome (Android)
2. **데스크톱 브라우저**: Chrome, Firefox, Safari, Edge
3. **다양한 화면 크기**: 320px ~ 1920px 범위

### 성능 테스트
1. **모바일 성능**: Lighthouse 모바일 점수 90+ 목표
2. **이미지 최적화**: WebP 형식 지원, lazy loading
3. **CSS 최적화**: 불필요한 스타일 제거, critical CSS 인라인

## Implementation Notes

### CSS 변수 활용
- 테마별 색상을 CSS 변수로 관리하여 일관성 유지
- 반응형 값들도 CSS 변수로 정의하여 재사용성 향상

### Tailwind CSS 활용
- 기존 Tailwind 클래스 최대한 활용
- 필요시 custom CSS로 보완

### 점진적 개선
1. 색상 시스템 개선 (가장 우선순위 높음)
2. About 페이지 모바일 최적화
3. Blog 페이지 모바일 최적화
4. 전체적인 터치 인터페이스 개선