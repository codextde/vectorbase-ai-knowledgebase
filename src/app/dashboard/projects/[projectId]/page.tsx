import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, FileText, Type, HelpCircle, Globe, Settings, Key, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { SourcesList } from '@/components/projects/sources-list'
import { AddSourceDialog } from '@/components/projects/add-source-dialog'
import { CreateApiKeyDialog } from '@/components/projects/create-api-key-dialog'
import { ApiKeysList } from '@/components/projects/api-keys-list'
import { PlaygroundChat } from '@/components/projects/playground-chat'
import type { Source, SourceDocument, SourceText, SourceQA, SourceWebsite, SourceNotion, ApiKey } from '@/types/database'

interface SourceWithDetails extends Source {
  source_documents: SourceDocument[] | null
  source_texts: SourceText[] | null
  source_qa: SourceQA[] | null
  source_websites: SourceWebsite[] | null
  source_notion: SourceNotion[] | null
}

interface ProjectPageProps {
  params: Promise<{ projectId: string }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
    include: {
      organization: {
        include: {
          projects: {
            where: { id: projectId },
            include: {
              sources: {
                include: {
                  sourceDocument: true,
                  sourceText: true,
                  sourceQa: true,
                  sourceWebsite: true,
                  sourceNotion: {
                    include: {
                      pages: true,
                    },
                  },
                },
                orderBy: { createdAt: 'desc' },
              },
              apiKeys: {
                where: { isActive: true },
              },
            },
          },
        },
      },
    },
  })

  if (!membership || membership.organization.projects.length === 0) {
    notFound()
  }

  const project = membership.organization.projects[0]

  const sources: SourceWithDetails[] = project.sources.map((s: typeof project.sources[number]) => ({
    id: s.id,
    project_id: s.projectId,
    type: s.type as Source['type'],
    name: s.name,
    status: s.status as Source['status'],
    error_message: s.errorMessage,
    metadata: s.metadata as Source['metadata'],
    chunks_count: s.chunksCount,
    tokens_count: s.tokensCount,
    created_at: s.createdAt.toISOString(),
    updated_at: s.updatedAt.toISOString(),
    source_documents: s.sourceDocument ? [{
      id: s.sourceDocument.id,
      file_name: s.sourceDocument.fileName,
      file_type: s.sourceDocument.fileType,
      file_size: s.sourceDocument.fileSize,
      storage_path: s.sourceDocument.storagePath,
      original_name: s.sourceDocument.originalName,
    }] : null,
    source_texts: s.sourceText ? [{
      id: s.sourceText.id,
      content: s.sourceText.content,
    }] : null,
    source_qa: s.sourceQa ? [{
      id: s.sourceQa.id,
      question: s.sourceQa.question,
      answer: s.sourceQa.answer,
    }] : null,
    source_websites: s.sourceWebsite ? [{
      id: s.sourceWebsite.id,
      url: s.sourceWebsite.url,
      crawl_type: s.sourceWebsite.crawlType as SourceWebsite['crawl_type'],
      include_paths: s.sourceWebsite.includePaths,
      exclude_paths: s.sourceWebsite.excludePaths,
      pages_crawled: s.sourceWebsite.pagesCrawled,
      last_crawled_at: s.sourceWebsite.lastCrawledAt?.toISOString() || null,
      slow_scraping: s.sourceWebsite.slowScraping,
    }] : null,
    source_notion: s.sourceNotion ? [{
      id: s.sourceNotion.id,
      notion_workspace_id: s.sourceNotion.notionWorkspaceId,
      notion_workspace_name: s.sourceNotion.notionWorkspaceName,
      access_token_encrypted: s.sourceNotion.accessTokenEncrypted,
      last_synced_at: s.sourceNotion.lastSyncedAt?.toISOString() || null,
      sync_status: s.sourceNotion.syncStatus,
      pages: s.sourceNotion.pages?.map((p: typeof s.sourceNotion.pages[number]) => ({
        id: p.id,
        notion_page_id: p.notionPageId,
        title: p.title,
        page_type: p.pageType,
        status: p.status,
        is_excluded: p.isExcluded,
      })) || [],
    }] : null,
    auto_retrain: s.autoRetrain,
    last_retrained_at: s.lastRetrainedAt?.toISOString() || null,
  }))

  const apiKeys: ApiKey[] = project.apiKeys.map((k: typeof project.apiKeys[number]) => ({
    id: k.id,
    project_id: k.projectId,
    name: k.name,
    key_hash: k.keyHash,
    key_prefix: k.keyPrefix,
    permissions: k.permissions as ApiKey['permissions'],
    last_used_at: k.lastUsedAt?.toISOString() || null,
    expires_at: k.expiresAt?.toISOString() || null,
    is_active: k.isActive,
    created_at: k.createdAt.toISOString(),
  }))

  const sourceStats = {
    documents: sources.filter(s => s.type === 'document').length,
    texts: sources.filter(s => s.type === 'text').length,
    qa: sources.filter(s => s.type === 'qa').length,
    websites: sources.filter(s => s.type === 'website').length,
    notion: sources.filter(s => s.type === 'notion').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Link href="/dashboard/projects">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold truncate">{project.name}</h1>
            <Badge variant={project.isActive ? 'default' : 'secondary'}>
              {project.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <p className="text-muted-foreground truncate">{project.description || 'No description'}</p>
        </div>
        <Link href={`/dashboard/projects/${projectId}/settings`} className="shrink-0">
          <Button variant="outline" className="w-full sm:w-auto">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </Link>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sourceStats.documents}</div>
            <p className="text-xs text-muted-foreground">sources</p>
          </CardContent>
        </Card>
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Text Sources</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Type className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sourceStats.texts}</div>
            <p className="text-xs text-muted-foreground">sources</p>
          </CardContent>
        </Card>
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Q&A Pairs</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <HelpCircle className="h-4 w-4 text-violet-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sourceStats.qa}</div>
            <p className="text-xs text-muted-foreground">sources</p>
          </CardContent>
        </Card>
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Websites</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Globe className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sourceStats.websites}</div>
            <p className="text-xs text-muted-foreground">sources</p>
          </CardContent>
        </Card>
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notion</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-rose-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sourceStats.notion}</div>
            <p className="text-xs text-muted-foreground">sources</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sources" className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="sources">Sources</TabsTrigger>
            <TabsTrigger value="playground">Playground</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
          </TabsList>
          <AddSourceDialog projectId={projectId} />
        </div>

        <TabsContent value="sources" className="space-y-4">
          <SourcesList sources={sources} projectId={projectId} />
        </TabsContent>

        <TabsContent value="playground" className="space-y-4">
          <PlaygroundChat projectId={projectId} />
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>Manage API keys for this project</CardDescription>
              </div>
              {apiKeys.length > 0 && (
                <CreateApiKeyDialog projectId={projectId} />
              )}
            </CardHeader>
            <CardContent>
              {apiKeys.length > 0 ? (
                <ApiKeysList apiKeys={apiKeys} projectId={projectId} />
              ) : (
                <div className="text-center py-6">
                  <Key className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">No API keys yet</p>
                  <div className="mt-4">
                    <CreateApiKeyDialog projectId={projectId} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>Quick reference for using the API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium mb-2">Query Endpoint</p>
                <pre className="p-3 bg-muted rounded-lg text-sm overflow-x-auto">
{`POST /api/v1/query
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "query": "Your question here",
  "project_id": "${projectId}"
}`}
                </pre>
              </div>
              <div>
                <p className="font-medium mb-2">Chat Endpoint</p>
                <pre className="p-3 bg-muted rounded-lg text-sm overflow-x-auto">
{`POST /api/v1/chat
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "messages": [{"role": "user", "content": "Your message"}],
  "project_id": "${projectId}"
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
