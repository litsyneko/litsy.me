import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware()

export const config = {
  // Protect specific app routes (profile, settings, blog new)
  matcher: ['/profile/:path*', '/settings/:path*', '/blog/new/:path*'],
}
