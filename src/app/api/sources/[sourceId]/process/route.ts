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

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { maxDepth?: number; maxPages?: number } = {}
  try {
    body = await request.json()
  } catch {
  }

  const source = await prisma.source.findUnique({
    where: { id: sourceId },
    include: {
      project: {
        include: {
          organization: {
            include: {
              members: {
                where: { userId: user.id },
              },
            },
          },
        },
      },
    },
  })

  if (!source || source.project.organization.members.length === 0) {
    return NextResponse.json({ error: 'Source not found' }, { status: 404 })
  }

  const result = await processSourceWithPrisma(sourceId, {
    maxDepth: body.maxDepth ?? 2,
    maxPages: body.maxPages ?? 10,
  })

  return NextResponse.json(result)
}
