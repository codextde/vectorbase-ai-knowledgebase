import { prisma } from '@/lib/prisma'
import { generateEmbeddings, EMBEDDING_MODEL } from '@/lib/embeddings'
import { splitTextIntoChunks, estimateTokenCount } from '@/lib/chunking'
import { loadDocument } from '@/lib/document-loaders'
import { createClient } from '@/lib/supabase/server'

interface ProcessingResult {
  success: boolean
  chunksCreated: number
  totalTokens: number
  error?: string
}

export interface ProcessingOptions {
  maxDepth?: number
  maxPages?: number
}

export async function processSourceWithPrisma(
  sourceId: string,
  options: ProcessingOptions = {}
): Promise<ProcessingResult> {
  const source = await prisma.source.findUnique({
    where: { id: sourceId },
    include: {
      sourceText: true,
      sourceQa: true,
      sourceWebsite: true,
      sourceDocument: true,
      sourceNotion: {
        include: {
          pages: true,
        },
      },
    },
  })

  if (!source) {
    return { success: false, chunksCreated: 0, totalTokens: 0, error: 'Source not found' }
  }

  await prisma.source.update({
    where: { id: sourceId },
    data: { status: 'processing' },
  })

  try {
    let result: ProcessingResult

    switch (source.type) {
      case 'text':
        result = await processTextSourcePrisma(source)
        break
      case 'qa':
        result = await processQASourcePrisma(source)
        break
      case 'website':
        result = await processWebsiteSourcePrisma(source, options)
        break
      case 'document':
        result = await processDocumentSourcePrisma(source)
        break
      case 'notion':
        result = await processNotionSourcePrisma(source)
        break
      default:
        result = { success: false, chunksCreated: 0, totalTokens: 0, error: `Unsupported source type: ${source.type}` }
    }

    if (result.success) {
      await prisma.source.update({
        where: { id: sourceId },
        data: {
          status: 'completed',
          chunksCount: result.chunksCreated,
          tokensCount: result.totalTokens,
          errorMessage: null,
        },
      })
    } else {
      await prisma.source.update({
        where: { id: sourceId },
        data: {
          status: 'failed',
          errorMessage: result.error,
        },
      })
    }

    return result
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    await prisma.source.update({
      where: { id: sourceId },
      data: {
        status: 'failed',
        errorMessage,
      },
    })

    return { success: false, chunksCreated: 0, totalTokens: 0, error: errorMessage }
  }
}

async function processTextSourcePrisma(source: {
  id: string
  projectId: string
  name: string
  type: string
  sourceText: { content: string } | null
}): Promise<ProcessingResult> {
  if (!source.sourceText) {
    return { success: false, chunksCreated: 0, totalTokens: 0, error: 'Source text not found' }
  }

  const chunks = splitTextIntoChunks(source.sourceText.content)
  
  if (chunks.length === 0) {
    return { success: false, chunksCreated: 0, totalTokens: 0, error: 'No content to process' }
  }

  const chunkContents = chunks.map(c => c.content)
  const embeddings = await generateEmbeddings(chunkContents)

  let totalTokens = 0
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    const tokens = estimateTokenCount(chunk.content)
    totalTokens += tokens

    await prisma.$executeRawUnsafe(`
      INSERT INTO chunks (id, source_id, project_id, content, metadata, embedding_model, embedding, tokens_count, created_at)
      VALUES (
        gen_random_uuid(),
        $1::uuid,
        $2::uuid,
        $3,
        $4::jsonb,
        $5,
        $6::vector,
        $7,
        NOW()
      )
    `,
      source.id,
      source.projectId,
      chunk.content,
      JSON.stringify({
        source_name: source.name,
        source_type: source.type,
        chunk_index: chunk.metadata.chunkIndex,
        start_char: chunk.metadata.startChar,
        end_char: chunk.metadata.endChar,
      }),
      EMBEDDING_MODEL,
      `[${embeddings[i].join(',')}]`,
      tokens
    )
  }

  return { success: true, chunksCreated: chunks.length, totalTokens }
}

