'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { processSourceWithPrisma } from '@/lib/processing-prisma'

export async function deleteSource(sourceId: string, projectId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  try {
    const source = await prisma.source.findUnique({
      where: { id: sourceId },
      include: { project: { include: { organization: true } } },
    })

    if (!source) {
      return { error: 'Source not found' }
    }

    const membership = await prisma.organizationMember.findFirst({
      where: { userId: user.id, organizationId: source.project.organizationId },
    })

    if (!membership) {
      return { error: 'Access denied' }
    }

    await prisma.chunk.deleteMany({
      where: { sourceId },
    })

    if (source.type === 'document') {
      const sourceDoc = await prisma.sourceDocument.findUnique({ where: { id: sourceId } })
      if (sourceDoc) {
        await supabase.storage.from('documents').remove([sourceDoc.storagePath])
        await prisma.sourceDocument.delete({ where: { id: sourceId } })
      }
    } else if (source.type === 'text') {
      await prisma.sourceText.delete({ where: { id: sourceId } }).catch(() => {})
    } else if (source.type === 'qa') {
      await prisma.sourceQa.delete({ where: { id: sourceId } }).catch(() => {})
    } else if (source.type === 'website') {
      await prisma.sourceWebsite.delete({ where: { id: sourceId } }).catch(() => {})
    }

    await prisma.source.delete({ where: { id: sourceId } })

    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true }
  } catch (error) {
    console.error('Delete source error:', error)
    return { error: 'Failed to delete source' }
  }
}

export async function retrainSource(sourceId: string, projectId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  try {
    const source = await prisma.source.findUnique({
      where: { id: sourceId },
      include: { project: { include: { organization: true } } },
    })

    if (!source) {
      return { error: 'Source not found' }
    }

    const membership = await prisma.organizationMember.findFirst({
      where: { userId: user.id, organizationId: source.project.organizationId },
    })

    if (!membership) {
      return { error: 'Access denied' }
    }

    await prisma.chunk.deleteMany({
      where: { sourceId },
    })

    await prisma.source.update({
      where: { id: sourceId },
      data: { 
        status: 'pending', 
        errorMessage: null,
        chunksCount: 0,
        tokensCount: 0,
      },
    })

    const result = await processSourceWithPrisma(sourceId)

    revalidatePath(`/dashboard/projects/${projectId}`)
    
    if (result.success) {
      return { success: true, chunksCreated: result.chunksCreated }
    } else {
      return { error: result.error || 'Processing failed' }
    }
  } catch (error) {
    console.error('Retrain source error:', error)
    return { error: 'Failed to retrain source' }
  }
}

export async function deleteApiKey(keyId: string, projectId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  try {
    const apiKey = await prisma.apiKey.findUnique({
      where: { id: keyId },
      include: { project: { include: { organization: true } } },
    })

    if (!apiKey) {
      return { error: 'API key not found' }
    }

    const membership = await prisma.organizationMember.findFirst({
      where: { userId: user.id, organizationId: apiKey.project.organizationId },
    })

    if (!membership) {
      return { error: 'Access denied' }
    }

    await prisma.apiKey.update({
      where: { id: keyId },
      data: { isActive: false },
    })

    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true }
  } catch (error) {
    console.error('Delete API key error:', error)
    return { error: 'Failed to delete API key' }
  }
}
