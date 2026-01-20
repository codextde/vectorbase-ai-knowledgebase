import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getNotionAuthUrl } from '@/lib/notion'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const projectId = searchParams.get('projectId')

  if (!projectId) {
    return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
  }

  const state = Buffer.from(JSON.stringify({
    userId: user.id,
    projectId,
    nonce: crypto.randomBytes(16).toString('hex'),
  })).toString('base64url')

  const authUrl = getNotionAuthUrl(state)

  return NextResponse.json({ authUrl })
}