async function processQASourcePrisma(source: {
  id: string
  projectId: string
  name: string
  type: string
  sourceQa: { question: string; answer: string } | null
}): Promise<ProcessingResult> {
  if (!source.sourceQa) {
    return { success: false, chunksCreated: 0, totalTokens: 0, error: 'Source Q&A not found' }
  }

  const combinedContent = `Question: ${source.sourceQa.question}\n\nAnswer: ${source.sourceQa.answer}`
  const tokens = estimateTokenCount(combinedContent)
  
  const embeddings = await generateEmbeddings([combinedContent])

  await prisma.$executeRawUnsafe(`
    INSERT INTO chunks (id, source_id, project_id, content, metadata, embedding_model, embedding, tokens_count, created_at)
    VALUES (
      gen_random_uuid(),
      $1::uuid,
      $2::uuid,
      $3,
      $4::jsonb,
      $5,
      $6::vector,
      $7,
      NOW()
    )
  `,
    source.id,
    source.projectId,
    combinedContent,
    JSON.stringify({
      source_name: source.name,
      source_type: source.type,
      question: source.sourceQa.question,
      answer: source.sourceQa.answer,
    }),
    EMBEDDING_MODEL,
    `[${embeddings[0].join(',')}]`,
    tokens
  )

  return { success: true, chunksCreated: 1, totalTokens: tokens }
}

interface WebsiteProcessingOptions {
  maxDepth?: number
  maxPages?: number
}

interface SourceWebsiteData {
  url: string
  crawlType: string
  includePaths: string[]
  excludePaths: string[]
  slowScraping?: boolean
}

async function processWebsiteSourcePrisma(
  source: {
    id: string
    projectId: string
    name: string
    type: string
    sourceWebsite: SourceWebsiteData | null
  },
  options: WebsiteProcessingOptions = {}
): Promise<ProcessingResult> {
  if (!source.sourceWebsite) {
    return { success: false, chunksCreated: 0, totalTokens: 0, error: 'Source website not found' }
  }

  const { crawlType } = source.sourceWebsite

  const sourceWithWebsite = {
    ...source,
    sourceWebsite: source.sourceWebsite!,
  }

  if (crawlType === 'sitemap') {
    return processSitemapSource(sourceWithWebsite)
  } else if (crawlType === 'single') {
    return processSingleUrlSource(sourceWithWebsite)
  } else {
    return processCrawlSource(sourceWithWebsite, options)
  }
}

async function processSitemapSource(source: {
  id: string
  projectId: string
  name: string
  type: string
  sourceWebsite: SourceWebsiteData
}): Promise<ProcessingResult> {
  const links = await prisma.websiteLink.findMany({
    where: {
      sourceWebsiteId: source.id,
      isExcluded: false,
    },
  })

  if (links.length === 0) {
    return { success: false, chunksCreated: 0, totalTokens: 0, error: 'No links to process' }
  }

  const { crawlSinglePage } = await import('@/lib/crawler')
  let totalChunks = 0
  let totalTokens = 0
  let successfulPages = 0

  for (const link of links) {
    try {
      await prisma.websiteLink.update({
        where: { id: link.id },
        data: { status: 'processing' },
      })

      const page = await crawlSinglePage(link.url, {
        pageTimeout: 30000,
        waitForIdle: true,
      })

      if (!page || !page.content) {
        await prisma.websiteLink.update({
          where: { id: link.id },
          data: {
            status: 'failed',
            errorMessage: 'No content extracted',
          },
        })
        continue
      }

      const content = `# ${page.title}\nSource: ${page.url}\n\n${page.content}`
      const chunks = splitTextIntoChunks(content)

      if (chunks.length === 0) {
        await prisma.websiteLink.update({
          where: { id: link.id },
          data: {
            status: 'failed',
            errorMessage: 'No chunks created',
          },
        })
        continue
      }

      const chunkContents = chunks.map((c) => c.content)
      const embeddings = await generateEmbeddings(chunkContents)

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]
        const tokens = estimateTokenCount(chunk.content)
        totalTokens += tokens

        await prisma.$executeRawUnsafe(
          `
          INSERT INTO chunks (id, source_id, project_id, content, metadata, embedding_model, embedding, tokens_count, created_at)
          VALUES (
            gen_random_uuid(),
            $1::uuid,
            $2::uuid,
            $3,
            $4::jsonb,
            $5,
            $6::vector,
            $7,
            NOW()
          )
        `,
          source.id,
          source.projectId,
          chunk.content,
          JSON.stringify({
            source_name: source.name,
            source_type: source.type,
            source_url: link.url,
            link_id: link.id,
            chunk_index: chunk.metadata.chunkIndex,
          }),
          EMBEDDING_MODEL,
          `[${embeddings[i].join(',')}]`,
          tokens
        )
      }

      totalChunks += chunks.length
      successfulPages++

      await prisma.websiteLink.update({
        where: { id: link.id },
        data: {
          status: 'completed',
          title: page.title,
          contentSize: page.content.length,
          lastCrawledAt: new Date(),
          errorMessage: null,
        },
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await prisma.websiteLink.update({
        where: { id: link.id },
        data: {
          status: 'failed',
          errorMessage,
        },
      })
    }
  }

  if (successfulPages === 0) {
    return { success: false, chunksCreated: 0, totalTokens: 0, error: 'No pages successfully crawled' }
  }

  await prisma.sourceWebsite.update({
    where: { id: source.id },
    data: {
      pagesCrawled: successfulPages,
      lastCrawledAt: new Date(),
    },
  })

  return { success: true, chunksCreated: totalChunks, totalTokens }
}

