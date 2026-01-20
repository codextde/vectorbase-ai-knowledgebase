import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { processSourceWithPrisma } from '@/lib/processing-prisma'

const CRON_SECRET = process.env.CRON_SECRET

const ALLOWED_PLANS = ['starter', 'pro', 'enterprise']

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')

  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

  try {
    const sourcesToRetrain = await prisma.source.findMany({
      where: {
        autoRetrain: true,
        status: 'completed',
        type: {
          in: ['website', 'notion'],
        },
        OR: [
          { lastRetrainedAt: null },
          { lastRetrainedAt: { lt: twentyFourHoursAgo } },
        ],
        project: {
          isActive: true,
          organization: {
            subscription: {
              plan: {
                id: { in: ALLOWED_PLANS },
              },
              status: 'active',
            },
          },
        },
      },
      include: {
        project: {
          include: {
            organization: {
              include: {
                subscription: {
                  include: { plan: true },
                },
              },
            },
          },
        },
      },
      take: 50,
    })

    const results = {
      total: sourcesToRetrain.length,
      success: 0,
      failed: 0,
      skipped: 0,
      details: [] as { sourceId: string; sourceName: string; status: string; error?: string }[],
    }

    for (const source of sourcesToRetrain) {
      try {
        await prisma.chunk.deleteMany({
          where: { sourceId: source.id },
        })

        await prisma.source.update({
          where: { id: source.id },
          data: {
            status: 'pending',
            chunksCount: 0,
            tokensCount: 0,
          },
        })

        const result = await processSourceWithPrisma(source.id)

        if (result.success) {
          await prisma.source.update({
            where: { id: source.id },
            data: { lastRetrainedAt: new Date() },
          })
          results.success++
          results.details.push({
            sourceId: source.id,
            sourceName: source.name,
            status: 'success',
          })
        } else {
          results.failed++
          results.details.push({
            sourceId: source.id,
            sourceName: source.name,
            status: 'failed',
            error: result.error,
          })
        }
      } catch (error) {
        results.failed++
        results.details.push({
          sourceId: source.id,
          sourceName: source.name,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      message: 'Auto-retrain completed',
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Auto-retrain cron error:', error)
    return NextResponse.json(
      { error: 'Auto-retrain failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
