import { createAdminClient } from '@/lib/supabase/admin'
import { generateEmbeddings, EMBEDDING_MODEL } from '@/lib/embeddings'
import { splitTextIntoChunks, estimateTokenCount } from '@/lib/chunking'
import { loadDocument } from '@/lib/document-loaders'
import type { Source, SourceText, SourceQA, SourceWebsite, SourceDocument } from '@/types/database'

interface ProcessingResult {
  success: boolean
  chunksCreated: number
  totalTokens: number
  error?: string
}

export async function processSource(sourceId: string): Promise<ProcessingResult> {
  const supabase = createAdminClient()
  
  const { data: source, error: sourceError } = await supabase
    .from('sources')
    .select('*')
    .eq('id', sourceId)
    .single() as { data: Source | null; error: Error | null }

  if (sourceError || !source) {
    return { success: false, chunksCreated: 0, totalTokens: 0, error: 'Source not found' }
  }

  await supabase
    .from('sources')
    .update({ status: 'processing' as const } as never)
    .eq('id', sourceId)

  try {
    let result: ProcessingResult

    switch (source.type) {
      case 'text':
        result = await processTextSource(source)
        break
      case 'qa':
        result = await processQASource(source)
        break
      case 'website':
        result = await processWebsiteSource(source)
        break
      case 'document':
        result = await processDocumentSource(source)
        break
      default:
        result = { success: false, chunksCreated: 0, totalTokens: 0, error: `Unsupported source type: ${source.type}` }
    }

    if (result.success) {
      await supabase
        .from('sources')
        .update({
          status: 'completed' as const,
          chunks_count: result.chunksCreated,
          tokens_count: result.totalTokens,
        } as never)
        .eq('id', sourceId)
    } else {
      await supabase
        .from('sources')
        .update({
          status: 'failed' as const,
          error_message: result.error,
        } as never)
        .eq('id', sourceId)
    }

    return result
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    await supabase
      .from('sources')
      .update({
        status: 'failed' as const,
        error_message: errorMessage,
      } as never)
      .eq('id', sourceId)

    return { success: false, chunksCreated: 0, totalTokens: 0, error: errorMessage }
  }
}

async function processTextSource(source: Source): Promise<ProcessingResult> {
  const supabase = createAdminClient()
  
  const { data: sourceText, error } = await supabase
    .from('source_texts')
    .select('*')
    .eq('id', source.id)
    .single() as { data: SourceText | null; error: Error | null }

  if (error || !sourceText) {
    return { success: false, chunksCreated: 0, totalTokens: 0, error: 'Source text not found' }
  }

  const chunks = splitTextIntoChunks(sourceText.content)
  
  if (chunks.length === 0) {
    return { success: false, chunksCreated: 0, totalTokens: 0, error: 'No content to process' }
  }

  const chunkContents = chunks.map(c => c.content)
  const embeddings = await generateEmbeddings(chunkContents)

  let totalTokens = 0
  const chunkRecords = chunks.map((chunk, index) => {
    const tokens = estimateTokenCount(chunk.content)
    totalTokens += tokens
    
    return {
      source_id: source.id,
      project_id: source.project_id,
      content: chunk.content,
      metadata: {
        source_name: source.name,
        source_type: source.type,
        chunk_index: chunk.metadata.chunkIndex,
        start_char: chunk.metadata.startChar,
        end_char: chunk.metadata.endChar,
      },
      embedding_model: EMBEDDING_MODEL,
      embedding: embeddings[index],
      tokens_count: tokens,
    }
  })

  const { error: insertError } = await supabase
    .from('chunks')
    .insert(chunkRecords as never[])

  if (insertError) {
    return { success: false, chunksCreated: 0, totalTokens: 0, error: insertError.message }
  }

  return { success: true, chunksCreated: chunks.length, totalTokens }
}

async function processQASource(source: Source): Promise<ProcessingResult> {
  const supabase = createAdminClient()
  
  const { data: sourceQA, error } = await supabase
    .from('source_qa')
    .select('*')
    .eq('id', source.id)
    .single() as { data: SourceQA | null; error: Error | null }

  if (error || !sourceQA) {
    return { success: false, chunksCreated: 0, totalTokens: 0, error: 'Source Q&A not found' }
  }

  const combinedContent = `Question: ${sourceQA.question}\n\nAnswer: ${sourceQA.answer}`
  const tokens = estimateTokenCount(combinedContent)
  
  const embeddings = await generateEmbeddings([combinedContent])

  const chunkRecord = {
    source_id: source.id,
    project_id: source.project_id,
    content: combinedContent,
    metadata: {
      source_name: source.name,
      source_type: source.type,
      question: sourceQA.question,
      answer: sourceQA.answer,
    },
    embedding_model: EMBEDDING_MODEL,
    embedding: embeddings[0],
    tokens_count: tokens,
  }

  const { error: insertError } = await supabase
    .from('chunks')
    .insert(chunkRecord as never)

  if (insertError) {
    return { success: false, chunksCreated: 0, totalTokens: 0, error: insertError.message }
  }

  return { success: true, chunksCreated: 1, totalTokens: tokens }
}

