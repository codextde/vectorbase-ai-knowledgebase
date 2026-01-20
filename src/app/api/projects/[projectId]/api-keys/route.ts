import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { generateApiKey } from '@/lib/api-auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
    include: {
      organization: {
        include: {
          projects: {
            where: { id: projectId },
          },
        },
      },
    },
  })

  if (!membership || membership.organization.projects.length === 0) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  const body = await request.json()
  const { name } = body as { name: string }

  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const { key, hash, prefix } = generateApiKey()

  try {
    await prisma.apiKey.create({
      data: {
        projectId,
        name,
        keyHash: hash,
        keyPrefix: prefix,
        permissions: ['read', 'query'],
        isActive: true,
      },
    })

    return NextResponse.json({ key, prefix })
  } catch (error) {
    console.error('Failed to create API key:', error)
    return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
    include: {
      organization: {
        include: {
          projects: {
            where: { id: projectId },
          },
        },
      },
    },
  })

  if (!membership || membership.organization.projects.length === 0) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  const apiKeys = await prisma.apiKey.findMany({
    where: { projectId },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      lastUsedAt: true,
      createdAt: true,
      isActive: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const formattedKeys = apiKeys.map((key: typeof apiKeys[number]) => ({
    id: key.id,
    name: key.name,
    key_prefix: key.keyPrefix,
    last_used_at: key.lastUsedAt?.toISOString() || null,
    created_at: key.createdAt.toISOString(),
    is_active: key.isActive,
  }))

  return NextResponse.json({ apiKeys: formattedKeys })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const keyId = searchParams.get('keyId')

  if (!keyId) {
    return NextResponse.json({ error: 'Key ID is required' }, { status: 400 })
  }

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
    include: {
      organization: {
        include: {
          projects: {
            where: { id: projectId },
          },
        },
      },
    },
  })

  if (!membership || membership.organization.projects.length === 0) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  try {
    await prisma.apiKey.delete({
      where: { id: keyId, projectId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete API key:', error)
    return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 })
  }
}
