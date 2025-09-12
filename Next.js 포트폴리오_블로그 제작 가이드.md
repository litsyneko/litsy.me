

# **Next.js를 활용한 포트폴리오 및 블로그 웹사이트 구축 전문가 가이드**

## **서론: 현대 개발자의 디지털 정체성: 왜 포트폴리오와 블로그에 Next.js가 최적의 선택인가**

개인 웹사이트는 더 이상 단순한 온라인 이력서가 아니다. 이는 개인 브랜딩, 블로그를 통한 지식 공유, 그리고 기술적 전문성을 입증하는 동적인 플랫폼으로서 전략적 중요성을 가진다. 이러한 플랫폼을 구축하는 데 사용되는 기술 스택의 선택은 개발자의 전문성을 보여주는 첫 번째이자 가장 중요한 증거가 된다.

Next.js는 이러한 전략적 목표를 달성하기 위한 최적의 프레임워크로 자리매김했다. 그 이유는 다음과 같은 핵심적인 장점에 기반한다.

* **성능 중심의 아키텍처**: Next.js는 초기 설계부터 속도를 핵심 가치로 삼는다. 서버 사이드 렌더링(SSR)과 정적 사이트 생성(SSG) 같은 기능들은 단순히 부가적인 요소가 아니라, 우수한 사용자 경험을 제공하고 결과적으로 더 나은 검색 엔진 최적화(SEO)를 달성하기 위한 근간을 이룬다.1 프레임워크에 내장된 자동 코드 분할, 이미지 최적화, 폰트 최적화와 같은 기능들은 구글의 공식적인 랭킹 요소인 코어 웹 바이탈(Core Web Vitals) 지표(LCP, FCP, CLS)를 직접적으로 개선한다.3  
* **기본적으로 보장되는 SEO 우위**: Next.js는 클라이언트 사이드 렌더링(CSR) 기반의 순수 React 애플리케이션이 본질적으로 안고 있는 SEO 문제를 해결한다. 완전히 렌더링된 HTML을 검색 엔진 크롤러에게 제공함으로써, 콘텐츠가 즉시 인덱싱될 수 있도록 보장한다.1 또한, 동적 메타 태그와 구조화된 데이터(JSON-LD) 생성 기능을 통해 검색 결과에서 풍부한 정보(rich results)를 노출시킬 수 있는 기반을 마련한다.1  
* **개발 경험(DX)의 혁신**: 파일 기반 라우팅부터 통합된 개발 도구에 이르기까지, Next.js의 응집력 있는 생태계는 개발자들이 더 적은 설정으로 더 빠르게 개발할 수 있게 해준다.4 이는 개발자가 고품질의 콘텐츠 제작과 독창적인 포트폴리오 표현이라는 본질에 더 많은 시간을 집중할 수 있도록 돕는다.

이러한 특징들은 프레임워크의 아키텍처가 검색 순위에 미치는 직접적인 인과 관계로 이어진다. Next.js의 렌더링 모델(SSR/SSG)은 빠른 페이지 로딩 속도를 보장하고 1, 이는 코어 웹 바이탈 점수를 향상시킨다.4 그리고 이 점수는 구글의 페이지 경험(Page Experience) 랭킹 알고리즘에 직접적인 영향을 미친다.3 이는 단순히 사이트를 크롤링 가능하게 만드는 것을 넘어, 검색 엔진이

*선호하는* 사이트를 만드는 과정이다. 순수 React 앱이 최소한의 HTML과 거대한 자바스크립트 번들을 보내 브라우저가 콘텐츠를 렌더링하기까지 긴 시간을 필요로 하는 반면, Next.js는 서버에서 렌더링을 완료한 완전한 HTML을 전송하여 이 과정을 극적으로 단축시킨다.

또한, Next.js는 단순함과 강력함 사이의 이상적인 균형점을 찾았다. 워드프레스는 접근성이 높지만 플러그인으로 인해 느려지고 개발자의 제어권이 제한될 수 있다.7 반면, 순수 React 앱은 완전한 제어권을 제공하지만 SEO와 성능 최적화를 위해 상당한 수작업이 필요하다.2 Next.js는 React의 강력함과 유연성을 유지하면서도 SEO의 단점을 극복하고, 최적화 작업을 기본적으로 처리하는 구조화된 프레임워크를 제공함으로써 두 세계의 장점을 모두 취한다.3

### **개인 브랜딩 사이트를 위한 프레임워크 비교**

| 지표 | Next.js | Create React App (CSR) | 워드프레스 (WordPress) |
| :---- | :---- | :---- | :---- |
| **기본 SEO 성능** | 탁월함 | 미흡함 | 플러그인으로 양호 |
| **성능 (코어 웹 바이탈)** | 기본적으로 최적화됨 | 수동 최적화 필요 | 가변적 / 플러그인에 의존 |
| **개발 경험** | 높음 \- 통합된 도구 | 중간 \- 생태계 직접 구성 | 낮음 \- 플랫폼에 제약 |
| **확장성 및 유연성** | 높음 \- 하이브리드 렌더링 | 높음 \- 비정형적 | 중간 \- 플러그인 생태계 |
| **호스팅 및 배포** | 원활함 \- Vercel 최적화 | 유연함 \- 모든 정적 호스트 | 특정 \- PHP/MySQL 호스팅 필요 |

