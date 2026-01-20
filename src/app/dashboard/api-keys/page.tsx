import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Key, FolderKanban, Clock, Shield, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function ApiKeysPage() {
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
    where: { organizationId: membership.organizationId },
    include: {
      apiKeys: {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { name: 'asc' },
  })

  type ProjectWithKeys = typeof projects[number]
  type ApiKeyType = ProjectWithKeys['apiKeys'][number]

  const totalApiKeys = projects.reduce((sum: number, p: ProjectWithKeys) => sum + p.apiKeys.length, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">API Keys</h1>
        <p className="text-muted-foreground">
          Manage API keys across all your projects
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total API Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApiKeys}</div>
            <p className="text-xs text-muted-foreground">
              Active keys across all projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Projects with Keys</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.filter((p: ProjectWithKeys) => p.apiKeys.length > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Out of {projects.length} total projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Security Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Secure</div>
            <p className="text-xs text-muted-foreground">
              All keys are encrypted
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Keys by Project</CardTitle>
          <CardDescription>
            Create and manage API keys within each project
          </CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg">No projects yet</h3>
              <p className="text-muted-foreground mb-4">
                Create a project to start generating API keys
              </p>
              <Link href="/dashboard/projects/new">
                <Button>Create Project</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {projects.map((project: ProjectWithKeys) => (
                <div key={project.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FolderKanban className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{project.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {project.apiKeys.length} API key{project.apiKeys.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <Link href={`/dashboard/projects/${project.id}`}>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Manage Keys
                      </Button>
                    </Link>
                  </div>

                  {project.apiKeys.length > 0 ? (
                    <div className="space-y-2">
                      {project.apiKeys.map((apiKey: ApiKeyType) => (
                        <div
                          key={apiKey.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Key className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm">{apiKey.name}</p>
                              <code className="text-xs text-muted-foreground">
                                {apiKey.keyPrefix}...
                              </code>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm">
                            {apiKey.lastUsedAt && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {formatDistanceToNow(new Date(apiKey.lastUsedAt), { addSuffix: true })}
                                </span>
                              </div>
                            )}
                            <Badge variant={apiKey.isActive ? 'default' : 'secondary'}>
                              {apiKey.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4 bg-muted/30 rounded-lg">
                      No API keys created yet
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>Quick reference for using your API keys</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Authentication</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Include your API key in the Authorization header:
            </p>
            <pre className="p-3 bg-muted rounded-lg text-sm overflow-x-auto">
{`Authorization: Bearer YOUR_API_KEY`}
            </pre>
          </div>
          <div>
            <h4 className="font-medium mb-2">Query Endpoint</h4>
            <pre className="p-3 bg-muted rounded-lg text-sm overflow-x-auto">
{`POST /api/v1/query
Content-Type: application/json

{
  "query": "Your question here",
  "project_id": "your-project-id"
}`}
            </pre>
          </div>
          <div>
            <h4 className="font-medium mb-2">Chat Endpoint</h4>
            <pre className="p-3 bg-muted rounded-lg text-sm overflow-x-auto">
{`POST /api/v1/chat
Content-Type: application/json

{
  "messages": [{"role": "user", "content": "Hello"}],
  "project_id": "your-project-id"
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
