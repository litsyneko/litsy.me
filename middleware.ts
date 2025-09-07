import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware()

export const config = {
  // Default-deny: apply middleware to all app routes except known public ones.
  // Adjust the negative lookahead to match your public routes.
  matcher: [
    '/((?!_next|static|favicon.ico|public|api/public|sign-in|sign-up|robots.txt|sitemap.xml).*)',
  ],
}