## **1장: 견고한 기반 설계: Next.js, TypeScript, Tailwind CSS로 프로젝트 시작하기**

### **create-next-app을 이용한 초기화**

프로젝트의 기반을 다지는 첫 단계는 create-next-app을 사용하여 프로젝트 구조를 생성하는 것이다. 터미널에서 다음 명령어를 실행하여 타입스크립트, ESLint, Tailwind CSS가 포함된 최신 App Router 기반의 프로젝트를 생성한다.6

Bash

npx create-next-app@latest my-portfolio-blog \--typescript \--eslint \--tailwind \--app \--src-dir

각 플래그는 프로젝트의 철학을 정의하는 중요한 선택이다.

* \--typescript: 코드의 유지보수성과 안정성을 위해 타입스크립트를 사용하는 것은 이제 선택이 아닌 필수다.6  
* \--app: 최신 React 기능을 활용할 수 있는 App Router를 표준으로 채택한다.6  
* \--src-dir: 애플리케이션 소스 코드를 src 디렉토리 내에 구성하여 프로젝트 설정 파일과 명확히 분리하고 코드 구성을 개선한다.10

create-next-app 과정에서 제시되는 질문들은 프로젝트의 기본 설정을 결정한다. 타입스크립트, ESLint, Tailwind CSS, App Router 사용 여부 등을 긍정적으로 선택하는 것은 프로젝트 초기부터 모범 사례를 적용하여 기술 부채를 방지하고 현대적인 개발 환경을 구축하겠다는 의도를 반영한다.

### **프로젝트 구조 이해하기**

생성된 프로젝트의 파일 구조는 다음과 같은 핵심 요소들로 구성된다.

* **app 디렉토리**: App Router의 심장부다. 파일 시스템 기반 라우팅의 개념이 적용되며, 폴더 구조가 곧 URL 구조가 된다. layout.tsx, page.tsx와 같은 특수 파일들이 각 라우트의 UI를 정의한다.10  
* **app/layout.tsx**: 모든 페이지에 공통으로 적용되는 최상위 레이아웃이다. 기존 Pages Router의 \_app.js와 \_document.js의 역할을 통합하며, 반드시 \<html\>과 \<body\> 태그를 포함해야 한다.12  
* **app/page.tsx**: 웹사이트의 루트 URL(/)에 해당하는 진입점 페이지다.  
* **설정 파일**:  
  * next.config.mjs: Next.js의 동작을 상세하게 설정하는 파일이다.  
  * tailwind.config.ts: Tailwind CSS의 테마(색상, 폰트 등)를 확장하고 커스터마이징하는 설정 파일이다.6  
  * postcss.config.mjs: Tailwind CSS가 내부적으로 사용하는 PostCSS의 플러그인을 설정한다.8  
  * tsconfig.json: 타입스크립트 컴파일러 옵션을 정의한다.6

### **Tailwind CSS 설정**

src/app/globals.css 파일은 전역 스타일을 정의하는 곳이다. 이 파일에는 Tailwind CSS의 기본 스타일, 컴포넌트 스타일, 유틸리티 스타일을 주입하는 필수 지시문이 포함되어야 한다.8

CSS

@import "tailwindcss";

tailwind.config.ts 파일을 수정하여 프로젝트만의 디자인 시스템을 구축할 수 있다. 예를 들어, theme.extend 객체 내에 커스텀 색상 팔레트나 폰트 패밀리를 추가하여 일관된 UI를 쉽게 구현할 수 있다.6

### **TypeScript 통합 심층 분석**

Next.js는 타입스크립트를 내장 지원하며, 개발 과정에서 라우트 경로와 같은 부분에 대한 타입 정의(.next/types/\*\*/\*.ts)를 자동으로 생성한다. 이는 next/link 컴포넌트 사용 시 경로 오류를 컴파일 시점에 잡아내는 등 강력한 타입 안전성을 제공한다.9

더 나아가, next.config.mjs 파일에 typedRoutes: true 옵션을 활성화하면 링크 타입 안전성이 더욱 강화되어, 존재하지 않는 페이지로의 링크를 시도할 경우 타입 에러를 발생시킨다. 이는 사이트 규모가 커질수록 발생하기 쉬운 깨진 링크(broken link) 문제를 사전에 방지하는 데 매우 유용하다.9

## **2장: 디지털 쇼케이스 제작: 포트폴리오 페이지 만들기**

### **정적 라우트 생성**

포트폴리오의 핵심 페이지들, 예를 들어 '소개(About)', '프로젝트(Projects)', '연락처(Contact)' 페이지를 만드는 것은 간단하다. app 디렉토리 내에 각 페이지에 해당하는 이름으로 폴더를 생성하고, 그 안에 page.tsx 파일을 추가하면 된다. 예를 들어, app/about/page.tsx 파일은 /about 경로에 해당하는 페이지가 된다.10

### **컴포넌트 기반 아키텍처**

