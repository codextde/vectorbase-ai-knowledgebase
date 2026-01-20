import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { exchangeCodeForToken, encryptToken } from '@/lib/notion'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    const errorUrl = new URL('/dashboard/projects', request.url)
    errorUrl.searchParams.set('notion_error', error)
    return NextResponse.redirect(errorUrl)
  }

  if (!code || !state) {
    const errorUrl = new URL('/dashboard/projects', request.url)
    errorUrl.searchParams.set('notion_error', 'missing_params')
    return NextResponse.redirect(errorUrl)
  }

  let stateData: { userId: string; projectId: string }
  try {
    stateData = JSON.parse(Buffer.from(state, 'base64url').toString())
  } catch {
    const errorUrl = new URL('/dashboard/projects', request.url)
    errorUrl.searchParams.set('notion_error', 'invalid_state')
    return NextResponse.redirect(errorUrl)
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user || user.id !== stateData.userId) {
    const errorUrl = new URL('/auth/login', request.url)
    return NextResponse.redirect(errorUrl)
  }

  try {
    const tokenData = await exchangeCodeForToken(code)

    const membership = await prisma.organizationMember.findFirst({
      where: { userId: user.id },
    })

    if (!membership) {
      throw new Error('No organization membership found')
    }

    const project = await prisma.project.findFirst({
      where: {
        id: stateData.projectId,
        organizationId: membership.organizationId,
      },
    })

    if (!project) {
      throw new Error('Project not found')
    }

    const encryptedToken = encryptToken(tokenData.access_token)

    const existingConnection = await prisma.source.findFirst({
      where: {
        projectId: stateData.projectId,
        type: 'notion',
        sourceNotion: {
          notionWorkspaceId: tokenData.workspace_id,
        },
      },
    })

    if (existingConnection) {
      await prisma.sourceNotion.update({
        where: { id: existingConnection.id },
        data: {
          accessTokenEncrypted: encryptedToken,
          notionWorkspaceName: tokenData.workspace_name,
        },
      })
    }

    const successUrl = new URL(`/dashboard/projects/${stateData.projectId}`, request.url)
    successUrl.searchParams.set('notion_connected', 'true')
    successUrl.searchParams.set('workspace_id', tokenData.workspace_id)
    successUrl.searchParams.set('workspace_name', tokenData.workspace_name)
    successUrl.searchParams.set('access_token', encryptedToken)
    return NextResponse.redirect(successUrl)

  } catch (err) {
    console.error('Notion callback error:', err)
    const errorUrl = new URL(`/dashboard/projects/${stateData.projectId}`, request.url)
    errorUrl.searchParams.set('notion_error', 'token_exchange_failed')
    return NextResponse.redirect(errorUrl)
  }
}
