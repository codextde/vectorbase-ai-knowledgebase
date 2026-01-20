import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { organizationId, name, slug } = body

    const membership = await prisma.organizationMember.findFirst({
      where: { userId: user.id, organizationId, role: 'owner' },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    await prisma.organization.update({
      where: { id: organizationId },
      data: { 
        ...(name && { name }),
        ...(slug && { slug }),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Organization update error:', error)
    return NextResponse.json({ error: 'Failed to update organization' }, { status: 500 })
  }
}
