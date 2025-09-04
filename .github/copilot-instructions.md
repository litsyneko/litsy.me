# Litsy.me Personal Portfolio

Litsy.me is a Next.js 15 personal portfolio website built with TypeScript, Tailwind CSS, and modern React patterns. The site showcases Litsy's development journey, projects, and contact information with a focus on user experience and responsive design.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Language Guidelines

### Korean Language Usage
- **Respond in Korean when:**
  - Working with Korean content in the codebase (the site contains substantial Korean text)
  - Responding to comments or issues written in Korean
  - User explicitly requests Korean communication
- **Preserve Korean content:**
  - Do NOT translate existing Korean text unless explicitly requested
  - Respect Korean text in components, pages, and content files
  - Korean text includes unescaped quotes which are expected and documented as non-blocking lint issues
- **Default to English for:**
  - Technical documentation and code comments
  - Git commit messages and PR descriptions
  - Error messages and debugging output

## Working Effectively

### Prerequisites and Setup
- Install Node.js 20+ and pnpm package manager:
  - `npm install -g pnpm`
  - Verify: `node --version` (should be 20+), `pnpm --version`

### Bootstrap, Build, and Test
- **Install dependencies:**
  - `pnpm install --no-frozen-lockfile` -- takes 15-25 seconds. NEVER CANCEL. Set timeout to 60+ seconds.
  - **Known Issue:** React 19 peer dependency warnings are expected and non-blocking. Application works correctly.
  
- **Build the project:**
  - `pnpm run build` -- takes 30-45 seconds. NEVER CANCEL. Set timeout to 90+ seconds.
  - Build output shows static pages generated: /, /about, /projects, /contact, /_not-found
  - **Build succeeds despite TypeScript and ESLint being ignored in next.config.mjs**

- **Development server:**
  - `pnpm run dev` -- ready in 1-2 seconds on http://localhost:3000
  - **ALWAYS test manually after starting dev server**

### Linting
- **Configure and run ESLint:**
  - `pnpm run lint` -- first run prompts for configuration (select "Strict (recommended)")
  - Takes 15-30 seconds for initial setup. NEVER CANCEL. Set timeout to 60+ seconds.
  - **Known Issues:** Several lint warnings/errors exist but are non-blocking:
    - Unescaped quotes in Korean text (react/no-unescaped-entities)
    - Unused variables and React Hooks rule violations
    - Missing dependencies in useEffect
  - **DO NOT fix lint issues unless directly related to your task**

## Validation

### Manual Testing Requirements
- **ALWAYS manually validate changes by running through complete user scenarios**
- **CRITICAL:** Simply starting and stopping the application is NOT sufficient validation
- **Required validation scenarios after making changes:**
  1. Navigate to all pages: Home (/) → About (/about) → Projects (/projects) → Contact (/contact)
  2. Test navigation menu functionality and active states
  3. Test theme toggle (light/dark mode) if modified
  4. Test responsive design on different viewport sizes
  5. Verify all images load correctly
  6. Test contact form (frontend validation, form submission UI)
  7. Test external links (GitHub, Twitter, email)

### Development Validation Steps
- **Before making changes:**
  1. `pnpm install --no-frozen-lockfile`
  2. `pnpm run build` -- ensure clean build
  3. `pnpm run dev` -- start dev server
  4. Navigate through all pages to establish baseline

- **After making changes:**
  1. Check dev server for hot reload and console errors
  2. Run complete manual validation scenarios (see above)
  3. `pnpm run build` -- ensure build still succeeds
  4. `pnpm run lint` -- check for new lint issues (ignore existing ones)

### Testing Limitations
- **No unit tests exist** -- rely entirely on manual validation
- **No E2E tests exist** -- manual user scenario testing is critical
- **Contact form backend not implemented** -- only test frontend validation

## Project Structure and Navigation

