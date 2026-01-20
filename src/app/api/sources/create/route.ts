import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { processSourceWithPrisma } from '@/lib/processing-prisma'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      projectId,
      type,
      name,
      content,
      question,
      answer,
      url,
      storagePath,
      fileName,
      fileType,
      fileSize,
      originalName,
      crawlType,
      includePaths,
      excludePaths,
      slowScraping,
      maxDepth,
      maxPages,
      links,
    } = body

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const membership = await prisma.organizationMember.findFirst({
      where: { userId: user.id, organizationId: project.organizationId },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    let source: { id: string; name: string; type: string }

    if (type === 'text') {
      source = await prisma.source.create({
        data: {
          projectId,
          type: 'text',
          name,
          status: 'pending',
        },
      })

      await prisma.sourceText.create({
        data: { id: source.id, content },
      })
    } else if (type === 'qa') {
      source = await prisma.source.create({
        data: {
          projectId,
          type: 'qa',
          name: name || question.substring(0, 50) + (question.length > 50 ? '...' : ''),
          status: 'pending',
        },
      })

      await prisma.sourceQa.create({
        data: { id: source.id, question, answer },
      })
    } else if (type === 'website') {
      const websiteCrawlType = crawlType || 'single'
      
      source = await prisma.source.create({
        data: {
          projectId,
          type: 'website',
          name: name || new URL(url).hostname,
          status: 'pending',
        },
      })

      await prisma.sourceWebsite.create({
        data: {
          id: source.id,
          url,
          crawlType: websiteCrawlType,
          includePaths: includePaths || [],
          excludePaths: excludePaths || [],
          slowScraping: slowScraping || false,
        },
      })

      if (websiteCrawlType === 'sitemap' && links && Array.isArray(links)) {
        await prisma.websiteLink.createMany({
          data: links.map((linkUrl: string) => ({
            sourceWebsiteId: source.id,
            url: linkUrl,
            status: 'pending',
          })),
        })
      }
    } else if (type === 'document') {
      source = await prisma.source.create({
        data: {
          projectId,
          type: 'document',
          name: fileName,
          status: 'pending',
        },
      })

      await prisma.sourceDocument.create({
        data: { 
          id: source.id, 
          fileName,
          fileType,
          fileSize,
          storagePath,
          originalName,
        },
      })
    } else {
      return NextResponse.json({ error: 'Invalid source type' }, { status: 400 })
    }

    const processingOptions = type === 'website' ? { maxDepth, maxPages } : {}
    processSourceWithPrisma(source.id, processingOptions).catch(console.error)

    return NextResponse.json({ 
      success: true, 
      source: { id: source.id, name: source.name, type: source.type } 
    })
  } catch (error) {
    console.error('Create source error:', error)
    return NextResponse.json({ error: 'Failed to create source' }, { status: 500 })
  }
}