효율적이고 유지보수가 용이한 UI를 구축하기 위해 UI를 재사용 가능한 컴포넌트로 분리하는 것이 중요하다. 헤더, 푸터, 프로젝트 카드, 버튼 등 공통 요소를 src/components 디렉토리 내에 별도의 컴포넌트 파일로 생성한다. 각 컴포넌트는 타입스크립트를 사용하여 props의 타입을 명시하고, Tailwind CSS 유틸리티 클래스를 이용해 스타일을 적용한다.6

### **레이아웃 전략**

* **루트 레이아웃**: app/layout.tsx 파일은 모든 페이지에서 공유되는 내비게이션 바, 푸터와 같은 공통 UI를 배치하기에 가장 적합한 장소다. 이 레이아웃은 페이지 이동 시에도 상태를 유지하며 지속적으로 렌더링된다.  
* **중첩 레이아웃**: 특정 섹션에만 적용되는 레이아웃을 만들 때는 중첩 레이아웃을 활용한다. 예를 들어, (portfolio)와 같은 라우트 그룹 폴더를 만들고 그 안에 layout.tsx를 배치하면, 포트폴리오 관련 모든 페이지(projects, projects/detail 등)에만 특정 사이드바나 헤더를 공유하면서 블로그 섹션에는 영향을 주지 않을 수 있다.10

### **프로젝트 데이터 관리**

* **정적 데이터**: 초기 포트폴리오의 경우, 프로젝트 정보를 로컬 파일(예: src/data/projects.ts)에 저장하는 것이 효율적이다. 타입스크립트 인터페이스를 정의하여 데이터 구조의 일관성과 타입 안전성을 확보한다.  
* **이미지 최적화**: next/image 컴포넌트의 사용은 필수적이다. 이 컴포넌트는 이미지 리사이징, WebP와 같은 최신 포맷으로의 자동 변환, 지연 로딩(lazy loading)을 자동으로 처리한다. 이는 페이지 로딩 성능을 극적으로 향상시키고, 이미지가 로드되면서 레이아웃이 밀리는 현상(CLS, Cumulative Layout Shift)을 방지하는 데 결정적인 역할을 한다.2

App Router의 파일 시스템 기반 라우팅과 컴포넌트, 스타일, 테스트 파일 등을 같은 폴더 내에 배치할 수 있는 'colocation' 기능은 프로젝트 구조를 본질적으로 더 체계적이고 직관적으로 만든다.10 특정 라우트에 관련된 모든 파일들이 하나의 폴더에 모여 있어 코드의 맥락을 파악하기 쉽고, 이는 프로젝트가 성장함에 따라 그 가치가 더욱 빛을 발한다.

## **3장: 콘텐츠 엔진: 마크다운 기반 블로그 통합하기**

### **'Git 기반 CMS' 철학**

블로그 콘텐츠를 관리하는 방식으로 로컬 마크다운 파일을 사용하는 것은 개발자에게 매우 효율적인 접근법이다. 이는 별도의 비용 없이 버전 관리가 가능하며, 개발자가 이미 익숙한 Git 워크플로우에 완벽하게 통합된다.11

### **콘텐츠 파이프라인 설정**

1. **콘텐츠 저장소 생성**: 프로젝트 루트에 posts 또는 content와 같은 이름의 디렉토리를 만들어 .md 확장자를 가진 마크다운 파일들을 저장한다.11  
2. **필수 라이브러리 설치**: 마크다운 파일을 처리하기 위해 다음 라이브러리들을 설치한다.  
   * gray-matter: 마크다운 파일 상단의 메타데이터(frontmatter)를 파싱한다.14  
   * remark 및 remark-html: 마크다운 본문을 HTML로 변환한다.16  
3. **프론트매터 정의**: 각 마크다운 파일 상단에 YAML 형식의 프론트매터를 정의하여 게시물의 메타데이터를 관리한다. 예를 들어 title, date, excerpt, coverImage, tags 등의 필드를 포함할 수 있다.11

---

## **title: 'My First Blog Post' date: '2024-01-01' excerpt: 'This is a short summary of my first post.' coverImage: '/images/posts/first-post.jpg'**

## **Welcome**

This is the main content of the blog post...

### **데이터 페칭 유틸리티 생성**

파일 시스템 접근 로직을 한 곳에서 관리하기 위해 src/lib/posts.ts와 같은 유틸리티 파일을 생성한다. 이는 UI 컴포넌트와 데이터 소스를 분리하는 중요한 아키텍처 패턴이다.14

* **getSortedPostsData()**: posts 디렉토리의 모든 마크다운 파일을 읽어 gray-matter로 메타데이터를 파싱한 후, 날짜순으로 정렬된 게시물 객체 배열을 반환하는 함수다. 이 함수는 블로그 메인 페이지를 렌더링하는 데 사용된다.14  
* **getPostData(slug)**: 게시물의 slug(파일 이름)를 인자로 받아 특정 마크다운 파일을 읽고, 프론트매터와 본문을 파싱한다. 이후 remark를 사용해 마크다운 본문을 HTML 문자열로 변환하여 반환하는 비동기 함수다.17

