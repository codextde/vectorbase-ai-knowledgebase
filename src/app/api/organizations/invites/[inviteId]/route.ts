import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { inviteId } = await params

    const invite = await prisma.organizationInvite.findUnique({
      where: { id: inviteId },
    })

    if (!invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
    }

    const membership = await prisma.organizationMember.findFirst({
      where: { 
        userId: user.id, 
        organizationId: invite.organizationId,
        role: { in: ['owner', 'admin'] },
      },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    await prisma.organizationInvite.update({
      where: { id: inviteId },
      data: { status: 'cancelled' },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cancel invite error:', error)
    return NextResponse.json({ error: 'Failed to cancel invite' }, { status: 500 })
  }
}
