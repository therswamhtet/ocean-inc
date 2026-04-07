import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceRoleClient } from '@/lib/supabase/server'

const commentSchema = z.object({
  taskId: z.string().uuid('Invalid task ID'),
  content: z.string().trim().min(1, 'Comment must not be empty'),
  isRevision: z.boolean().default(false),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = commentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid comment data' },
        { status: 400 }
      )
    }

    const { taskId, content, isRevision } = parsed.data

    const supabase = createServiceRoleClient()
    const { data: existingTask } = await supabase
      .from('tasks')
      .select('id')
      .eq('id', taskId)
      .single()

    if (!existingTask) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 })
    }

    const { error: insertError } = await supabase
      .from('comments')
      .insert({
        task_id: taskId,
        team_member_id: null,
        content,
        is_revision: isRevision,
      })

    if (insertError) {
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 })
    }

    await supabase.from('notifications').insert({
      team_member_id: null,
      message: isRevision
        ? `🔴 Client requested revision: ${content.slice(0, 80)}...`
        : `💬 Client commented: ${content.slice(0, 80)}...`,
      read: false,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to post comment' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { commentId, content } = z.object({
      commentId: z.string().uuid('Invalid comment ID'),
      content: z.string().trim().min(1, 'Comment must not be empty'),
    }).parse(body)

    const supabase = createServiceRoleClient()

    // Verify it's a portal comment (team_member_id is null)
    const { data: comment } = await supabase
      .from('comments')
      .select('id')
      .eq('id', commentId)
      .is('team_member_id', null)
      .maybeSingle()

    if (!comment) {
      return NextResponse.json({ success: false, error: 'Comment not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('comments')
      .update({ content: content.trim() })
      .eq('id', commentId)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update comment' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { commentId } = z.object({
      commentId: z.string().uuid('Invalid comment ID'),
    }).parse(await request.json())

    const supabase = createServiceRoleClient()

    // Verify it's a portal comment (team_member_id is null)
    const { data: comment } = await supabase
      .from('comments')
      .select('id')
      .eq('id', commentId)
      .is('team_member_id', null)
      .maybeSingle()

    if (!comment) {
      return NextResponse.json({ success: false, error: 'Comment not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete comment' },
      { status: 500 }
    )
  }
}