async function processSingleUrlSource(source: {
  id: string
  projectId: string
  name: string
  type: string
  sourceWebsite: SourceWebsiteData
}): Promise<ProcessingResult> {
  const { crawlSinglePage } = await import('@/lib/crawler')

  const page = await crawlSinglePage(source.sourceWebsite.url, {
    pageTimeout: 30000,
    waitForIdle: true,
  })

  if (!page || !page.content) {
    return { success: false, chunksCreated: 0, totalTokens: 0, error: 'No content extracted from page' }
  }

  const content = `# ${page.title}\nSource: ${page.url}\n\n${page.content}`
  const chunks = splitTextIntoChunks(content)

  if (chunks.length === 0) {
    return { success: false, chunksCreated: 0, totalTokens: 0, error: 'No chunks created from content' }
  }

  const chunkContents = chunks.map((c) => c.content)
  const embeddings = await generateEmbeddings(chunkContents)

  let totalTokens = 0

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    const tokens = estimateTokenCount(chunk.content)
    totalTokens += tokens

    await prisma.$executeRawUnsafe(
      `
      INSERT INTO chunks (id, source_id, project_id, content, metadata, embedding_model, embedding, tokens_count, created_at)
      VALUES (
        gen_random_uuid(),
        $1::uuid,
        $2::uuid,
        $3,
        $4::jsonb,
        $5,
        $6::vector,
        $7,
        NOW()
      )
    `,
      source.id,
      source.projectId,
      chunk.content,
      JSON.stringify({
        source_name: source.name,
        source_type: source.type,
        source_url: source.sourceWebsite.url,
        chunk_index: chunk.metadata.chunkIndex,
      }),
      EMBEDDING_MODEL,
      `[${embeddings[i].join(',')}]`,
      tokens
    )
  }

  await prisma.sourceWebsite.update({
    where: { id: source.id },
    data: {
      pagesCrawled: 1,
      lastCrawledAt: new Date(),
    },
  })

  return { success: true, chunksCreated: chunks.length, totalTokens }
}

