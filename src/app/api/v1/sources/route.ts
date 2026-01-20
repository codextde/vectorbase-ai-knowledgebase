import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiKey } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const auth = await authenticateApiKey(request.headers.get('authorization'))
  
  if (!auth) {
    return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const type = searchParams.get('type')
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
  const offset = parseInt(searchParams.get('offset') || '0')

  const sources = await prisma.source.findMany({
    where: {
      projectId: auth.projectId,
      ...(status && { status }),
      ...(type && { type }),
    },
    select: {
      id: true,
      name: true,
      type: true,
      status: true,
      chunksCount: true,
      tokensCount: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
    skip: offset,
    take: limit,
  })

  const formattedSources = sources.map((s: typeof sources[number]) => ({
    id: s.id,
    name: s.name,
    type: s.type,
    status: s.status,
    chunks_count: s.chunksCount,
    tokens_count: s.tokensCount,
    created_at: s.createdAt.toISOString(),
    updated_at: s.updatedAt.toISOString(),
  }))

  return NextResponse.json({ sources: formattedSources })
}

export async function POST(request: NextRequest) {
  const auth = await authenticateApiKey(request.headers.get('authorization'))
  
  if (!auth) {
    return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { type, name, content, question, answer, url } = body as {
      type: 'text' | 'qa' | 'website'
      name?: string
      content?: string
      question?: string
      answer?: string
      url?: string
    }

    if (!type || !['text', 'qa', 'website'].includes(type)) {
      return NextResponse.json({ error: 'Invalid source type' }, { status: 400 })
    }

    if (type === 'text') {
      if (!content || !name) {
        return NextResponse.json({ error: 'Name and content required for text source' }, { status: 400 })
      }

      const source = await prisma.source.create({
        data: {
          projectId: auth.projectId,
          type: 'text',
          name,
          status: 'pending',
        },
      })

      await prisma.sourceText.create({
        data: { id: source.id, content },
      })

      return NextResponse.json({ 
        source: {
          id: source.id,
          name: source.name,
          type: source.type,
          status: source.status,
        },
        message: 'Source created. Use /api/v1/sources/{id}/process to process it.' 
      })
    }

    if (type === 'qa') {
      if (!question || !answer) {
        return NextResponse.json({ error: 'Question and answer required for Q&A source' }, { status: 400 })
      }

      const source = await prisma.source.create({
        data: {
          projectId: auth.projectId,
          type: 'qa',
          name: name || question.substring(0, 50),
          status: 'pending',
        },
      })

      await prisma.sourceQa.create({
        data: { id: source.id, question, answer },
      })

      return NextResponse.json({ 
        source: {
          id: source.id,
          name: source.name,
          type: source.type,
          status: source.status,
        },
        message: 'Source created. Use /api/v1/sources/{id}/process to process it.' 
      })
    }

    if (type === 'website') {
      if (!url) {
        return NextResponse.json({ error: 'URL required for website source' }, { status: 400 })
      }

      let urlObj: URL
      try {
        urlObj = new URL(url)
      } catch {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
      }

      const source = await prisma.source.create({
        data: {
          projectId: auth.projectId,
          type: 'website',
          name: name || urlObj.hostname,
          status: 'pending',
        },
      })

      await prisma.sourceWebsite.create({
        data: { id: source.id, url, crawlType: 'single' },
      })

      return NextResponse.json({ 
        source: {
          id: source.id,
          name: source.name,
          type: source.type,
          status: source.status,
        },
        message: 'Source created. Use /api/v1/sources/{id}/process to process it.' 
      })
    }

    return NextResponse.json({ error: 'Invalid source type' }, { status: 400 })
  } catch (error) {
    console.error('Create source error:', error)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
