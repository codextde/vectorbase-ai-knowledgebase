import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiKey } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { processSourceWithPrisma } from '@/lib/processing-prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sourceId: string }> }
) {
  const { sourceId } = await params
  const auth = await authenticateApiKey(request.headers.get('authorization'))
  
  if (!auth) {
    return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 })
  }

  const source = await prisma.source.findFirst({
    where: { id: sourceId, projectId: auth.projectId },
  })

  if (!source) {
    return NextResponse.json({ error: 'Source not found' }, { status: 404 })
  }

  return NextResponse.json({ 
    source: {
      id: source.id,
      name: source.name,
      type: source.type,
      status: source.status,
      chunks_count: source.chunksCount,
      tokens_count: source.tokensCount,
      error_message: source.errorMessage,
      created_at: source.createdAt.toISOString(),
      updated_at: source.updatedAt.toISOString(),
    }
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sourceId: string }> }
) {
  const { sourceId } = await params
  const auth = await authenticateApiKey(request.headers.get('authorization'))
  
  if (!auth) {
    return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 })
  }

  const source = await prisma.source.findFirst({
    where: { id: sourceId, projectId: auth.projectId },
  })

  if (!source) {
    return NextResponse.json({ error: 'Source not found' }, { status: 404 })
  }

  await prisma.chunk.deleteMany({ where: { sourceId } })
  await prisma.source.delete({ where: { id: sourceId } })

  return NextResponse.json({ success: true, message: 'Source deleted' })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sourceId: string }> }
) {
  const { sourceId } = await params
  const auth = await authenticateApiKey(request.headers.get('authorization'))
  
  if (!auth) {
    return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 })
  }

  const source = await prisma.source.findFirst({
    where: { id: sourceId, projectId: auth.projectId },
  })

  if (!source) {
    return NextResponse.json({ error: 'Source not found' }, { status: 404 })
  }

  const result = await processSourceWithPrisma(sourceId)
  return NextResponse.json(result)
}
