import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FolderKanban, FileText, Globe, MessageSquare, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
    include: { organization: true },
  })

  if (!membership) {
    redirect('/auth/login')
  }

  const [projectsCount, sourcesCount, websitesCount, messagesCount, recentProjects] = await Promise.all([
    prisma.project.count({ where: { organizationId: membership.organizationId } }),
    prisma.source.count({ where: { project: { organizationId: membership.organizationId } } }),
    prisma.source.count({ where: { project: { organizationId: membership.organizationId }, type: 'website' } }),
    prisma.message.count({ where: { conversation: { project: { organizationId: membership.organizationId } } } }),
    prisma.project.findMany({
      where: { organizationId: membership.organizationId },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    }),
  ])

  const stats = [
    { label: 'Projects', value: projectsCount, icon: FolderKanban, href: '/dashboard/projects' },
    { label: 'Sources', value: sourcesCount, icon: FileText, href: '/dashboard/projects' },
    { label: 'Websites', value: websitesCount, icon: Globe, href: '/dashboard/projects' },
    { label: 'Messages', value: messagesCount, icon: MessageSquare, href: '/dashboard/analytics' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s an overview of your knowledge bases.</p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>Your most recently updated projects</CardDescription>
          </CardHeader>
          <CardContent>
            {recentProjects.length > 0 ? (
              <div className="space-y-4">
                {recentProjects.map((project: typeof recentProjects[number]) => (
                  <Link 
                    key={project.id} 
                    href={`/dashboard/projects/${project.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FolderKanban className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {project.description || 'No description'}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No projects yet</p>
                <Link href="/dashboard/projects/new">
                  <Button variant="outline" className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Create your first project
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>Get started with VectorBase</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                1
              </div>
              <div>
                <p className="font-medium">Create a Project</p>
                <p className="text-sm text-muted-foreground">
                  Start by creating a new project for your knowledge base
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                2
              </div>
              <div>
                <p className="font-medium">Add Sources</p>
                <p className="text-sm text-muted-foreground">
                  Upload documents, add text, or crawl websites
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                3
              </div>
              <div>
                <p className="font-medium">Use the API</p>
                <p className="text-sm text-muted-foreground">
                  Query your knowledge base via API or integrate with n8n
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