이러한 데이터 로직의 분리는 애플리케이션의 미래 확장성을 보장한다. 예를 들어, 나중에 콘텐츠 관리 시스템(CMS)으로 마이그레이션하기로 결정한다면, 페이지 컴포넌트 코드는 전혀 수정할 필요 없이 이 유틸리티 파일 내부의 함수 구현만 API 호출 방식으로 변경하면 된다. 이는 유연하고 확장 가능한 아키텍처의 핵심이다.

### **마크다운 콘텐츠 스타일링**

마크다운에서 변환된 순수 HTML에 스타일을 적용하는 것은 번거로운 작업이 될 수 있다. @tailwindcss/typography 플러그인은 이 문제를 우아하게 해결한다. 이 플러그인을 설치하고 설정하면, prose 클래스를 적용하는 것만으로도 제목, 문단, 목록, 인용구 등 HTML 요소에 아름다운 타이포그래피 기본값을 적용할 수 있어 개발 시간을 크게 단축시킨다.18

더 나아가, 마크다운의 상위 집합인 MDX를 도입하면 콘텐츠 내에 직접 React 컴포넌트를 삽입할 수 있다.18 이는 블로그 게시물에 인터랙티브한 차트나 코드 에디터 등을 추가하고자 할 때 강력한 확장 경로를 제공한다.

## **4장: App Router를 활용한 고급 라우팅 및 데이터 페칭**

### **블로그 인덱스 페이지 구축**

app/blog/page.tsx 파일을 생성하여 블로그의 메인 페이지를 만든다. 이 페이지 컴포넌트는 앞서 만든 getSortedPostsData() 유틸리티 함수를 호출하여 모든 게시물의 메타데이터를 가져온다. 그리고 가져온 데이터를 기반으로 각 게시물의 제목, 발췌, 날짜 등을 포함하는 게시물 미리보기 목록을 렌더링하며, 각 항목은 개별 게시물 페이지로 연결되는 링크를 가진다.

### **게시물을 위한 동적 라우트 생성**

개별 블로그 게시물 페이지를 위해 동적 라우트를 설정해야 한다. app/blog/\[slug\]/page.tsx와 같이 폴더 이름을 대괄호로 감싸 동적 세그먼트(Dynamic Segment)를 생성한다. 이렇게 하면 /blog/my-first-post, /blog/another-post와 같은 모든 URL 패턴에 대응하는 단일 페이지 컴포넌트를 만들 수 있다.19 이 페이지 컴포넌트는

params prop을 통해 URL의 동적 부분(예: { slug: 'my-first-post' })에 접근할 수 있다.19

### **성능 극대화를 위한 generateStaticParams 활용**

이 장의 가장 핵심적인 부분은 generateStaticParams 함수의 이해와 활용이다. 이 함수가 없으면 동적 라우트는 기본적으로 사용자가 요청할 때마다 서버에서 렌더링된다(SSR).20 이는 성능상 최적의 상태가 아니다.

app/blog/\[slug\]/page.tsx 파일 내에 generateStaticParams 함수를 구현하면, Next.js는 빌드 시점에 이 함수를 실행한다. 이 함수는 모든 게시물의 slug 값들을 배열 형태로 반환해야 한다 (예: \[{ slug: 'post-1' }, { slug: 'post-2' }\]).19

Next.js는 이 배열을 받아, 배열의 각 slug에 대해 개별 게시물 페이지를 미리 렌더링하여 정적인 HTML 파일로 생성한다. 이것이 바로 정적 사이트 생성(SSG)의 마법이다. 결과적으로 사용자가 블로그 게시물에 방문하면, 서버의 연산 과정 없이 즉시 제공되는 정적 페이지를 받게 되어 최고의 성능을 경험할 수 있다.21

generateStaticParams는 동적인 URL 구조와 정적 생성의 성능 이점을 연결하는 핵심적인 다리 역할을 한다.

### **전체 프로세스 통합**

app/blog/\[slug\]/page.tsx 컴포넌트의 동작 흐름은 다음과 같다.

1. generateStaticParams 함수가 빌드 시점에 모든 가능한 slug 목록을 Next.js에 제공한다.  
2. Next.js는 각 slug에 대해 페이지 컴포넌트를 실행하여 HTML 파일을 미리 생성한다.  
3. 사용자가 특정 게시물 URL로 접근하면, 미리 생성된 HTML이 즉시 제공된다.  
4. 페이지 컴포넌트 내부에서는 params.slug 값을 사용하여 await getPostData(params.slug)를 호출하고, 해당 게시물의 전체 콘텐츠와 메타데이터를 가져온다.  
5. 가져온 데이터를 사용하여 제목, 날짜를 렌더링하고, remark를 통해 변환된 HTML 콘텐츠는 @tailwindcss/typography 플러그인이 적용된 요소 내에서 dangerouslySetInnerHTML 속성을 통해 렌더링한다.

추가적으로, export const dynamicParams \= false 옵션을 페이지 파일에 추가하면 generateStaticParams에서 제공되지 않은 slug로의 접근을 차단하고 404 페이지를 반환하도록 설정할 수 있다.12 이는 유효한 게시물만 접근 가능하도록 보장하는 중요한 안전장치다.

## **5장: 사용자 경험 향상: 스타일링, 다크 모드, 애니메이션**

### **5.1 끊김 없는 다크 모드 구현**

