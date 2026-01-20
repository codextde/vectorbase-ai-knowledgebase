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
        sourceText: true,
        sourceQa: true,
        sourceWebsite: true,
        sourceDocument: true,
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

    return NextResponse.json({ source })
  } catch (error) {
    console.error('Get source error:', error)
    return NextResponse.json({ error: 'Failed to get source' }, { status: 500 })
  }
}

export async function PATCH(
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
    const body = await request.json()
    const { name, content, question, answer, url, autoRetrain, selectedPages } = body

    const source = await prisma.source.findUnique({
      where: { id: sourceId },
      include: {
        project: { include: { organization: true } },
        sourceText: true,
        sourceQa: true,
        sourceWebsite: true,
        sourceNotion: {
          include: { pages: true },
        },
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

    const sourceUpdateData: { name?: string; autoRetrain?: boolean } = {}
    if (name) sourceUpdateData.name = name
    if (typeof autoRetrain === 'boolean') sourceUpdateData.autoRetrain = autoRetrain

    if (Object.keys(sourceUpdateData).length > 0) {
      await prisma.source.update({
        where: { id: sourceId },
        data: sourceUpdateData,
      })
    }

    if (source.type === 'text' && content !== undefined) {
      await prisma.sourceText.update({
        where: { id: sourceId },
        data: { content },
      })
    } else if (source.type === 'qa' && (question !== undefined || answer !== undefined)) {
      await prisma.sourceQa.update({
        where: { id: sourceId },
        data: {
          ...(question !== undefined && { question }),
          ...(answer !== undefined && { answer }),
        },
      })
    } else if (source.type === 'website' && url !== undefined) {
      await prisma.sourceWebsite.update({
        where: { id: sourceId },
        data: { url },
      })
    } else if (source.type === 'notion' && selectedPages !== undefined) {
      const existingPageIds = source.sourceNotion?.pages.map(p => p.notionPageId) || []
      const newPageIds = selectedPages.map((p: { id: string }) => p.id)
      
      const pagesToRemove = existingPageIds.filter(id => !newPageIds.includes(id))
      const pagesToAdd = selectedPages.filter((p: { id: string }) => !existingPageIds.includes(p.id))
      
      if (pagesToRemove.length > 0) {
        await prisma.notionPage.deleteMany({
          where: {
            sourceNotionId: sourceId,
            notionPageId: { in: pagesToRemove },
          },
        })
      }
      
      for (const page of pagesToAdd) {
        await prisma.notionPage.create({
          data: {
            sourceNotionId: sourceId,
            notionPageId: page.id,
            title: page.title,
            pageType: page.type,
            status: 'pending',
          },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update source error:', error)
    return NextResponse.json({ error: 'Failed to update source' }, { status: 500 })
  }
}

export async function DELETE(
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
    const { projectId } = await request.json()

    const source = await prisma.source.findUnique({
      where: { id: sourceId },
      include: { 
        project: { include: { organization: true } },
        sourceDocument: true,
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

    await prisma.chunk.deleteMany({
      where: { sourceId },
    })

    if (source.type === 'document' && source.sourceDocument) {
      await supabase.storage.from('documents').remove([source.sourceDocument.storagePath])
      await prisma.sourceDocument.delete({ where: { id: sourceId } }).catch(() => {})
    } else if (source.type === 'text') {
      await prisma.sourceText.delete({ where: { id: sourceId } }).catch(() => {})
    } else if (source.type === 'qa') {
      await prisma.sourceQa.delete({ where: { id: sourceId } }).catch(() => {})
    } else if (source.type === 'website') {
      await prisma.sourceWebsite.delete({ where: { id: sourceId } }).catch(() => {})
    } else if (source.type === 'notion') {
      await prisma.notionPage.deleteMany({ where: { sourceNotionId: sourceId } }).catch(() => {})
      await prisma.sourceNotion.delete({ where: { id: sourceId } }).catch(() => {})
    }

    await prisma.source.delete({ where: { id: sourceId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete source error:', error)
    return NextResponse.json({ error: 'Failed to delete source' }, { status: 500 })
  }
}
