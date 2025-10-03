# Strapi CMS 설정 가이드

이 프로젝트는 Strapi CMS를 Supabase(PostgreSQL)와 Cloudflare R2(스토리지)와 함께 사용합니다.

## 필요한 환경 변수

### Next.js 프로젝트 (.env.local)

\`\`\`env
# Strapi API
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337
STRAPI_API_TOKEN=your_strapi_api_token_here

# Supabase (Strapi가 사용)
SUPABASE_DATABASE_URL=postgresql://user:password@host:5432/database
SUPABASE_HOST=your-project.supabase.co
SUPABASE_PORT=5432
SUPABASE_DATABASE=postgres
SUPABASE_USER=postgres
SUPABASE_PASSWORD=your_password

# Cloudflare R2 (Strapi가 사용)
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_BUCKET_NAME=your_bucket_name
\`\`\`

## Strapi 프로젝트 설정

### 1. Strapi 프로젝트 생성

\`\`\`bash
npx create-strapi-app@latest strapi-backend --quickstart
cd strapi-backend
\`\`\`

### 2. Supabase 데이터베이스 연결

`config/database.js` 파일을 수정:

\`\`\`javascript
module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('SUPABASE_HOST'),
      port: env.int('SUPABASE_PORT', 5432),
      database: env('SUPABASE_DATABASE'),
      user: env('SUPABASE_USER'),
      password: env('SUPABASE_PASSWORD'),
      ssl: {
        rejectUnauthorized: false,
      },
    },
    pool: {
      min: 2,
      max: 10,
    },
  },
});
\`\`\`

### 3. Cloudflare R2 스토리지 설정

필요한 패키지 설치:

\`\`\`bash
npm install @strapi/provider-upload-aws-s3
\`\`\`

`config/plugins.js` 파일 생성:

\`\`\`javascript
module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        accessKeyId: env('R2_ACCESS_KEY_ID'),
        secretAccessKey: env('R2_SECRET_ACCESS_KEY'),
        endpoint: env('R2_ENDPOINT'),
        params: {
          Bucket: env('R2_BUCKET_NAME'),
        },
        region: 'auto',
        s3ForcePathStyle: true,
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
});
\`\`\`

### 4. Content Types 생성

Strapi 관리자 패널에서 다음 Content Types를 생성하세요:

#### Post (Collection Type)
- title (Text, required)
- slug (UID, required, based on title)
- content (Rich Text, required)
- excerpt (Text)
- coverImage (Media, single)
- author (Relation to User)
- publishedAt (DateTime)
- tags (Relation to Tag, many-to-many)
- views (Number, default: 0)

#### Comment (Collection Type)
- content (Text, required)
- author (Relation to User)
- post (Relation to Post)
- createdAt (DateTime)

#### Tag (Collection Type)
- name (Text, required)
- slug (UID, required)
- posts (Relation to Post, many-to-many)

### 5. API 토큰 생성

1. Strapi 관리자 패널 로그인
2. Settings → API Tokens → Create new API Token
3. 생성된 토큰을 `STRAPI_API_TOKEN` 환경 변수에 추가

### 6. 권한 설정

Settings → Users & Permissions Plugin → Roles → Public에서:
- Post: find, findOne 허용
- Comment: find, create 허용
- Tag: find, findOne 허용

## 개발 서버 실행

\`\`\`bash
# Strapi 백엔드
cd strapi-backend
npm run develop

# Next.js 프론트엔드
npm run dev
\`\`\`

## 프로덕션 배포

Strapi는 별도의 서버에 배포하고, Next.js는 Vercel에 배포하는 것을 권장합니다.

### Strapi 배포 옵션:
- Railway
- Render
- DigitalOcean
- AWS/GCP/Azure

배포 후 `NEXT_PUBLIC_STRAPI_API_URL`을 프로덕션 URL로 업데이트하세요.