현대적인 웹사이트에서 다크 모드는 중요한 사용자 경험 요소다. 이를 구현하기 위해 커뮤니티 표준 라이브러리인 next-themes를 사용하는 것이 권장된다. 이 라이브러리는 서버 사이드 렌더링 환경에서 발생할 수 있는 깜빡임(flickering) 현상을 방지하고, 사용자의 시스템 설정을 존중하는 기능을 손쉽게 구현할 수 있도록 돕는다.23

**설정 단계:**

1. **라이브러리 설치**: npm install next-themes 명령어로 next-themes를 설치한다.26  
2. **Tailwind CSS 설정**: tailwind.config.ts 파일에서 darkMode 전략을 'class'로 설정한다. 이렇게 하면 html 태그에 dark 클래스가 추가될 때 다크 모드 스타일이 활성화된다.27  
3. **ThemeProvider 설정**: next-themes에서 제공하는 ThemeProvider를 감싸는 클라이언트 컴포넌트(예: providers.tsx)를 생성한다. 이 컴포넌트는 루트 레이아웃(app/layout.tsx)의 children을 감싸도록 배치하며, attribute="class", defaultTheme="system"과 같은 속성을 전달한다.23  
4. **테마 전환 컴포넌트 제작**: useTheme 훅을 사용하는 테마 전환 스위치 컴포넌트(예: ThemeSwitcher.tsx)를 만든다. 이 컴포넌트는 사용자가 'light', 'dark', 'system' 모드를 선택할 수 있는 UI를 제공한다.23

이 과정에서 서버 컴포넌트와 클라이언트 컴포넌트의 경계가 명확해진다. 페이지의 주요 콘텐츠는 성능과 SEO를 위해 서버 컴포넌트로 유지되지만, 사용자와의 상호작용이 필요한 테마 스위치와 같은 요소는 반드시 "use client" 지시문을 사용하여 클라이언트 컴포넌트로 만들어야 한다.

### **5.2 Framer Motion으로 생동감 부여하기**

framer-motion은 React 환경에서 선언적으로 유려한 애니메이션을 구현할 수 있게 해주는 강력한 라이브러리다.29

#### **페이지 전환 애니메이션 구현**

App Router에서 페이지 전환 애니메이션을 구현하는 것은 다소 섬세한 접근이 필요하다. 기본적으로 layout.tsx는 페이지 이동 시에도 상태를 유지하며 다시 마운트되지 않기 때문에, 단순한 애니메이션 래퍼는 재실행되지 않는다.31

이 문제에 대한 효과적인 해결책은 template.tsx 파일을 사용하는 것이다. template.tsx는 레이아웃과 유사하지만, 네비게이션이 발생할 때마다 자식 컴포넌트의 새로운 인스턴스를 생성한다. 따라서 template.tsx 파일 내에서 페이지 콘텐츠를 motion.div로 감싸면, 페이지가 변경될 때마다 진입(enter) 애니메이션을 트리거할 수 있다.31

TypeScript

// app/template.tsx  
'use client';

import { motion } from 'framer-motion';

export default function Template({ children }: { children: React.ReactNode }) {  
  return (  
    \<motion.div  
      initial={{ y: 20, opacity: 0 }}  
      animate={{ y: 0, opacity: 1 }}  
      transition={{ ease: 'easeInOut', duration: 0.75 }}  
    \>  
      {children}  
    \</motion.div\>  
  );  
}

#### **스크롤 트리거 애니메이션 구현**

스크롤에 반응하는 애니메이션은 사용자에게 동적인 경험을 제공하고 콘텐츠에 집중하게 만든다. Framer Motion은 두 가지 주요 스크롤 애니메이션 유형을 지원한다.32

* **스크롤 연동 애니메이션**: 스크롤 진행률에 따라 애니메이션이 직접적으로 제어된다 (useScroll 훅 사용).  
* **스크롤 트리거 애니메이션**: 요소가 뷰포트에 들어오거나 나갈 때 애니메이션이 한 번 실행된다 (whileInView prop 사용).

포트폴리오나 블로그에서는 스크롤 트리거 애니메이션이 특히 유용하다. 재사용 가능한 "스크롤 시 페이드인" 효과를 가진 래퍼 컴포넌트를 만들 수 있다. 이 클라이언트 컴포넌트는 motion.div의 initial, whileInView, viewport prop을 사용하여 자식 요소들이 화면에 나타날 때 부드럽게 등장하도록 만든다.30 이러한 애니메이션은 단순한 장식을 넘어, 페이지가 더 가볍고 빠르게 느껴지게 하는 '인지 성능'을 향상시키는 역할을 한다.

## **6장: 로컬 환경에서 라이브 서비스까지: Vercel을 이용한 배포 및 지속적 통합**

### **왜 Vercel인가?**

Next.js의 개발사인 Vercel이 제공하는 호스팅 플랫폼은 Next.js 애플리케이션을 배포하는 가장 쉽고 효율적인 방법이다. Vercel은 별도의 설정이 필요 없는 제로-구성(zero-configuration) 배포, Next.js 기능에 대한 자동 최적화, 글로벌 CDN, 그리고 충분한 무료 등급을 제공한다.33

