// Helper utilities to redirect users to auth pages.
// To avoid external Clerk-host redirect (to preserve server-side sessions),
// redirect to internal routes (/sign-in, /sign-up) by default.
export const CLERK_HOST = (process.env.NEXT_PUBLIC_CLERK_HOST ?? 'https://primary-turtle-0.accounts.dev')

export function redirectToSignIn() {
  if (typeof window === 'undefined') return
  // internal sign-in page (Clerk client UI)
  window.location.href = '/sign-in'
}

export function redirectToSignUp() {
  if (typeof window === 'undefined') return
  window.location.href = '/sign-up'
}

export function redirectToUnauthorizedSignIn() {
  if (typeof window === 'undefined') return
  // map unauthorized flow to internal sign-in (optionally add query)
  window.location.href = '/sign-in?unauthorized=1'
}

export function getClerkHost() {
  return CLERK_HOST
}