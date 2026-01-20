import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { processSourceWithPrisma } from '@/lib/processing-prisma'

export async function POST(
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
      include: { project: { include: { organization: true } } },
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

    await prisma.source.update({
      where: { id: sourceId },
      data: { 
        status: 'pending', 
        errorMessage: null,
        chunksCount: 0,
        tokensCount: 0,
      },
    })

    const result = await processSourceWithPrisma(sourceId)

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        chunksCreated: result.chunksCreated,
        totalTokens: result.totalTokens,
      })
    } else {
      return NextResponse.json({ error: result.error || 'Processing failed' }, { status: 500 })
    }
  } catch (error) {
    console.error('Retrain source error:', error)
    return NextResponse.json({ error: 'Failed to retrain source' }, { status: 500 })
  }
}
