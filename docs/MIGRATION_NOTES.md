# Migration Notes: Supabase to Strapi

## Current Status

The blog/post pages have been updated to use Strapi API instead of direct Supabase queries.

## What's Been Migrated

### Blog Pages (Read-Only)
- `app/blog/page.tsx` - Now fetches from Strapi
- `app/post/page.tsx` - Now fetches from Strapi  
- `app/post/[slug]/page.tsx` - Now fetches from Strapi

### What's NOT Migrated Yet

The following pages still use direct Supabase and are for **content management**:
- `app/my/posts/page.tsx` - User's posts management
- `app/my/posts/new/page.tsx` - Create new post
- `app/my/posts/[slug]/edit/page.tsx` - Edit post
- `app/post/@username/[id]/page.tsx` - User-specific post page

## Architecture Decision

Since Strapi will be your CMS backend:

1. **Content Display (Public)** → Uses Strapi API
   - Blog listing
   - Post detail pages
   - Projects showcase
   
2. **Content Management (Admin)** → Two options:

   **Option A: Use Strapi Admin Panel (Recommended)**
   - Delete the `/my/posts/*` pages
   - Manage all content through Strapi admin panel
   - Simpler architecture, less code to maintain
   
   **Option B: Keep Custom Admin**
   - Update `/my/posts/*` pages to use Strapi API
   - Requires implementing Strapi authentication
   - More complex but gives custom UI

## Next Steps

1. Set up Strapi server with Supabase database
2. Create content types in Strapi (see `docs/STRAPI_INTEGRATION.md`)
3. Decide on content management approach (Option A or B above)
4. Add multi-language content in Strapi
5. Test the integration

## Environment Variables Needed

\`\`\`env
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337/api
STRAPI_API_TOKEN=your-strapi-api-token
\`\`\`

## Comments System

The comments system still uses Supabase directly. You have two options:

1. **Keep Supabase for comments** - Comments are user-generated and work well with Supabase auth
2. **Migrate to Strapi** - Would require implementing Strapi authentication for users

Recommendation: Keep comments in Supabase since they're tightly coupled with user authentication.