async function processCrawlSource(
  source: {
    id: string
    projectId: string
    name: string
    type: string
    sourceWebsite: SourceWebsiteData
  },
  options: WebsiteProcessingOptions
): Promise<ProcessingResult> {
  const { maxDepth = 2, maxPages = 10 } = options

  try {
    const { crawlWebsite } = await import('@/lib/crawler')

    const crawlResult = await crawlWebsite(source.sourceWebsite.url, {
      maxDepth,
      maxPages,
      sameDomainOnly: true,
      pageTimeout: 30000,
      waitForIdle: true,
    })

    if (crawlResult.pages.length === 0) {
      return { success: false, chunksCreated: 0, totalTokens: 0, error: 'No pages successfully crawled' }
    }

    const allContent = crawlResult.pages
      .map((page) => {
        const header = `# ${page.title}\nSource: ${page.url}\n\n`
        return header + page.content
      })
      .join('\n\n---\n\n')

    const chunks = splitTextIntoChunks(allContent)

    if (chunks.length === 0) {
      return { success: false, chunksCreated: 0, totalTokens: 0, error: 'No chunks created from website content' }
    }

    const chunkContents = chunks.map((c) => c.content)
    const embeddings = await generateEmbeddings(chunkContents)

    let totalTokens = 0

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      const tokens = estimateTokenCount(chunk.content)
      totalTokens += tokens

      await prisma.$executeRawUnsafe(
        `
        INSERT INTO chunks (id, source_id, project_id, content, metadata, embedding_model, embedding, tokens_count, created_at)
        VALUES (
          gen_random_uuid(),
          $1::uuid,
          $2::uuid,
          $3,
          $4::jsonb,
          $5,
          $6::vector,
          $7,
          NOW()
        )
      `,
        source.id,
        source.projectId,
        chunk.content,
        JSON.stringify({
          source_name: source.name,
          source_type: source.type,
          source_url: source.sourceWebsite.url,
          chunk_index: chunk.metadata.chunkIndex,
          pages_crawled: crawlResult.pages.length,
        }),
        EMBEDDING_MODEL,
        `[${embeddings[i].join(',')}]`,
        tokens
      )
    }

    await prisma.sourceWebsite.update({
      where: { id: source.id },
      data: {
        pagesCrawled: crawlResult.pages.length,
        lastCrawledAt: new Date(),
      },
    })

    return { success: true, chunksCreated: chunks.length, totalTokens }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to crawl website'
    return { success: false, chunksCreated: 0, totalTokens: 0, error: errorMessage }
  }
}

async function processDocumentSourcePrisma(source: {
  id: string
  projectId: string
  name: string
  type: string
  sourceDocument: { fileName: string; fileType: string; storagePath: string } | null
}): Promise<ProcessingResult> {
  if (!source.sourceDocument) {
    return { success: false, chunksCreated: 0, totalTokens: 0, error: 'Source document not found' }
  }

  try {
    const supabase = await createClient()
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(source.sourceDocument.storagePath)

    if (downloadError || !fileData) {
      return { success: false, chunksCreated: 0, totalTokens: 0, error: 'Failed to download document' }
    }

    const buffer = Buffer.from(await fileData.arrayBuffer())
    const loadedDoc = await loadDocument(buffer, source.sourceDocument.fileName, source.sourceDocument.fileType)

    if (!loadedDoc.content || loadedDoc.content.trim().length === 0) {
      return { success: false, chunksCreated: 0, totalTokens: 0, error: 'No content extracted from document' }
    }

    const chunks = splitTextIntoChunks(loadedDoc.content)
    
    if (chunks.length === 0) {
      return { success: false, chunksCreated: 0, totalTokens: 0, error: 'No chunks created from document' }
    }

    const chunkContents = chunks.map(c => c.content)
    const embeddings = await generateEmbeddings(chunkContents)

    let totalTokens = 0
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      const tokens = estimateTokenCount(chunk.content)
      totalTokens += tokens

      await prisma.$executeRawUnsafe(`
        INSERT INTO chunks (id, source_id, project_id, content, metadata, embedding_model, embedding, tokens_count, created_at)
        VALUES (
          gen_random_uuid(),
          $1::uuid,
          $2::uuid,
          $3,
          $4::jsonb,
          $5,
          $6::vector,
          $7,
          NOW()
        )
      `,
        source.id,
        source.projectId,
        chunk.content,
        JSON.stringify({
          source_name: source.name,
          source_type: source.type,
          file_name: source.sourceDocument!.fileName,
          file_type: source.sourceDocument!.fileType,
          chunk_index: chunk.metadata.chunkIndex,
          page_count: loadedDoc.metadata.pageCount,
        }),
        EMBEDDING_MODEL,
        `[${embeddings[i].join(',')}]`,
        tokens
      )
    }

    return { success: true, chunksCreated: chunks.length, totalTokens }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to process document'
    return { success: false, chunksCreated: 0, totalTokens: 0, error: errorMessage }
  }
}

