# Strapi Integration Guide

This project is prepared to work with Strapi CMS as a headless backend.

## Architecture

\`\`\`
Next.js App (Frontend)
    ↓ API Calls
Strapi CMS (Backend)
    ↓ Database
Supabase PostgreSQL
    ↓ File Storage
Cloudflare R2
\`\`\`

## Setup Instructions

### 1. Install Strapi (Separate Server)

\`\`\`bash
npx create-strapi-app@latest my-strapi-backend
cd my-strapi-backend
\`\`\`

### 2. Configure Strapi Database (Supabase)

Edit `config/database.js`:

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
        rejectUnauthorized: false
      }
    },
  },
});
\`\`\`

### 3. Configure Cloudflare R2 Storage

Install the plugin:

\`\`\`bash
npm install @strapi/provider-upload-aws-s3
\`\`\`

Edit `config/plugins.js`:

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
      },
    },
  },
});
\`\`\`

### 4. Create Content Types in Strapi

#### Post Content Type
- title (Text, required)
- slug (UID, required)
- content (Rich Text, required)
- excerpt (Text)
- publishedAt (DateTime)
- author (Relation: Many-to-One with Author)
- tags (Relation: Many-to-Many with Tag)
- coverImage (Media)

Enable i18n plugin and add locales: en, ko, ja

#### Project Content Type
- title (Text, required)
- slug (UID, required)
- description (Text, required)
- content (Rich Text)
- url (Text)
- github (Text)
- image (Media)
- tags (Relation: Many-to-Many with Tag)
- featured (Boolean)
- order (Number)

Enable i18n for this content type as well.

#### Tag Content Type
- name (Text, required)
- slug (UID, required)

#### Author Content Type
- name (Text, required)
- bio (Text)
- avatar (Media)

### 5. Configure API Permissions

In Strapi admin panel:
1. Go to Settings → Users & Permissions → Roles → Public
2. Enable find and findOne for: posts, projects, tags, authors
3. Generate an API token in Settings → API Tokens

### 6. Environment Variables

Add to your Next.js `.env.local`:

\`\`\`env
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337/api
STRAPI_API_TOKEN=your-strapi-api-token
\`\`\`

## Multi-language Support

The app supports three languages:
- English (en)
- Korean (ko) - Default
- Japanese (ja)

Content in Strapi should be created with i18n enabled for all three locales.

## API Usage Examples

### Fetch Posts
\`\`\`typescript
import { getPosts } from '@/lib/strapi/api'

const posts = await getPosts('ko', 1, 10)
\`\`\`

### Fetch Single Post
\`\`\`typescript
import { getPostBySlug } from '@/lib/strapi/api'

const post = await getPostBySlug('my-post-slug', 'ko')
\`\`\`

### Fetch Projects
\`\`\`typescript
import { getProjects, getFeaturedProjects } from '@/lib/strapi/api'

const allProjects = await getProjects('ko')
const featured = await getFeaturedProjects('ko')
\`\`\`

## Development Workflow

1. Start Strapi backend: `npm run develop` (in Strapi directory)
2. Start Next.js frontend: `npm run dev` (in this directory)
3. Create content in Strapi admin panel (http://localhost:1337/admin)
4. Content will be automatically available in Next.js app

## Production Deployment

1. Deploy Strapi to a hosting service (Railway, Render, DigitalOcean, etc.)
2. Update `NEXT_PUBLIC_STRAPI_API_URL` to production Strapi URL
3. Ensure Supabase and Cloudflare R2 are properly configured
4. Deploy Next.js app to Vercel
