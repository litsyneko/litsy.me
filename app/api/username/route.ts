import { NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get('username')

  if (!username) {
    return NextResponse.json({ available: false, error: 'username required' }, { status: 400 })
  }

  const users = await clerkClient.users.getUserList({ username: username });
  
  // Clerk's getUserList returns an array of users. If the array is empty, the username is available.
  return NextResponse.json({ available: users.totalCount === 0 });
}
