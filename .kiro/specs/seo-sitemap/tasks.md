# SEO Sitemap 구현 작업 목록

- [x] 1. Sitemap 라이브러리 구조 설정

  - lib/sitemap 디렉토리 생성 및 기본 파일 구조 구축
  - TypeScript 타입 정의 및 설정 상수 정의
  - _요구사항: 4.1, 4.2_

- [x] 1.1 타입 정의 및 설정 파일 생성


  - lib/sitemap/types.ts에 SitemapEntry, StaticPageConfig, DynamicContentConfig 인터페이스 정의
  - lib/sitemap/config.ts에 SITEMAP_CONFIG 객체와 정적 페이지 설정 구현
  - _요구사항: 1.4, 3.1, 4.1_

- [x] 1.2 유틸리티 함수 구현


  - lib/sitemap/utils.ts에 URL 검증 및 변환 유틸리티 함수 작성
  - 에러 처리 및 로깅 유틸리티 함수 구현
  - _요구사항: 4.2, 4.3_

- [x] 2. 정적 페이지 URL 생성 구현

  - 홈, about, contact, blog, projects, auth 페이지의 sitemap 엔트리 생성
  - changeFrequency와 priority 설정 적용
  - _요구사항: 1.2_

- [x] 2.1 정적 URL 생성 함수 작성


  - lib/sitemap/static.ts에 generateStaticUrls 함수 구현
  - 설정된 정적 페이지들을 SitemapEntry 배열로 변환
  - _요구사항: 1.2, 1.4_

- [x] 2.2 정적 URL 생성 단위 테스트 작성

  - generateStaticUrls 함수의 정확한 URL 생성 검증
  - changeFrequency, priority 값 검증 테스트
  - _요구사항: 1.2, 1.4_

- [x] 3. 동적 콘텐츠 URL 생성 구현

  - Supabase에서 블로그 포스트와 프로젝트 데이터 조회
  - 공개된 콘텐츠만 필터링하여 sitemap에 포함
  - _요구사항: 1.3, 2.1, 2.2_

- [x] 3.1 블로그 포스트 URL 생성 함수 구현


  - lib/sitemap/dynamic.ts에 generateBlogUrls 함수 작성
  - posts 테이블에서 published=true인 포스트의 slug, updated_at 조회
  - /blog/[slug] 형태의 URL 생성 및 lastModified 설정
  - _요구사항: 1.3, 2.1, 2.3_

- [x] 3.2 프로젝트 URL 생성 함수 구현

  - lib/sitemap/dynamic.ts에 generateProjectUrls 함수 작성
  - projects 테이블에서 published=true인 프로젝트의 slug, updated_at 조회
  - /projects/[slug] 형태의 URL 생성 및 lastModified 설정
  - _요구사항: 1.3, 2.2, 2.3_

- [x] 3.3 동적 URL 생성 단위 테스트 작성

  - generateBlogUrls, generateProjectUrls 함수 테스트
  - Supabase 쿼리 결과에 따른 URL 생성 검증
  - published 필터링 로직 테스트
  - _요구사항: 1.3, 2.1, 2.2_

- [x] 4. 메인 sitemap 생성 함수 구현

  - Next.js App Router의 sitemap.ts 파일 생성
  - 정적 및 동적 URL을 병합하여 최종 sitemap 반환
  - _요구사항: 1.1, 1.2, 1.3_

- [x] 4.1 Next.js sitemap.ts 파일 구현


  - app/sitemap.ts에 sitemap 생성 함수 작성
  - generateStaticUrls, generateBlogUrls, generateProjectUrls 함수 통합
  - Promise.all을 사용한 병렬 처리로 성능 최적화
  - _요구사항: 1.1, 1.2, 1.3, 4.3_

- [x] 4.2 에러 처리 및 복원력 구현

  - Supabase 연결 실패 시 정적 페이지만 포함하는 fallback 로직
  - 개별 콘텐츠 타입 조회 실패에 대한 부분적 복원
  - 에러 로깅 및 모니터링 구현
  - _요구사항: 4.2_

- [x] 4.3 sitemap 통합 테스트 작성

  - 전체 sitemap 생성 프로세스 테스트
  - 정적/동적 URL 통합 검증
  - 에러 상황에서의 fallback 동작 테스트
  - _요구사항: 1.1, 1.2, 1.3, 4.2_

- [x] 5. robots.txt 생성 구현

  - sitemap 위치를 포함하는 robots.txt 자동 생성
  - 크롤링 허용/차단 규칙 설정
  - _요구사항: 3.4_

- [x] 5.1 Next.js robots.ts 파일 구현


  - app/robots.ts에 robots.txt 생성 함수 작성
  - sitemap.xml 위치 명시 및 크롤링 규칙 설정
  - 환경별 도메인 설정 적용
  - _요구사항: 3.4_

- [x] 5.2 robots.txt 테스트 작성

  - robots.txt 생성 및 내용 검증
  - sitemap 위치 정확성 테스트
  - 크롤링 규칙 검증
  - _요구사항: 3.4_

- [ ] 6. 환경 설정 및 배포 준비
  - 환경 변수 설정 및 도메인 구성
  - 개발/프로덕션 환경별 sitemap URL 설정
  - _요구사항: 3.1, 3.2_

- [ ] 6.1 환경 변수 설정 업데이트



  - .env.example에 NEXT_PUBLIC_APP_URL 추가
  - 개발/프로덕션 환경별 도메인 설정 가이드 작성
  - _요구사항: 3.1_

- [x] 6.2 sitemap XML 표준 준수 검증

  - 생성된 sitemap.xml의 XML Sitemap Protocol 표준 준수 확인
  - Content-Type 헤더 설정 검증
  - URL 개수 및 크기 제한 확인
  - _요구사항: 3.1, 3.2, 3.3_

- [x] 7. E2E 테스트 및 검증


  - 실제 sitemap.xml 엔드포인트 접근 테스트
  - 검색 엔진 도구를 통한 sitemap 유효성 검사
  - _요구사항: 1.1, 3.1, 3.2_

- [x] 7.1 sitemap 엔드포인트 E2E 테스트

  - /sitemap.xml 경로 접근 및 응답 검증
  - XML 형식 및 구조 검증
  - 모든 예상 URL 포함 여부 확인
  - _요구사항: 1.1, 1.2, 1.3_

- [x] 7.2 검색 엔진 도구 검증 준비


  - Google Search Console sitemap 제출 가이드 작성
  - sitemap 유효성 검사 도구를 통한 검증
  - 성능 및 크롤링 모니터링 설정 가이드
  - _요구사항: 3.1, 3.2_