import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchSitemapUrls } from '@/lib/sitemap-parser'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { sitemapUrl, includePaths, excludePaths } = body

    if (!sitemapUrl) {
      return NextResponse.json({ error: 'Sitemap URL is required' }, { status: 400 })
    }

    try {
      new URL(sitemapUrl)
    } catch {
      return NextResponse.json({ error: 'Invalid sitemap URL' }, { status: 400 })
    }

    const result = await fetchSitemapUrls(sitemapUrl, {
      includePaths: includePaths || [],
      excludePaths: excludePaths || [],
      maxUrls: 500,
    })

    if (result.errors.length > 0 && result.urls.length === 0) {
      return NextResponse.json(
        { error: `Failed to fetch sitemap: ${result.errors[0].error}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      urls: result.urls.map((u) => u.loc),
      sitemapsProcessed: result.sitemapsProcessed,
      errors: result.errors,
    })
  } catch (error) {
    console.error('Fetch sitemap error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch sitemap' },
      { status: 500 }
    )
  }
}