### **Git 기반 워크플로우**

1. **코드 준비**: 프로젝트가 Git으로 초기화되어 있고, GitHub와 같은 원격 저장소에 푸시되었는지 확인한다.34  
2. **Vercel에 연결**: GitHub 계정으로 Vercel에 가입하고, 대시보드에서 'New Project'를 클릭하여 배포할 프로젝트 저장소를 가져온다.33  
3. **첫 배포**: Vercel은 저장소를 분석하여 자동으로 Next.js 프로젝트임을 감지하고, 최적의 빌드 명령어(next build)와 설정을 적용하여 배포를 시작한다. 이 과정은 보통 1분 이내에 완료된다.33

### **지속적인 배포 (Continuous Deployment)**

Vercel의 핵심적인 장점은 CI/CD 파이프라인이 기본적으로 제공된다는 점이다. main 브랜치에 git push를 할 때마다 새로운 프로덕션 빌드와 배포가 자동으로 트리거된다. 다른 브랜치에 푸시하면, 해당 변경사항을 미리 확인할 수 있는 고유한 '프리뷰 배포' URL이 생성된다. 이는 변경사항이 실제 서비스에 반영되기 전에 안전하게 테스트할 수 있는 매우 강력한 기능이다.33

이러한 현대적인 DevOps 경험은 프론트엔드 개발자가 서버 구성, 빌드 파이프라인 관리와 같은 복잡한 인프라 작업에서 벗어나 오직 코드 작성과 콘텐츠 제작에만 집중할 수 있게 해준다. 배포는 git push 한 줄로 요약되며, 이는 개발 생산성을 극적으로 향상시킨다.

### **환경 변수 관리**

API 키나 데이터베이스 연결 정보와 같은 민감한 정보는 코드에 직접 포함해서는 안 된다. Vercel 프로젝트 대시보드의 'Settings' \> 'Environment Variables' 메뉴를 통해 이러한 환경 변수들을 안전하게 추가하고 관리할 수 있다. 이렇게 추가된 변수들은 빌드 및 런타임 환경에 안전하게 주입된다.34

### **커스텀 도메인 연결**

Vercel은 배포된 프로젝트에 커스텀 도메인을 연결하는 간단한 절차를 제공한다. 프로젝트 대시보드의 'Domains' 섹션에서 보유한 도메인을 추가하고, 안내에 따라 DNS 레코드를 업데이트하면 된다.34

## **결론: 빌드를 넘어서: Next.js 웹사이트 유지보수 및 확장**

이 가이드를 통해 구축된 포트폴리오 및 블로그 웹사이트는 단순한 결과물이 아니라, 전문적인 수준의 아키텍처를 갖춘 강력하고 성능이 뛰어난 플랫폼이다. 이는 앞으로의 성장을 위한 견고한 기반이 된다.

### **미래를 위한 확장성**

* **마크다운에서 헤드리스 CMS로**: 현재의 Git 기반 콘텐츠 관리 방식은 개발자에게 매우 효율적이지만, 비기술적인 사용자가 콘텐츠를 쉽게 관리할 수 있는 전용 UI, 예약 발행, 실시간 콘텐츠 미리보기 등의 기능이 필요해지면 헤드리스 CMS로의 전환을 고려할 수 있다.35 Sanity나 Contentful과 같은 헤드리스 CMS는 API를 통해 콘텐츠를 제공한다.36 3장에서 데이터 페칭 로직을 분리해두었기 때문에, 이 마이그레이션은 페이지 컴포넌트를 건드리지 않고  
  lib/posts.ts의 함수 내부만 수정하는 것으로 비교적 간단하게 수행할 수 있다.  
* **점진적 정적 재생성 (ISR)**: 블로그 게시물이 수천 개에 달해 전체 사이트를 빌드하는 데 시간이 오래 걸리는 상황이 온다면, Next.js의 강력한 기능인 ISR(Incremental Static Regeneration)을 활용할 수 있다. ISR은 정적 페이지를 특정 주기로 또는 필요에 따라 온디맨드로 다시 생성하여, 정적 사이트의 빠른 속도와 동적 콘텐츠의 최신성을 결합하는 하이브리드 접근법을 제공한다.3

이 가이드에서 다룬 기술과 아키텍처 패턴들은 개인 웹사이트를 넘어 훨씬 더 크고 복잡한 풀스택 애플리케이션을 Next.js로 구축하는 데 직접적으로 적용될 수 있는 핵심적인 지식이다. 완성된 웹사이트는 끝이 아니라, 개발자로서의 역량을 지속적으로 보여주고 성장시켜 나갈 수 있는 새로운 시작점이다.

#### **참고 자료**