### Key Directories
```
/app/                 # Next.js 15 App Router pages
├── page.tsx         # Home page (main landing)
├── about/page.tsx   # About page (developer journey)
├── projects/page.tsx # Projects showcase
├── contact/page.tsx # Contact form and info
├── layout.tsx       # Root layout with navigation
└── globals.css      # Global styles and CSS variables

/components/         # Reusable components
├── ui/             # shadcn/ui components (Radix UI based)
└── ...             # Custom components

/lib/               # Utilities
└── utils.ts        # Tailwind class utilities

/public/            # Static assets
├── images/         # Project and profile images
└── ...            # Icons and other assets
```

### Important Files
- `package.json` -- uses pnpm, React 19, Next.js 15
- `next.config.mjs` -- ESLint/TypeScript ignored during builds
- `tsconfig.json` -- TypeScript configuration with path aliases
- `components.json` -- shadcn/ui configuration
- `tailwind.config.js` -- NOT PRESENT (uses Tailwind CSS 4.1.12 PostCSS)

## Common Tasks

### Making UI Changes
- **Components use shadcn/ui** -- check `/components/ui/` for existing components
- **Uses Tailwind CSS 4.1.12** with CSS variables for theming
- **Animations use Framer Motion** -- already imported where needed
- **Icons use Lucide React** -- import from 'lucide-react'
- **Always test dark/light mode** after UI changes

### Content Updates
- **Text content is in Korean** -- respect existing language choices
- **Profile information in `/app/about/page.tsx`**
- **Project data in `/app/projects/page.tsx`**
- **Contact info in `/app/contact/page.tsx` and navigation**

### Adding New Pages
- Create in `/app/` directory following App Router conventions
- Update navigation in `/app/layout.tsx`
- Follow existing styling patterns (Tailwind classes, component structure)
- **ALWAYS test navigation and responsive design**

## Build and Deployment

### Performance Considerations
- **Images are unoptimized** (next.config.mjs setting) -- consider impact of changes
- **Static export ready** -- all pages are statically generated
- **No server-side features** -- contact form is frontend-only

### Environment
- **No environment variables required** for basic operation
- **Vercel Analytics configured** but may fail to load (expected, non-blocking)
- **No database or external APIs** required for core functionality

## Known Issues and Limitations

### Expected Warnings/Errors (Ignore These)
- React 19 peer dependency warnings during `pnpm install`
- ESLint errors/warnings in existing code
- Vercel Analytics script loading failures in browser console
- Next.js build cache warnings (first build)

### Don't Fix Unless Task-Related
- Korean text unescaped quotes in React components
- Unused imports and variables in existing code
- Missing useEffect dependencies
- Image optimization warnings

## Development Best Practices

### When Working on This Codebase
- **Use pnpm, not npm** -- package manager is pnpm
- **Test all pages manually** -- no automated tests exist
- **Respect Korean content** -- don't change language unless specifically requested
- **Follow existing component patterns** -- use shadcn/ui components when possible
- **Test responsive design** -- mobile-first approach used throughout
- **Verify theme switching** -- dark/light mode toggle is prominent feature

### Before Committing Changes
- `pnpm run build` -- ensure build succeeds
- Complete manual validation of all affected pages
- Check dev server console for new errors
- Test responsive design if UI changes made

### Timing Expectations
- Initial `pnpm install`: 15-25 seconds
- Build time: 30-45 seconds
- Dev server startup: 1-2 seconds
- ESLint first run: 15-30 seconds
- **NEVER CANCEL** these operations -- they are working correctly

## Troubleshooting

### Common Issues
- **Build fails:** Check Next.js config and TypeScript errors
- **Dev server won't start:** Check port 3000 availability
- **Styles not loading:** Check Tailwind CSS and PostCSS configuration
- **Images not loading:** Check `/public/images/` directory and file paths
- **Lint issues:** Review known issues list above before attempting fixes

### Emergency Recovery
- **Reset dependencies:** `rm -rf node_modules .next && pnpm install --no-frozen-lockfile`
- **Clear Next.js cache:** `rm -rf .next`
- **Reset to clean state:** `git restore .` (loses changes)