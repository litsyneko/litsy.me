import { NextResponse } from 'next/server'

export async function GET() {
  // Currently, we don't persist pending password change requests; return default.
  return NextResponse.json({ hasPendingRequest: false, requestedAt: null, expiresAt: null })
}
