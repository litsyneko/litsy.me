import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { content } = body

    if (!id) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 })
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Content is required',
        field: 'content'
      }, { status: 400 })
    }

    if (content.trim().length > 1000) {
      return NextResponse.json({ 
        error: 'Content must be 1000 characters or less',
        field: 'content'
      }, { status: 400 })
    }

    // 권한 확인 (향후 구현)
    // const { hasPermission, user } = await checkCommentPermission(id)
    // if (!hasPermission) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { data, error } = await supabaseAdmin
      .from('comments')
      .update({ 
        content: content.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error updating comment:', error)
      return NextResponse.json({ 
        error: 'Failed to update comment',
        details: error.message
      }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('PUT /api/comments/[id] error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 })
    }

    // 권한 확인 (향후 구현)
    // const { hasPermission } = await checkCommentPermission(id)
    // if (!hasPermission) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { error } = await supabaseAdmin
      .from('comments')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Database error deleting comment:', error)
      return NextResponse.json({ 
        error: 'Failed to delete comment',
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({ message: 'Comment deleted successfully' })
  } catch (error) {
    console.error('DELETE /api/comments/[id] error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}