import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { memberId } = await params
    const body = await request.json()
    const { role } = body

    if (!['admin', 'member'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const targetMember = await prisma.organizationMember.findUnique({
      where: { id: memberId },
    })

    if (!targetMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    if (targetMember.role === 'owner') {
      return NextResponse.json({ error: 'Cannot change owner role' }, { status: 400 })
    }

    const currentUserMembership = await prisma.organizationMember.findFirst({
      where: { 
        userId: user.id, 
        organizationId: targetMember.organizationId,
        role: 'owner',
      },
    })

    if (!currentUserMembership) {
      return NextResponse.json({ error: 'Only owners can change roles' }, { status: 403 })
    }

    await prisma.organizationMember.update({
      where: { id: memberId },
      data: { role },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update member role error:', error)
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { memberId } = await params

    const targetMember = await prisma.organizationMember.findUnique({
      where: { id: memberId },
    })

    if (!targetMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    if (targetMember.role === 'owner') {
      return NextResponse.json({ error: 'Cannot remove owner' }, { status: 400 })
    }

    const currentUserMembership = await prisma.organizationMember.findFirst({
      where: { 
        userId: user.id, 
        organizationId: targetMember.organizationId,
      },
    })

    if (!currentUserMembership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const isSelf = targetMember.userId === user.id
    const isOwnerOrAdmin = ['owner', 'admin'].includes(currentUserMembership.role)

    if (!isSelf && !isOwnerOrAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    if (currentUserMembership.role === 'admin' && targetMember.role === 'admin' && !isSelf) {
      return NextResponse.json({ error: 'Admins cannot remove other admins' }, { status: 403 })
    }

    await prisma.organizationMember.delete({
      where: { id: memberId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Remove member error:', error)
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 })
  }
}
