import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageSquare, FolderKanban, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function PlaygroundPage() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth/login')
  }

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
    include: { organization: true },
  })

  if (!membership) {
    redirect('/auth/login')
  }

  const projects = await prisma.project.findMany({
    where: { 
      organizationId: membership.organizationId,
      isActive: true,
    },
    include: {
      _count: {
        select: { sources: true, chunks: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  type ProjectWithCount = typeof projects[number]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Playground</h1>
        <p className="text-muted-foreground">
          Test and interact with your knowledge bases
        </p>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MessageSquare className="h-16 w-16 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No projects to test</h3>
            <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
              Create a project and add some sources to start testing your knowledge base.
            </p>
            <Link href="/dashboard/projects/new" className="mt-4">
              <Button>
                <FolderKanban className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project: ProjectWithCount) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FolderKanban className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <CardTitle className="mt-4">{project.name}</CardTitle>
                <CardDescription>
                  {project.description || 'No description'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span>{project._count.sources} sources</span>
                  <span>{project._count.chunks} chunks</span>
                </div>
                
                {project._count.sources === 0 ? (
                  <div className="p-3 bg-muted/50 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">
                      Add sources to enable the playground
                    </p>
                    <Link href={`/dashboard/projects/${project.id}`}>
                      <Button variant="link" size="sm" className="mt-1">
                        Add Sources
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Link href={`/dashboard/projects/${project.id}`}>
                    <Button className="w-full">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Open Playground
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>How to use the Playground</CardTitle>
          <CardDescription>Get started with testing your knowledge bases</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-medium">Select a Project</p>
                <p className="text-sm text-muted-foreground">
                  Choose a project with sources to test
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-medium">Ask Questions</p>
                <p className="text-sm text-muted-foreground">
                  Type questions to test your knowledge base
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-medium">Review Sources</p>
                <p className="text-sm text-muted-foreground">
                  See which sources were used to generate answers
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
