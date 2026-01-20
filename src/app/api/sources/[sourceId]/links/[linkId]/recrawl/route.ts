import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { generateEmbeddings, EMBEDDING_MODEL } from '@/lib/embeddings'
import { splitTextIntoChunks, estimateTokenCount } from '@/lib/chunking'

export async function POST(
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

    await prisma.websiteLink.update({
      where: { id: linkId },
      data: { status: 'processing', errorMessage: null },
    })

    recrawlLinkInBackground(sourceId, linkId, source.projectId, source.name).catch(console.error)

    return NextResponse.json({ success: true, message: 'Recrawl started' })
  } catch (error) {
    console.error('Recrawl link error:', error)
    return NextResponse.json({ error: 'Failed to start recrawl' }, { status: 500 })
  }
}

async function recrawlLinkInBackground(
  sourceId: string,
  linkId: string,
  projectId: string,
  sourceName: string
) {
  try {
    const link = await prisma.websiteLink.findUnique({
      where: { id: linkId },
    })

    if (!link) return

    const { crawlSinglePage } = await import('@/lib/crawler')

    const page = await crawlSinglePage(link.url, {
      pageTimeout: 30000,
      waitForIdle: true,
    })

    if (!page || !page.content) {
      await prisma.websiteLink.update({
        where: { id: linkId },
        data: {
          status: 'failed',
          errorMessage: 'No content extracted',
        },
      })
      return
    }

    await prisma.chunk.deleteMany({
      where: {
        sourceId,
        metadata: {
          path: ['link_id'],
          equals: linkId,
        },
      },
    })

    const content = `# ${page.title}\nSource: ${page.url}\n\n${page.content}`
    const chunks = splitTextIntoChunks(content)

    if (chunks.length === 0) {
      await prisma.websiteLink.update({
        where: { id: linkId },
        data: {
          status: 'failed',
          errorMessage: 'No chunks created',
        },
      })
      return
    }

    const chunkContents = chunks.map((c) => c.content)
    const embeddings = await generateEmbeddings(chunkContents)

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      const tokens = estimateTokenCount(chunk.content)

      await prisma.$executeRawUnsafe(
        `
        INSERT INTO chunks (id, source_id, project_id, content, metadata, embedding_model, embedding, tokens_count, created_at)
        VALUES (
          gen_random_uuid(),
          $1::uuid,
          $2::uuid,
          $3,
          $4::jsonb,
          $5,
          $6::vector,
          $7,
          NOW()
        )
      `,
        sourceId,
        projectId,
        chunk.content,
        JSON.stringify({
          source_name: sourceName,
          source_type: 'website',
          source_url: link.url,
          link_id: linkId,
          chunk_index: chunk.metadata.chunkIndex,
        }),
        EMBEDDING_MODEL,
        `[${embeddings[i].join(',')}]`,
        tokens
      )
    }

    await prisma.websiteLink.update({
      where: { id: linkId },
      data: {
        status: 'completed',
        title: page.title,
        contentSize: page.content.length,
        lastCrawledAt: new Date(),
        errorMessage: null,
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    await prisma.websiteLink.update({
      where: { id: linkId },
      data: {
        status: 'failed',
        errorMessage,
      },
    })
  }
}
