'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

type CreateProjectResult = 
  | { error: string; project?: never }
  | { error?: never; project: { id: string; name: string } }

export async function createProject(formData: FormData): Promise<CreateProjectResult> {
  const name = formData.get('name') as string
  const description = formData.get('description') as string | null

  if (!name) {
    return { error: 'Project name is required' }
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'You must be logged in to create a project' }
  }

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
    include: { organization: true },
  })

  if (!membership) {
    return { error: 'No organization found. Please contact support.' }
  }

  try {
    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        organizationId: membership.organizationId,
      },
      select: { id: true, name: true },
    })

    revalidatePath('/dashboard/projects')
    return { project }
  } catch (err) {
    console.error('Failed to create project:', err)
    return { error: 'Failed to create project' }
  }
}
