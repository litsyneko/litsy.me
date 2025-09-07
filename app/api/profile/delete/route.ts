import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'

export async function POST() {
  // Optionally initiate deletion flow; here we simply confirm user is authenticated
  try {
    const session = await auth();
    const userId = (session as any)?.userId || (session as any)?.user?.id
    if (!userId) return NextResponse.json({ message: '로그인이 필요합니다.' }, { status: 401 })
    return NextResponse.json({ message: 'OK' })
  } catch (error) {
    console.error('POST /api/profile/delete error:', error)
    return NextResponse.json({ message: '서버 오류' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    const userId = (session as any)?.userId || (session as any)?.user?.id
    if (!userId) return NextResponse.json({ message: '로그인이 필요합니다.' }, { status: 401 })

    const clerk = await clerkClient();
    await clerk.users.deleteUser(userId)

    return NextResponse.json({ message: '계정이 삭제되었습니다.' })
  } catch (error) {
    console.error('DELETE /api/profile/delete error:', error)
    return NextResponse.json({ message: '서버 오류', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
