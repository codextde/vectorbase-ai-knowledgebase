import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Settings, Bot, Shield, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { ProjectGeneralSettings } from '@/components/projects/project-general-settings'
import { ProjectAiSettings } from '@/components/projects/project-ai-settings'
import { ProjectDangerZone } from '@/components/projects/project-danger-zone'
import type { Project, ProjectSettings as ProjectSettingsType } from '@/types/database'

interface ProjectSettingsPageProps {
  params: Promise<{ projectId: string }>
}

export default async function ProjectSettingsPage({ params }: ProjectSettingsPageProps) {
  const { projectId } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth/login')
  }

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
    include: { 
      organization: {
        include: {
          projects: {
            where: { id: projectId },
          },
        },
      },
    },
  })

  if (!membership || membership.organization.projects.length === 0) {
    notFound()
  }

  const prismaProject = membership.organization.projects[0]
  const settings = (prismaProject.settings || {}) as unknown as ProjectSettingsType
  
  const project: Project = {
    id: prismaProject.id,
    organization_id: prismaProject.organizationId,
    name: prismaProject.name,
    description: prismaProject.description,
    settings: prismaProject.settings as Project['settings'],
    is_active: prismaProject.isActive,
    created_at: prismaProject.createdAt.toISOString(),
    updated_at: prismaProject.updatedAt.toISOString(),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/projects/${projectId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Project Settings</h1>
          <p className="text-muted-foreground">{project.name}</p>
        </div>
      </div>

      <div className="grid gap-6">
        <ProjectGeneralSettings project={project} />
        <ProjectAiSettings projectId={projectId} settings={settings} />
        <ProjectDangerZone project={project} />
      </div>
    </div>
  )
}
