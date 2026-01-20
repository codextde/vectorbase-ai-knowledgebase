import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    const membership = await prisma.organizationMember.findFirst({
      where: { userId: user.id, organizationId },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const members = await prisma.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' },
        { createdAt: 'asc' },
      ],
    })

    let invites: Array<{
      id: string
      email: string
      role: string
      status: string
      expiresAt: Date
      createdAt: Date
      inviter: { fullName: string | null; email: string }
    }> = []
    
    if (membership.role === 'owner' || membership.role === 'admin') {
      invites = await prisma.organizationInvite.findMany({
        where: { 
          organizationId,
          status: 'pending',
          expiresAt: { gt: new Date() },
        },
        include: {
          inviter: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    }

    return NextResponse.json({
      members: members.map(m => ({
        id: m.id,
        userId: m.userId,
        role: m.role,
        createdAt: m.createdAt.toISOString(),
        user: {
          id: m.user.id,
          email: m.user.email,
          fullName: m.user.fullName,
          avatarUrl: m.user.avatarUrl,
        },
      })),
      invites: invites.map(i => ({
        id: i.id,
        email: i.email,
        role: i.role,
        status: i.status,
        expiresAt: i.expiresAt.toISOString(),
        createdAt: i.createdAt.toISOString(),
        invitedBy: i.inviter.fullName || i.inviter.email,
      })),
      currentUserRole: membership.role,
    })
  } catch (error) {
    console.error('List members error:', error)
    return NextResponse.json({ error: 'Failed to list members' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { organizationId, email, role = 'member' } = body

    if (!organizationId || !email) {
      return NextResponse.json({ error: 'Organization ID and email required' }, { status: 400 })
    }

    if (!['admin', 'member'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const membership = await prisma.organizationMember.findFirst({
      where: { 
        userId: user.id, 
        organizationId,
        role: { in: ['owner', 'admin'] },
      },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const existingMember = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        user: { email: email.toLowerCase() },
      },
    })

    if (existingMember) {
      return NextResponse.json({ error: 'User is already a member' }, { status: 400 })
    }

    const existingInvite = await prisma.organizationInvite.findFirst({
      where: {
        organizationId,
        email: email.toLowerCase(),
        status: 'pending',
        expiresAt: { gt: new Date() },
      },
    })

    if (existingInvite) {
      return NextResponse.json({ error: 'Invite already sent to this email' }, { status: 400 })
    }

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        subscription: {
          include: { plan: true },
        },
        members: true,
        invites: {
          where: { status: 'pending', expiresAt: { gt: new Date() } },
        },
      },
    })

    if (organization) {
      const limits = organization.subscription?.plan?.limits as { team_members?: number } | null
      const maxMembers = limits?.team_members ?? 1
      const currentCount = organization.members.length + organization.invites.length

      if (currentCount >= maxMembers) {
        return NextResponse.json({ 
          error: `Your plan allows ${maxMembers} team member${maxMembers > 1 ? 's' : ''}. Upgrade to add more.` 
        }, { status: 403 })
      }
    }

    const token = nanoid(32)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const invite = await prisma.organizationInvite.create({
      data: {
        organizationId,
        email: email.toLowerCase(),
        role,
        invitedBy: user.id,
        token,
        status: 'pending',
        expiresAt,
      },
      include: {
        organization: { select: { name: true } },
      },
    })

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`

    return NextResponse.json({
      success: true,
      invite: {
        id: invite.id,
        email: invite.email,
        role: invite.role,
        expiresAt: invite.expiresAt.toISOString(),
      },
      inviteUrl,
    })
  } catch (error) {
    console.error('Invite member error:', error)
    return NextResponse.json({ error: 'Failed to send invite' }, { status: 500 })
  }
}
