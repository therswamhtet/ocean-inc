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

    // Verify the task exists before inserting a comment
    const supabase = createServiceRoleClient()
    const { data: existingTask } = await supabase
      .from('tasks')
      .select('id')
      .eq('id', taskId)
      .single()

    if (!existingTask) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 })
    }

    // Insert comment
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

    // Create admin notification for every comment
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