interface SourceNotionData {
  accessTokenEncrypted: string | null
  notionWorkspaceId: string | null
  notionWorkspaceName: string | null
  syncStatus: string
  pages: {
    id: string
    notionPageId: string
    title: string | null
    pageType: string
    status: string
    isExcluded: boolean
  }[]
}

async function processNotionSourcePrisma(source: {
  id: string
  projectId: string
  name: string
  type: string
  sourceNotion: SourceNotionData | null
}): Promise<ProcessingResult> {
  if (!source.sourceNotion) {
    return { success: false, chunksCreated: 0, totalTokens: 0, error: 'No Notion configuration found' }
  }

  if (!source.sourceNotion.accessTokenEncrypted) {
    return { success: false, chunksCreated: 0, totalTokens: 0, error: 'No Notion access token found' }
  }

  const { decryptToken, fetchPageContent, fetchDatabaseContent } = await import('@/lib/notion')

  let accessToken: string
  try {
    accessToken = decryptToken(source.sourceNotion.accessTokenEncrypted)
  } catch {
    return { success: false, chunksCreated: 0, totalTokens: 0, error: 'Failed to decrypt Notion token' }
  }

  const pages = source.sourceNotion.pages.filter(p => !p.isExcluded)

  if (pages.length === 0) {
    return { success: false, chunksCreated: 0, totalTokens: 0, error: 'No pages to process' }
  }

  let totalChunks = 0
  let totalTokens = 0
  let successfulPages = 0

  for (const page of pages) {
    try {
      await prisma.notionPage.update({
        where: { id: page.id },
        data: { status: 'processing' },
      })

      let content: { title: string; content: string; lastEditedTime: string }

      if (page.pageType === 'database') {
        content = await fetchDatabaseContent(accessToken, page.notionPageId)
      } else {
        content = await fetchPageContent(accessToken, page.notionPageId)
      }

      if (!content.content || content.content.trim().length === 0) {
        await prisma.notionPage.update({
          where: { id: page.id },
          data: {
            status: 'failed',
            errorMessage: 'No content extracted',
          },
        })
        continue
      }

      const fullContent = `# ${content.title}\nSource: Notion (${page.pageType})\n\n${content.content}`
      const chunks = splitTextIntoChunks(fullContent)

      if (chunks.length === 0) {
        await prisma.notionPage.update({
          where: { id: page.id },
          data: {
            status: 'failed',
            errorMessage: 'No chunks created',
          },
        })
        continue
      }

      const chunkContents = chunks.map(c => c.content)
      const embeddings = await generateEmbeddings(chunkContents)

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]
        const tokens = estimateTokenCount(chunk.content)
        totalTokens += tokens

        await prisma.$executeRawUnsafe(`
          INSERT INTO chunks (id, source_id, project_id, content, metadata, embedding_model, embedding, tokens_count, created_at)
          VALUES (
            gen_random_uuid(),
            $1::uuid,
            $2::uuid,
            $3,
            $4::jsonb,
            $5,
            $6::vector,
            $7,
            NOW()
          )
        `,
          source.id,
          source.projectId,
          chunk.content,
          JSON.stringify({
            source_name: source.name,
            source_type: source.type,
            notion_page_id: page.notionPageId,
            notion_page_title: content.title,
            page_type: page.pageType,
            chunk_index: chunk.metadata.chunkIndex,
          }),
          EMBEDDING_MODEL,
          `[${embeddings[i].join(',')}]`,
          tokens
        )
      }

      totalChunks += chunks.length
      successfulPages++

      await prisma.notionPage.update({
        where: { id: page.id },
        data: {
          status: 'completed',
          title: content.title,
          contentSize: content.content.length,
          lastSyncedAt: new Date(),
          errorMessage: null,
        },
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await prisma.notionPage.update({
        where: { id: page.id },
        data: {
          status: 'failed',
          errorMessage,
        },
      })
    }
  }

  if (successfulPages === 0) {
    return { success: false, chunksCreated: 0, totalTokens: 0, error: 'No pages successfully processed' }
  }

  await prisma.sourceNotion.update({
    where: { id: source.id },
    data: {
      syncStatus: 'completed',
      lastSyncedAt: new Date(),
    },
  })

  return { success: true, chunksCreated: totalChunks, totalTokens }
}
