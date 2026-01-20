import { NextRequest, NextResponse } from 'next/server'
import { processSourceWithPrisma } from '@/lib/processing-prisma'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const { sourceId } = body as { sourceId?: string }

    if (sourceId) {
      const result = await processSourceWithPrisma(sourceId)
      return NextResponse.json(result)
    }

    const pendingSources = await prisma.source.findMany({
      where: { status: 'pending' },
      take: 10,
    })

    const results = await Promise.all(
      pendingSources.map((source: typeof pendingSources[number]) => processSourceWithPrisma(source.id))
    )

    return NextResponse.json({ 
      processed: results.length,
      results 
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Processing failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const pendingCount = await prisma.source.count({
    where: { status: 'pending' },
  })

  const processingCount = await prisma.source.count({
    where: { status: 'processing' },
  })

  return NextResponse.json({
    pending: pendingCount,
    processing: processingCount,
  })
}
