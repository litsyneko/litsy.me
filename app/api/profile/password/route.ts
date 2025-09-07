import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'

export async function POST(request: Request) {
  // Start password change flow: here we only validate and allow the client to proceed
  try {
    const body = await request.json()
    const { newPassword } = body

    if (!newPassword || typeof newPassword !== 'string') {
      return NextResponse.json({ message: '유효한 비밀번호가 필요합니다.' }, { status: 400 })
    }

    // Basic server-side strength check (client already checks)
    if (newPassword.length < 8) {
      return NextResponse.json({ message: '비밀번호는 최소 8자 이상이어야 합니다.' }, { status: 400 })
    }

    return NextResponse.json({ message: 'OK' })
  } catch (error) {
    console.error('POST /api/profile/password error:', error)
    return NextResponse.json({ message: '서버 오류' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { newPassword } = body

    if (!newPassword || typeof newPassword !== 'string') {
      return NextResponse.json({ message: '유효한 비밀번호가 필요합니다.' }, { status: 400 })
    }

    const session = await auth();
    const userId = (session as any)?.userId || (session as any)?.user?.id
    if (!userId) {
      return NextResponse.json({ message: '로그인이 필요합니다.' }, { status: 401 })
    }

    const clerk = await clerkClient();
    await clerk.users.updateUser(userId, { password: newPassword })

    return NextResponse.json({ message: '비밀번호가 성공적으로 변경되었습니다.' })
  } catch (error) {
    console.error('PUT /api/profile/password error:', error)
    return NextResponse.json({ message: '서버 오류', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
