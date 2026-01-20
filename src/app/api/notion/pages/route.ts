import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { getAccessiblePages, decryptToken } from '@/lib/notion'
import { processSourceWithPrisma } from '@/lib/processing-prisma'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const encryptedToken = searchParams.get('token')

  if (!encryptedToken) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 })
  }

  try {
    const accessToken = decryptToken(encryptedToken)
    const pages = await getAccessiblePages(accessToken)

    return NextResponse.json({ pages })
  } catch (error) {
    console.error('Error fetching Notion pages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Notion pages' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { projectId, workspaceId, workspaceName, encryptedToken, selectedPages } = body

    if (!projectId || !workspaceId || !encryptedToken || !selectedPages?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const membership = await prisma.organizationMember.findFirst({
      where: { userId: user.id },
    })

    if (!membership) {
      return NextResponse.json({ error: 'No organization found' }, { status: 403 })
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId: membership.organizationId,
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const source = await prisma.source.create({
      data: {
        projectId,
        type: 'notion',
        name: workspaceName || 'Notion Workspace',
        status: 'pending',
        autoRetrain: true,
        sourceNotion: {
          create: {
            notionWorkspaceId: workspaceId,
            notionWorkspaceName: workspaceName,
            accessTokenEncrypted: encryptedToken,
            syncStatus: 'pending',
          },
        },
      },
      include: {
        sourceNotion: true,
      },
    })

    for (const page of selectedPages) {
      await prisma.notionPage.create({
        data: {
          sourceNotionId: source.id,
          notionPageId: page.id,
          title: page.title,
          pageType: page.type,
          status: 'pending',
        },
      })
    }

    // Process the source directly instead of calling the API endpoint
    // This avoids auth issues since we're already authenticated here
    processSourceWithPrisma(source.id).catch((error) => {
      console.error('Error processing Notion source:', error)
    })

    return NextResponse.json({
      success: true,
      source: {
        id: source.id,
        name: source.name,
        pagesCount: selectedPages.length,
      },
    })
  } catch (error) {
    console.error('Error creating Notion source:', error)
    return NextResponse.json(
      { error: 'Failed to create Notion source' },
      { status: 500 }
    )
  }
}
