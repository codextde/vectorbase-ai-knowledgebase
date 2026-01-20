import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiKey } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { generateEmbedding } from '@/lib/embeddings'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit'

interface QueryRequest {
  query: string
  top_k?: number
  threshold?: number
}

interface QueryResult {
  id: string
  content: string
  metadata: unknown
  similarity: number
  source_id: string
}

export async function POST(request: NextRequest) {
  const auth = await authenticateApiKey(request.headers.get('authorization'))
  
  if (!auth) {
    return NextResponse.json(
      { error: 'Invalid or missing API key' },
      { status: 401 }
    )
  }

  const rateLimitResult = checkRateLimit(`query:${auth.projectId}`)
  const rateLimitHeaders = getRateLimitHeaders(rateLimitResult)
  
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers: rateLimitHeaders }
    )
  }

  try {
    const body = await request.json() as QueryRequest
    const { query, top_k = 5, threshold = 0.5 } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    if (query.length > 10000) {
      return NextResponse.json(
        { error: 'Query too long (max 10000 characters)' },
        { status: 400 }
      )
    }

    const queryEmbedding = await generateEmbedding(query)
    const embeddingString = `[${queryEmbedding.join(',')}]`
    
    const results = await prisma.$queryRawUnsafe<QueryResult[]>(`
      SELECT id, content, metadata, source_id,
        (1 - (embedding <=> $1::vector))::float as similarity
      FROM chunks
      WHERE project_id = $2::uuid
        AND embedding IS NOT NULL
        AND 1 - (embedding <=> $1::vector) > $3
      ORDER BY embedding <=> $1::vector
      LIMIT $4
    `, embeddingString, auth.projectId, threshold, Math.min(top_k, 20))

    await prisma.usageRecord.create({
      data: {
        organizationId: auth.organizationId,
        projectId: auth.projectId,
        type: 'embedding',
        amount: 1,
        metadata: { query_length: query.length },
      },
    })

    return NextResponse.json({
      results: results || [],
      query,
      project_id: auth.projectId,
    }, { headers: rateLimitHeaders })
  } catch (error) {
    console.error('Query error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: rateLimitHeaders }
    )
  }
}
