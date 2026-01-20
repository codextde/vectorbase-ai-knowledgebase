import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import type { ChunkDebug, ChunksDebugResponse } from '@/types/database'

const PREVIEW_LENGTH = 200
const DEFAULT_LIMIT = 20
const MAX_LIMIT = 50

interface EmbeddingStats {
  id: string
  dimension: number | null
  magnitude: number | null
  has_embedding: boolean
}

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

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT))))
  const includeStats = searchParams.get('includeStats') === 'true'

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

    const totalCount = await prisma.chunk.count({
      where: { sourceId },
    })

    const totalTokens = await prisma.chunk.aggregate({
      where: { sourceId },
      _sum: { tokensCount: true },
    })

    const chunks = await prisma.chunk.findMany({
      where: { sourceId },
      orderBy: { createdAt: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        content: true,
        metadata: true,
        tokensCount: true,
        embeddingModel: true,
        createdAt: true,
      },
    })

    let embeddingStatsMap: Map<string, EmbeddingStats> = new Map()
    
    if (includeStats && chunks.length > 0) {
      const chunkIds = chunks.map(c => c.id)
      const stats = await prisma.$queryRawUnsafe<EmbeddingStats[]>(`
        SELECT 
          id,
          CASE WHEN embedding IS NOT NULL THEN vector_dims(embedding) ELSE NULL END as dimension,
          CASE WHEN embedding IS NOT NULL THEN vector_norm(embedding)::float ELSE NULL END as magnitude,
          embedding IS NOT NULL as has_embedding
        FROM chunks 
        WHERE id = ANY($1::uuid[])
      `, chunkIds)
      
      stats.forEach(s => embeddingStatsMap.set(s.id, s))
    }

    const formattedChunks: ChunkDebug[] = chunks.map(chunk => {
      const contentPreview = chunk.content.length > PREVIEW_LENGTH
        ? chunk.content.slice(0, PREVIEW_LENGTH) + '...'
        : chunk.content
      
      const result: ChunkDebug = {
        id: chunk.id,
        content: chunk.content,
        contentPreview,
        metadata: chunk.metadata as ChunkDebug['metadata'],
        tokensCount: chunk.tokensCount,
        embeddingModel: chunk.embeddingModel,
        createdAt: chunk.createdAt.toISOString(),
      }

      if (includeStats) {
        const stats = embeddingStatsMap.get(chunk.id)
        result.embeddingStats = {
          dimension: stats?.dimension ?? null,
          magnitude: stats?.magnitude ?? null,
          hasEmbedding: stats?.has_embedding ?? false,
        }
      }

      return result
    })

    const response: ChunksDebugResponse = {
      chunks: formattedChunks,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      summary: {
        totalChunks: totalCount,
        totalTokens: totalTokens._sum.tokensCount || 0,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Get chunks error:', error)
    return NextResponse.json({ error: 'Failed to get chunks' }, { status: 500 })
  }
}