async function processWebsiteSource(source: Source): Promise<ProcessingResult> {
  const supabase = createAdminClient()
  
  const { data: sourceWebsite, error } = await supabase
    .from('source_websites')
    .select('*')
    .eq('id', source.id)
    .single() as { data: SourceWebsite | null; error: Error | null }

  if (error || !sourceWebsite) {
    return { success: false, chunksCreated: 0, totalTokens: 0, error: 'Source website not found' }
  }

  try {
    const content = await fetchWebsiteContent(sourceWebsite.url)
    
    if (!content || content.trim().length === 0) {
      return { success: false, chunksCreated: 0, totalTokens: 0, error: 'No content extracted from website' }
    }

    const chunks = splitTextIntoChunks(content)
    
    if (chunks.length === 0) {
      return { success: false, chunksCreated: 0, totalTokens: 0, error: 'No chunks created from website content' }
    }

    const chunkContents = chunks.map(c => c.content)
    const embeddings = await generateEmbeddings(chunkContents)

    let totalTokens = 0
    const chunkRecords = chunks.map((chunk, index) => {
      const tokens = estimateTokenCount(chunk.content)
      totalTokens += tokens
      
      return {
        source_id: source.id,
        project_id: source.project_id,
        content: chunk.content,
        metadata: {
          source_name: source.name,
          source_type: source.type,
          source_url: sourceWebsite.url,
          chunk_index: chunk.metadata.chunkIndex,
        },
        embedding_model: EMBEDDING_MODEL,
        embedding: embeddings[index],
        tokens_count: tokens,
      }
    })

    const { error: insertError } = await supabase
      .from('chunks')
      .insert(chunkRecords as never[])

    if (insertError) {
      return { success: false, chunksCreated: 0, totalTokens: 0, error: insertError.message }
    }

    await supabase
      .from('source_websites')
      .update({
        pages_crawled: 1,
        last_crawled_at: new Date().toISOString(),
      } as never)
      .eq('id', source.id)

    return { success: true, chunksCreated: chunks.length, totalTokens }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch website'
    return { success: false, chunksCreated: 0, totalTokens: 0, error: errorMessage }
  }
}

async function fetchWebsiteContent(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'VectorBase-Bot/1.0 (Knowledge Base Crawler)',
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const html = await response.text()
  return extractTextFromHTML(html)
}

function extractTextFromHTML(html: string): string {
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
  
  text = text.replace(/<[^>]+>/g, ' ')
  text = text.replace(/&nbsp;/g, ' ')
  text = text.replace(/&amp;/g, '&')
  text = text.replace(/&lt;/g, '<')
  text = text.replace(/&gt;/g, '>')
  text = text.replace(/&quot;/g, '"')
  text = text.replace(/&#39;/g, "'")
  text = text.replace(/\s+/g, ' ')
  
  return text.trim()
}

async function processDocumentSource(source: Source): Promise<ProcessingResult> {
  const supabase = createAdminClient()
  
  const { data: sourceDoc, error } = await supabase
    .from('source_documents')
    .select('*')
    .eq('id', source.id)
    .single() as { data: SourceDocument | null; error: Error | null }

  if (error || !sourceDoc) {
    return { success: false, chunksCreated: 0, totalTokens: 0, error: 'Source document not found' }
  }

  try {
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(sourceDoc.storage_path)

    if (downloadError || !fileData) {
      return { success: false, chunksCreated: 0, totalTokens: 0, error: 'Failed to download document' }
    }

    const buffer = Buffer.from(await fileData.arrayBuffer())
    const loadedDoc = await loadDocument(buffer, sourceDoc.file_name, sourceDoc.file_type)

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
    const chunkRecords = chunks.map((chunk, index) => {
      const tokens = estimateTokenCount(chunk.content)
      totalTokens += tokens
      
      return {
        source_id: source.id,
        project_id: source.project_id,
        content: chunk.content,
        metadata: {
          source_name: source.name,
          source_type: source.type,
          file_name: sourceDoc.file_name,
          file_type: sourceDoc.file_type,
          chunk_index: chunk.metadata.chunkIndex,
          page_count: loadedDoc.metadata.pageCount,
        },
        embedding_model: EMBEDDING_MODEL,
        embedding: embeddings[index],
        tokens_count: tokens,
      }
    })

    const { error: insertError } = await supabase
      .from('chunks')
      .insert(chunkRecords as never[])

    if (insertError) {
      return { success: false, chunksCreated: 0, totalTokens: 0, error: insertError.message }
    }

    return { success: true, chunksCreated: chunks.length, totalTokens }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to process document'
    return { success: false, chunksCreated: 0, totalTokens: 0, error: errorMessage }
  }
}

export async function processPendingSources(): Promise<{ processed: number; failed: number }> {
  const supabase = createAdminClient()
  
  const { data: pendingSources, error } = await supabase
    .from('sources')
    .select('id')
    .eq('status', 'pending')
    .limit(10) as { data: { id: string }[] | null; error: Error | null }

  if (error || !pendingSources) {
    return { processed: 0, failed: 0 }
  }

  let processed = 0
  let failed = 0

  for (const source of pendingSources) {
    const result = await processSource(source.id)
    if (result.success) {
      processed++
    } else {
      failed++
    }
  }

  return { processed, failed }
}
