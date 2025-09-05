# 인증 시스템 수정 설계 문서

## 개요

현재 인증 시스템에서 발생하는 `getUserAvatar is not a function` 오류를 해결하고, 인증 관련 기능들을 안정화하는 설계입니다. 주요 문제는 두 개의 서로 다른 AuthContext가 존재하고, 컴포넌트에서 필요한 함수들이 제대로 제공되지 않는 것입니다.

## 아키텍처

### 현재 문제점

1. **중복된 AuthContext**: `contexts/AuthContext.tsx`와 `lib/auth-context.tsx`에 두 개의 다른 AuthContext가 존재
2. **누락된 함수들**: `getUserAvatar`와 `getUserDisplayName` 함수가 AuthContextType에 정의되지 않음
3. **불일치하는 인터페이스**: 각 AuthContext가 서로 다른 인터페이스를 제공
4. **컴포넌트 오류**: `navigation.tsx`에서 존재하지 않는 함수를 호출하여 런타임 오류 발생

### 해결 방안

1. **단일 AuthContext 통합**: 하나의 일관된 AuthContext로 통합
2. **완전한 인터페이스 제공**: 모든 필요한 함수들을 포함한 AuthContextType 정의
3. **유틸리티 함수 통합**: `getUserAvatar`, `getUserDisplayName` 등의 함수를 AuthContext에 포함
4. **타입 안전성 보장**: TypeScript를 활용한 타입 안전성 확보

## 컴포넌트 및 인터페이스

### AuthContextType 인터페이스 (통합)

```typescript
export interface AuthContextType {
  // 상태
  user: AuthUser | null
  session: Session | null
  loading: boolean
  
  // 인증 액션
  signUp: (email: string, password: string, metadata: UserMetadata) => Promise<AuthResponse>
  signIn: (email: string, password: string) => Promise<AuthResponse>
  signInWithOAuth: (provider: 'discord', redirectTo?: string) => Promise<AuthResponse>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<AuthResponse>
  resendConfirmation: (email: string) => Promise<AuthResponse>
  
  // 유틸리티 함수 (새로 추가)
  getUserDisplayName: () => string
  getUserAvatar: () => string | null
  isEmailVerified: () => boolean
  refreshSession: () => Promise<void>
  refreshUser: () => Promise<void>
}
```

### 주요 컴포넌트 구조

```
contexts/
├── AuthContext.tsx (메인 AuthContext - 유지)
└── (lib/auth-context.tsx 제거 예정)

hooks/
├── useAuth.ts (AuthContext 사용)
├── useAuthGuard.ts (인증 가드)
└── useEmailVerification.ts (이메일 인증)

lib/
├── supabase.ts (유틸리티 함수들)
└── types/auth.ts (타입 정의)
```

## 데이터 모델

### AuthUser 타입

```typescript
export interface AuthUser extends User {
  user_metadata: {
    username?: string
    display_name?: string
    full_name?: string
    name?: string
    avatar_url?: string
    [key: string]: any
  }
}
```

### UserMetadata 타입

```typescript
export interface UserMetadata {
  username: string
  display_name: string
  avatar_url?: string
}
```

### AuthResponse 타입

```typescript
export interface AuthResponse {
  success: boolean
  message?: string
  error?: string
  data?: any
}
```

## 오류 처리

### 런타임 오류 방지

1. **함수 존재 확인**: AuthContext에서 모든 필요한 함수 제공
2. **기본값 제공**: 사용자 정보가 없을 때 적절한 기본값 반환
3. **타입 가드**: TypeScript를 활용한 컴파일 타임 오류 방지
4. **에러 바운더리**: 예상치 못한 오류에 대한 처리

### 오류 메시지 표준화

```typescript
export const AUTH_ERRORS = {
  FUNCTION_NOT_FOUND: '인증 함수를 찾을 수 없습니다',
  USER_NOT_FOUND: '사용자 정보를 찾을 수 없습니다',
  SESSION_EXPIRED: '세션이 만료되었습니다',
  INVALID_CREDENTIALS: '잘못된 인증 정보입니다'
} as const
```

## 테스트 전략

### 단위 테스트

1. **AuthContext 테스트**: 모든 함수가 올바르게 동작하는지 확인
2. **유틸리티 함수 테스트**: `getUserAvatar`, `getUserDisplayName` 함수 테스트
3. **훅 테스트**: `useAuth` 훅이 올바른 값을 반환하는지 확인

### 통합 테스트

1. **컴포넌트 렌더링 테스트**: `navigation.tsx`가 오류 없이 렌더링되는지 확인
2. **인증 플로우 테스트**: 로그인/로그아웃 플로우가 정상 동작하는지 확인
3. **OAuth 테스트**: Discord OAuth 로그인이 정상 동작하는지 확인

### E2E 테스트

1. **사용자 시나리오 테스트**: 실제 사용자 관점에서의 인증 플로우 테스트
2. **오류 시나리오 테스트**: 네트워크 오류, 서버 오류 등의 상황에서의 동작 확인

## 구현 우선순위

### Phase 1: 긴급 오류 수정
- AuthContextType 인터페이스에 누락된 함수들 추가
- `getUserAvatar`, `getUserDisplayName` 함수 구현
- `navigation.tsx` 오류 해결

### Phase 2: AuthContext 통합
- 중복된 AuthContext 제거
- 단일 AuthContext로 통합
- 모든 컴포넌트에서 일관된 인터페이스 사용

### Phase 3: 기능 완성
- 이메일 인증 시스템 완성
- Discord OAuth 안정화
- 비밀번호 재설정 기능 완성

### Phase 4: 사용자 경험 개선
- 프로필 관리 기능 완성
- 보안 강화
- 성능 최적화

## 보안 고려사항

### 세션 관리
- 자동 토큰 갱신
- 세션 만료 처리
- 다중 기기 로그인 관리

### 데이터 보호
- 사용자 정보 암호화
- 민감한 정보 로깅 방지
- CSRF 보호

### OAuth 보안
- State 매개변수 검증
- Redirect URI 검증
- 토큰 안전한 저장

## 성능 최적화

### 컨텍스트 최적화
- 불필요한 리렌더링 방지
- 메모이제이션 활용
- 지연 로딩 구현

### 네트워크 최적화
- API 호출 최소화
- 캐싱 전략 구현
- 오프라인 지원 고려