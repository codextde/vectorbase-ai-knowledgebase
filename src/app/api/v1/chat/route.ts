import { NextRequest } from 'next/server'
import { authenticateApiKey } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { generateEmbedding } from '@/lib/embeddings'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit'
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

interface ChatRequest {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
  session_id?: string
  stream?: boolean
  model?: string
  temperature?: number
  max_tokens?: number
}

interface ChunkResult {
  id: string
  content: string
  metadata: unknown
  similarity: number
  source_id: string
}

const DEFAULT_SYSTEM_PROMPT = `You are a helpful AI assistant. Answer questions based on the provided context. 
If you cannot find the answer in the context, say so politely. 
Always be accurate and cite information from the context when possible.`

export async function POST(request: NextRequest) {
  const auth = await authenticateApiKey(request.headers.get('authorization'))
  
  if (!auth) {
    return new Response(JSON.stringify({ error: 'Invalid or missing API key' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const rateLimitResult = checkRateLimit(`chat:${auth.projectId}`)
  const rateLimitHeaders = getRateLimitHeaders(rateLimitResult)
  
  if (!rateLimitResult.allowed) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', ...rateLimitHeaders },
    })
  }

  try {
    const body = await request.json() as ChatRequest
    const { 
      messages, 
      session_id,
      stream = true,
      model = 'gpt-4o-mini',
      temperature = 0.7,
      max_tokens = 1000,
    } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages array is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')
    if (!lastUserMessage) {
      return new Response(JSON.stringify({ error: 'At least one user message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const project = await prisma.project.findUnique({
      where: { id: auth.projectId },
      select: { settings: true },
    })

    const projectSettings = (project?.settings || {}) as Record<string, unknown>
    const systemPrompt = (projectSettings.system_prompt as string) || DEFAULT_SYSTEM_PROMPT

    const queryEmbedding = await generateEmbedding(lastUserMessage.content)
    const embeddingString = `[${queryEmbedding.join(',')}]`

    const relevantChunks = await prisma.$queryRawUnsafe<ChunkResult[]>(`
      SELECT id, content, metadata, source_id,
        (1 - (embedding <=> $1::vector))::float as similarity
      FROM chunks
      WHERE project_id = $2::uuid
        AND embedding IS NOT NULL
        AND 1 - (embedding <=> $1::vector) > $3
      ORDER BY embedding <=> $1::vector
      LIMIT $4
    `, embeddingString, auth.projectId, 0.5, 5)

    const context = (relevantChunks || [])
      .map((chunk: ChunkResult, i: number) => `[${i + 1}] ${chunk.content}`)
      .join('\n\n')

    const augmentedSystemPrompt = context
      ? `${systemPrompt}\n\n---\nContext:\n${context}\n---`
      : systemPrompt

    const chatMessages = [
      { role: 'system' as const, content: augmentedSystemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ]

    if (stream) {
      const result = streamText({
        model: openai(model),
        messages: chatMessages,
        temperature,
        maxOutputTokens: max_tokens,
        onFinish: async ({ text, usage }) => {
          await prisma.usageRecord.create({
            data: {
              organizationId: auth.organizationId,
              projectId: auth.projectId,
              type: 'message',
              amount: usage?.totalTokens || 0,
              metadata: { 
                model,
                input_tokens: usage?.inputTokens,
                output_tokens: usage?.outputTokens,
              },
            },
          })

          if (session_id) {
            let conversation = await prisma.conversation.findFirst({
              where: { projectId: auth.projectId, sessionId: session_id },
            })

            if (!conversation) {
              conversation = await prisma.conversation.create({
                data: {
                  projectId: auth.projectId,
                  sessionId: session_id,
                },
              })
            }

            await prisma.message.createMany({
              data: [
                {
                  conversationId: conversation.id,
                  role: 'user',
                  content: lastUserMessage.content,
                  tokensUsed: usage?.inputTokens || 0,
                },
                {
                  conversationId: conversation.id,
                  role: 'assistant',
                  content: text,
                  sourcesUsed: (relevantChunks || []).map((c: ChunkResult) => c.id),
                  tokensUsed: usage?.outputTokens || 0,
                },
              ],
            })
          }
        },
      })

      return result.toTextStreamResponse()
    }

    const result = streamText({
      model: openai(model),
      messages: chatMessages,
      temperature,
      maxOutputTokens: max_tokens,
    })

    const fullResponse = await result.text

    await prisma.usageRecord.create({
      data: {
        organizationId: auth.organizationId,
        projectId: auth.projectId,
        type: 'message',
        amount: 1,
        metadata: { model },
      },
    })

    return new Response(JSON.stringify({
      message: fullResponse,
      sources: (relevantChunks || []).map((c: ChunkResult) => ({
        id: c.id,
        content: c.content.substring(0, 200) + '...',
        similarity: c.similarity,
      })),
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Chat error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
