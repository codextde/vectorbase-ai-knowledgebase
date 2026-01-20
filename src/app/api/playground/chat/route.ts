import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { generateEmbedding } from '@/lib/embeddings'
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

interface ChatRequest {
  projectId: string
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
}

const DEFAULT_SYSTEM_PROMPT = `You are a helpful AI assistant. Answer questions based on the provided context. 
If you cannot find the answer in the context, say so politely. 
Always be accurate and cite information from the context when possible.`

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json() as ChatRequest
    const { projectId, messages } = body

    if (!projectId || !messages || messages.length === 0) {
      return NextResponse.json({ error: 'Project ID and messages are required' }, { status: 400 })
    }

    const membership = await prisma.organizationMember.findFirst({
      where: { userId: user.id },
      include: { organization: { include: { projects: { where: { id: projectId } } } } },
    })

    if (!membership || membership.organization.projects.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const project = membership.organization.projects[0]
    const projectSettings = project.settings as Record<string, unknown> || {}
    const systemPrompt = (projectSettings.system_prompt as string) || DEFAULT_SYSTEM_PROMPT

    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')
    if (!lastUserMessage) {
      return NextResponse.json({ error: 'No user message found' }, { status: 400 })
    }

    const queryEmbedding = await generateEmbedding(lastUserMessage.content)
    const embeddingString = `[${queryEmbedding.join(',')}]`

    const relevantChunks = await prisma.$queryRawUnsafe<Array<{
      id: string
      content: string
      metadata: Record<string, unknown>
      similarity: number
      source_id: string
    }>>(
      `SELECT 
        id,
        content,
        metadata,
        (1 - (embedding <=> $1::vector))::float as similarity,
        source_id
      FROM chunks
      WHERE project_id = $2::uuid
        AND embedding IS NOT NULL
        AND 1 - (embedding <=> $1::vector) > 0.5
      ORDER BY embedding <=> $1::vector
      LIMIT 5`,
      embeddingString,
      projectId
    )

    const context = relevantChunks
      .map((chunk: { content: string }, i: number) => `[${i + 1}] ${chunk.content}`)
      .join('\n\n')

    const augmentedSystemPrompt = context
      ? `${systemPrompt}\n\n---\nRelevant Context:\n${context}\n---\n\nUse the context above to answer questions accurately. If the context doesn't contain the answer, say so.`
      : `${systemPrompt}\n\nNote: No relevant context was found in the knowledge base for this query.`

    const chatMessages = [
      { role: 'system' as const, content: augmentedSystemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ]

    const result = streamText({
      model: openai('gpt-4o-mini'),
      messages: chatMessages,
      temperature: 0.7,
      maxOutputTokens: 1000,
    })

    const fullResponse = await result.text

    await prisma.usageRecord.create({
      data: {
        organizationId: membership.organizationId,
        projectId,
        type: 'message',
        amount: 1,
        metadata: { source: 'playground' },
      },
    })

    return NextResponse.json({
      message: fullResponse,
      sources: relevantChunks.map((c: { id: string; content: string; similarity: number }) => ({
        id: c.id,
        content: c.content.substring(0, 200) + (c.content.length > 200 ? '...' : ''),
        similarity: c.similarity,
      })),
    })
  } catch (error) {
    console.error('Playground chat error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
