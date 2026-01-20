import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sourceId: string }> }
) {
  const { sourceId } = await params
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

    if (source.type !== 'website') {
      return NextResponse.json({ error: 'Source is not a website' }, { status: 400 })
    }

    const membership = await prisma.organizationMember.findFirst({
      where: { userId: user.id, organizationId: source.project.organizationId },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const sourceWebsite = await prisma.sourceWebsite.findUnique({
      where: { id: sourceId },
      include: {
        links: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!sourceWebsite) {
      return NextResponse.json({ error: 'Website source not found' }, { status: 404 })
    }

    const links = sourceWebsite.links.map((link) => ({
      id: link.id,
      url: link.url,
      title: link.title,
      contentSize: link.contentSize,
      status: link.status,
      isExcluded: link.isExcluded,
      errorMessage: link.errorMessage,
      lastCrawledAt: link.lastCrawledAt?.toISOString() || null,
      createdAt: link.createdAt.toISOString(),
    }))

    return NextResponse.json({ links })
  } catch (error) {
    console.error('Get links error:', error)
    return NextResponse.json({ error: 'Failed to get links' }, { status: 500 })
  }
}