1. Next.js SEO: Best Practices for Improving Your Website Rankings on Google \- AskGalore, 9월 12, 2025에 액세스, [https://askgalore.com/blog/next-js-seo](https://askgalore.com/blog/next-js-seo)  
2. Next.js vs React: Which is Better for SEO & Performance? \- myDevIT Solutions, 9월 12, 2025에 액세스, [https://www.mydevitsolutions.com/next-js-vs-react-which-framework-wins-in-seo-and-performance/](https://www.mydevitsolutions.com/next-js-vs-react-which-framework-wins-in-seo-and-performance/)  
3. Why Next.js Is the Best Framework for SEO in 2025 \- DesignToCodes, 9월 12, 2025에 액세스, [https://designtocodes.com/blog/why-next-js-is-the-best-framework-for-seo-in-2025/](https://designtocodes.com/blog/why-next-js-is-the-best-framework-for-seo-in-2025/)  
4. Nextjs Advantages and Disadvantages \- Aalpha Information Systems, 9월 12, 2025에 액세스, [https://www.aalpha.net/articles/nextjs-advantages-and-disadvantages/](https://www.aalpha.net/articles/nextjs-advantages-and-disadvantages/)  
5. Top 10 Tips for SEO Optimization on Next.js Websites & Blogs \- Prismic, 9월 12, 2025에 액세스, [https://prismic.io/blog/nextjs-seo-optimization-tips](https://prismic.io/blog/nextjs-seo-optimization-tips)  
6. How to Set Up a Next.js Project with TypeScript and Tailwind CSS \- DEV Community, 9월 12, 2025에 액세스, [https://dev.to/rhythmsaha/how-to-set-up-a-nextjs-project-with-typescript-and-tailwind-css-2hk7](https://dev.to/rhythmsaha/how-to-set-up-a-nextjs-project-with-typescript-and-tailwind-css-2hk7)  
7. Is Nextjs really Better than Wordpress in SEO? \- Reddit, 9월 12, 2025에 액세스, [https://www.reddit.com/r/nextjs/comments/1magwlw/is\_nextjs\_really\_better\_than\_wordpress\_in\_seo/](https://www.reddit.com/r/nextjs/comments/1magwlw/is_nextjs_really_better_than_wordpress_in_seo/)  
8. Install Tailwind CSS with Next.js, 9월 12, 2025에 액세스, [https://tailwindcss.com/docs/guides/nextjs](https://tailwindcss.com/docs/guides/nextjs)  
9. Configuration: TypeScript \- Next.js, 9월 12, 2025에 액세스, [https://nextjs.org/docs/pages/api-reference/config/typescript](https://nextjs.org/docs/pages/api-reference/config/typescript)  
10. Getting Started: Project Structure | Next.js, 9월 12, 2025에 액세스, [https://nextjs.org/docs/app/getting-started/project-structure](https://nextjs.org/docs/app/getting-started/project-structure)  
11. Building a Markdown-driven blog using Next.js 13 and App Router \- Singlehanded, 9월 12, 2025에 액세스, [https://www.singlehanded.dev/blog/building-markdown-blog-with-nextjs-app-router](https://www.singlehanded.dev/blog/building-markdown-blog-with-nextjs-app-router)  
12. Migrating: App Router \- Next.js, 9월 12, 2025에 액세스, [https://nextjs.org/docs/app/guides/migrating/app-router-migration](https://nextjs.org/docs/app/guides/migrating/app-router-migration)  
13. Getting Started: CSS | Next.js, 9월 12, 2025에 액세스, [https://nextjs.org/docs/app/getting-started/css](https://nextjs.org/docs/app/getting-started/css)  
14. Pages Router: Creating a simple blog architecture | Next.js, 9월 12, 2025에 액세스, [https://nextjs.org/learn/pages-router/data-fetching-blog-data](https://nextjs.org/learn/pages-router/data-fetching-blog-data)  
15. Setting up a NextJS Markdown Blog with Typescript \- Bionic Julia, 9월 12, 2025에 액세스, [https://bionicjulia.com/blog/setting-up-nextjs-markdown-blog-with-typescript](https://bionicjulia.com/blog/setting-up-nextjs-markdown-blog-with-typescript)  
16. Setting up a blog using MD files in Next JS | by Harsh Singh \- Medium, 9월 12, 2025에 액세스, [https://medium.com/@harshsinghatz/setting-up-a-blog-using-md-files-in-next-js-e2092df2931a](https://medium.com/@harshsinghatz/setting-up-a-blog-using-md-files-in-next-js-e2092df2931a)  
17. Render Markdown \- Pages Router \- Next.js, 9월 12, 2025에 액세스, [https://nextjs.org/learn/pages-router/dynamic-routes-render-markdown](https://nextjs.org/learn/pages-router/dynamic-routes-render-markdown)  
18. Guides: MDX \- Next.js, 9월 12, 2025에 액세스, [https://nextjs.org/docs/app/guides/mdx](https://nextjs.org/docs/app/guides/mdx)  
19. File-system conventions: Dynamic Segments | Next.js, 9월 12, 2025에 액세스, [https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes)  
20. Getting Started: Linking and Navigating \- Next.js, 9월 12, 2025에 액세스, [https://nextjs.org/docs/app/getting-started/linking-and-navigating](https://nextjs.org/docs/app/getting-started/linking-and-navigating)  
21. Functions: generateStaticParams \- Next.js, 9월 12, 2025에 액세스, [https://nextjs.org/docs/app/api-reference/functions/generate-static-params](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)  
22. Next.js 15 Tutorial \- 56 \- generateStaticParams \- YouTube, 9월 12, 2025에 액세스, [https://www.youtube.com/watch?v=09aGB\_Q6cqE](https://www.youtube.com/watch?v=09aGB_Q6cqE)  
23. pacocoursey/next-themes: Perfect Next.js dark mode in 2 lines of code. Support System preference and any other theme with no flashing \- GitHub, 9월 12, 2025에 액세스, [https://github.com/pacocoursey/next-themes](https://github.com/pacocoursey/next-themes)  
24. Dark Mode (TailwindCSS) : r/nextjs \- Reddit, 9월 12, 2025에 액세스, [https://www.reddit.com/r/nextjs/comments/1hzsry9/dark\_mode\_tailwindcss/](https://www.reddit.com/r/nextjs/comments/1hzsry9/dark_mode_tailwindcss/)  
25. Master the 2025 Stack: Complete Guide to Next.js 15, React 19, Tailwind v4 & Shadcn/ui : r/nextjs \- Reddit, 9월 12, 2025에 액세스, [https://www.reddit.com/r/nextjs/comments/1jt9i3m/master\_the\_2025\_stack\_complete\_guide\_to\_nextjs\_15/](https://www.reddit.com/r/nextjs/comments/1jt9i3m/master_the_2025_stack_complete_guide_to_nextjs_15/)  
26. Tailwind 'dark:' not working with Next 15, next-themes, and Tailwind 4 \- Stack Overflow, 9월 12, 2025에 액세스, [https://stackoverflow.com/questions/79308431/tailwind-dark-not-working-with-next-15-next-themes-and-tailwind-4](https://stackoverflow.com/questions/79308431/tailwind-dark-not-working-with-next-15-next-themes-and-tailwind-4)  
27. Integrate and Customize Tailwind CSS Dark Mode in a Next.js Project \- Prismic, 9월 12, 2025에 액세스, [https://prismic.io/blog/tailwind-css-darkmode-tutorial](https://prismic.io/blog/tailwind-css-darkmode-tutorial)  
28. Trouble Implementing Dark Mode in Next.js Project Using App Directory \- Stack Overflow, 9월 12, 2025에 액세스, [https://stackoverflow.com/questions/77924365/trouble-implementing-dark-mode-in-next-js-project-using-app-directory](https://stackoverflow.com/questions/77924365/trouble-implementing-dark-mode-in-next-js-project-using-app-directory)  
29. Next.js: Page Transitions with Framer Motion \- Max Schmitt, 9월 12, 2025에 액세스, [https://maxschmitt.me/posts/nextjs-page-transitions-framer-motion](https://maxschmitt.me/posts/nextjs-page-transitions-framer-motion)  
30. How to Use Framer Motion for Animations in Next.js \- StaticMania, 9월 12, 2025에 액세스, [https://staticmania.com/blog/how-to-use-framer-motion-for-animations-in-next-js](https://staticmania.com/blog/how-to-use-framer-motion-for-animations-in-next-js)  
31. Nextjs Page Transition With Framer-Motion \- DEV Community, 9월 12, 2025에 액세스, [https://dev.to/joseph42a/nextjs-page-transition-with-framer-motion-33dg](https://dev.to/joseph42a/nextjs-page-transition-with-framer-motion-33dg)  
32. Create Beautiful Scroll Animations Using Framer Motion \- DEV Community, 9월 12, 2025에 액세스, [https://dev.to/shivamkatare/create-beautiful-scroll-animations-using-framer-motion-1a7b](https://dev.to/shivamkatare/create-beautiful-scroll-animations-using-framer-motion-1a7b)  
33. Pages Router: Deploy to Vercel \- Next.js, 9월 12, 2025에 액세스, [https://nextjs.org/learn/pages-router/deploying-nextjs-app-deploy](https://nextjs.org/learn/pages-router/deploying-nextjs-app-deploy)  
34. Deploying Next.js Applications on Vercel: A Step-by-Step Guide | by Nitin Rachabathuni, 9월 12, 2025에 액세스, [https://nitin-rachabathuni.medium.com/deploying-next-js-applications-on-vercel-a-step-by-step-guide-66bbb2c43fb8](https://nitin-rachabathuni.medium.com/deploying-next-js-applications-on-vercel-a-step-by-step-guide-66bbb2c43fb8)  
35. Guides: Preview Mode \- Next.js, 9월 12, 2025에 액세스, [https://nextjs.org/docs/pages/guides/preview-mode](https://nextjs.org/docs/pages/guides/preview-mode)  
36. Integrating Next.js 15 with Headless CMS (Contentful, Sanity, Strapi): The Ultimate Guide | by Suresh Kumar Ariya Gowder | Jul, 2025 | Medium, 9월 12, 2025에 액세스, [https://medium.com/@sureshdotariya/integrating-next-js-15-with-headless-cms-contentful-sanity-strapi-the-ultimate-guide-3722079b5011](https://medium.com/@sureshdotariya/integrating-next-js-15-with-headless-cms-contentful-sanity-strapi-the-ultimate-guide-3722079b5011)  
37. The Best Headless CMS for Next.JS Apps \- Sanity, 9월 12, 2025에 액세스, [https://www.sanity.io/nextjs-cms](https://www.sanity.io/nextjs-cms)