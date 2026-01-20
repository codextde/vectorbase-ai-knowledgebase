import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    const invite = await prisma.organizationInvite.findUnique({
      where: { token },
      include: { organization: true },
    })

    if (!invite) {
      return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 404 })
    }

    if (invite.status !== 'pending') {
      return NextResponse.json({ error: 'Invite is no longer valid' }, { status: 400 })
    }

    if (invite.expiresAt < new Date()) {
      await prisma.organizationInvite.update({
        where: { id: invite.id },
        data: { status: 'expired' },
      })
      return NextResponse.json({ error: 'Invite has expired' }, { status: 400 })
    }

    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
    })

    if (!profile || profile.email.toLowerCase() !== invite.email.toLowerCase()) {
      return NextResponse.json({ 
        error: 'This invite was sent to a different email address' 
      }, { status: 403 })
    }

    const existingMembership = await prisma.organizationMember.findFirst({
      where: { userId: user.id, organizationId: invite.organizationId },
    })

    if (existingMembership) {
      return NextResponse.json({ error: 'You are already a member' }, { status: 400 })
    }

    await prisma.$transaction([
      prisma.organizationMember.create({
        data: {
          organizationId: invite.organizationId,
          userId: user.id,
          role: invite.role,
        },
      }),
      prisma.organizationInvite.update({
        where: { id: invite.id },
        data: { status: 'accepted' },
      }),
    ])

    return NextResponse.json({ 
      success: true,
      organization: {
        id: invite.organization.id,
        name: invite.organization.name,
        slug: invite.organization.slug,
      },
    })
  } catch (error) {
    console.error('Accept invite error:', error)
    return NextResponse.json({ error: 'Failed to accept invite' }, { status: 500 })
  }
}
