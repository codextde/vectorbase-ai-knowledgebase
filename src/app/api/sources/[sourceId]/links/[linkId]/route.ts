import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sourceId: string; linkId: string }> }
) {
  const { sourceId, linkId } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { url, isExcluded } = body

    const source = await prisma.source.findUnique({
      where: { id: sourceId },
      include: {
        project: { include: { organization: true } },
      },
    })

    if (!source) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 })
    }

    const membership = await prisma.organizationMember.findFirst({
      where: { userId: user.id, organizationId: source.project.organizationId },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const link = await prisma.websiteLink.findUnique({
      where: { id: linkId },
    })

    if (!link || link.sourceWebsiteId !== sourceId) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    const updateData: { url?: string; isExcluded?: boolean; status?: string } = {}

    if (url !== undefined) {
      try {
        new URL(url)
        updateData.url = url
        updateData.status = 'pending'
      } catch {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
      }
    }

    if (isExcluded !== undefined) {
      updateData.isExcluded = isExcluded
    }

    const updatedLink = await prisma.websiteLink.update({
      where: { id: linkId },
      data: updateData,
    })

    return NextResponse.json({
      link: {
        id: updatedLink.id,
        url: updatedLink.url,
        title: updatedLink.title,
        contentSize: updatedLink.contentSize,
        status: updatedLink.status,
        isExcluded: updatedLink.isExcluded,
        errorMessage: updatedLink.errorMessage,
        lastCrawledAt: updatedLink.lastCrawledAt?.toISOString() || null,
        createdAt: updatedLink.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Update link error:', error)
    return NextResponse.json({ error: 'Failed to update link' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sourceId: string; linkId: string }> }
) {
  const { sourceId, linkId } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const source = await prisma.source.findUnique({
      where: { id: sourceId },
      include: {
        project: { include: { organization: true } },
      },
    })

    if (!source) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 })
    }

    const membership = await prisma.organizationMember.findFirst({
      where: { userId: user.id, organizationId: source.project.organizationId },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const link = await prisma.websiteLink.findUnique({
      where: { id: linkId },
    })

    if (!link || link.sourceWebsiteId !== sourceId) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    await prisma.websiteLink.delete({
      where: { id: linkId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete link error:', error)
    return NextResponse.json({ error: 'Failed to delete link' }, { status: 500 })
  }
}
