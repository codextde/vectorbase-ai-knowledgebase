import { prisma } from '@/lib/prisma'
import { createHash } from 'crypto'

export interface AuthenticatedProject {
  projectId: string
  organizationId: string
  apiKeyId: string
}

export async function authenticateApiKey(
  authHeader: string | null
): Promise<AuthenticatedProject | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const apiKey = authHeader.slice(7)
  
  if (!apiKey || apiKey.length < 10) {
    return null
  }

  const keyHash = hashApiKey(apiKey)
  const keyPrefix = apiKey.slice(0, 8)

  const apiKeyRecord = await prisma.apiKey.findFirst({
    where: {
      keyHash,
      keyPrefix,
      isActive: true,
    },
    include: {
      project: {
        select: {
          id: true,
          organizationId: true,
          isActive: true,
        },
      },
    },
  })

  if (!apiKeyRecord) {
    return null
  }

  if (!apiKeyRecord.project.isActive) {
    return null
  }

  if (apiKeyRecord.expiresAt && new Date(apiKeyRecord.expiresAt) < new Date()) {
    return null
  }

  await prisma.apiKey.update({
    where: { id: apiKeyRecord.id },
    data: { lastUsedAt: new Date() },
  })

  return {
    projectId: apiKeyRecord.projectId,
    organizationId: apiKeyRecord.project.organizationId,
    apiKeyId: apiKeyRecord.id,
  }
}

export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

export function generateApiKey(): { key: string; hash: string; prefix: string } {
  const randomBytes = new Uint8Array(32)
  crypto.getRandomValues(randomBytes)
  const key = 'vb_' + Buffer.from(randomBytes).toString('base64url')
  
  return {
    key,
    hash: hashApiKey(key),
    prefix: key.slice(0, 8),
  }
}
