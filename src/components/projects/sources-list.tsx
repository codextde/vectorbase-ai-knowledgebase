'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  FileText, 
  Type, 
  HelpCircle, 
  Globe, 
  Trash2, 
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Pencil,
  ChevronDown,
  ChevronRight,
  Link as LinkIcon,
  BookOpen,
  Code2,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Source, SourceDocument, SourceText, SourceQA, SourceWebsite, SourceNotion } from '@/types/database'
import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { EditSourceDialog } from '@/components/projects/edit-source-dialog'
import { EditNotionSourceDialog } from '@/components/projects/edit-notion-source-dialog'
import { WebsiteLinksPanel } from '@/components/projects/website-links-panel'
import { ChunksDebugPanel } from '@/components/projects/chunks-debug-panel'

interface SourceWithDetails extends Source {
  source_documents: SourceDocument[] | null
  source_texts: SourceText[] | null
  source_qa: SourceQA[] | null
  source_websites: SourceWebsite[] | null
  source_notion: SourceNotion[] | null
}

interface SourcesListProps {
  sources: SourceWithDetails[]
  projectId: string
}

const sourceTypeIcons = {
  document: FileText,
  text: Type,
  qa: HelpCircle,
  website: Globe,
  notion: BookOpen,
}

const statusConfig = {
  pending: { icon: Loader2, className: 'text-yellow-500', label: 'Pending' },
  processing: { icon: Loader2, className: 'text-blue-500 animate-spin', label: 'Processing' },
  completed: { icon: CheckCircle2, className: 'text-green-500', label: 'Completed' },
  failed: { icon: AlertCircle, className: 'text-red-500', label: 'Failed' },
}

// Helper to handle Supabase returning either array or single object for 1-to-1 relations
function getFirstOrObject<T, R>(
  data: T[] | T | null | undefined,
  transform: (item: T) => R
): R | null {
  if (!data) return null
  if (Array.isArray(data)) {
    return data.length > 0 ? transform(data[0]) : null
  }
  return transform(data)
}

export function SourcesList({ sources, projectId }: SourcesListProps) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editSource, setEditSource] = useState<SourceWithDetails | null>(null)
  const [editNotionSource, setEditNotionSource] = useState<SourceWithDetails | null>(null)
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set())
  const [autoRetrainLoading, setAutoRetrainLoading] = useState<string | null>(null)
  const [debugSources, setDebugSources] = useState<Set<string>>(new Set())

  const toggleDebug = (sourceId: string) => {
    setDebugSources((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(sourceId)) {
        newSet.delete(sourceId)
      } else {
        newSet.add(sourceId)
      }
      return newSet
    })
  }

  const toggleExpanded = (sourceId: string) => {
    setExpandedSources((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(sourceId)) {
        newSet.delete(sourceId)
      } else {
        newSet.add(sourceId)
      }
      return newSet
    })
  }

  const handleDelete = async (sourceId: string) => {
    setLoadingId(sourceId)
    try {
      const response = await fetch(`/api/sources/${sourceId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      })
      
      if (response.ok) {
        toast.success('Source deleted successfully')
        router.refresh()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to delete source')
      }
    } catch {
      toast.error('Failed to delete source')
    } finally {
      setLoadingId(null)
      setDeleteId(null)
    }
  }

  const handleRetrain = async (sourceId: string) => {
    setLoadingId(sourceId)
    try {
      const response = await fetch(`/api/sources/${sourceId}/retrain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      })
      
      if (response.ok) {
        const data = await response.json()
        toast.success(`Source retrained: ${data.chunksCreated} chunks created`)
        router.refresh()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to retrain source')
      }
    } catch {
      toast.error('Failed to retrain source')
    } finally {
      setLoadingId(null)
    }
  }

  const handleAutoRetrainToggle = async (sourceId: string, enabled: boolean) => {
    setAutoRetrainLoading(sourceId)
    try {
      const response = await fetch(`/api/sources/${sourceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoRetrain: enabled }),
      })
      
      if (response.ok) {
        toast.success(enabled ? 'Auto-retrain enabled' : 'Auto-retrain disabled')
        router.refresh()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to update auto-retrain')
      }
    } catch {
      toast.error('Failed to update auto-retrain')
    } finally {
      setAutoRetrainLoading(null)
    }
  }

  if (sources.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FileText className="h-16 w-16 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No sources yet</h3>
          <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
            Add documents, text, Q&A pairs, or websites to train your knowledge base.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Source</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this source and all its associated data including embeddings. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-2">
        {sources.map((source) => {
          const Icon = sourceTypeIcons[source.type]
          const status = statusConfig[source.status]
          const StatusIcon = status.icon
          const isLoading = loadingId === source.id
          const isWebsite = source.type === 'website'
          const isExpanded = expandedSources.has(source.id)
          const websiteData = source.source_websites?.[0]
          const isSitemapOrCrawl = websiteData?.crawl_type === 'sitemap' || websiteData?.crawl_type === 'crawl'

          return (
            <Card key={source.id} className="hover:bg-muted/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {isWebsite && isSitemapOrCrawl ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-lg bg-primary/10 hover:bg-primary/20"
                        onClick={() => toggleExpanded(source.id)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-primary" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-primary" />
                        )}
                      </Button>
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{source.name}</p>
                        <Badge variant="outline" className="capitalize">
                          {source.type}
                        </Badge>
                        {isWebsite && websiteData?.crawl_type && (
                          <Badge variant="secondary" className="capitalize text-xs">
                            {websiteData.crawl_type}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <StatusIcon className={`h-3 w-3 ${status.className}`} />
                        <span className="text-xs text-muted-foreground">{status.label}</span>
                        {source.chunks_count > 0 && (
                          <>
                            <span className="text-xs text-muted-foreground">-</span>
                            <span className="text-xs text-muted-foreground">
                              {source.chunks_count} chunks
                            </span>
                          </>
                        )}
                        {isWebsite && websiteData?.pages_crawled && websiteData.pages_crawled > 0 && (
                          <>
                            <span className="text-xs text-muted-foreground">-</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <LinkIcon className="h-3 w-3" />
                              {websiteData.pages_crawled} links
                            </span>
                          </>
                        )}
                        <span className="text-xs text-muted-foreground">-</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(source.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      {source.error_message && (
                        <p className="text-xs text-red-500 mt-1">{source.error_message}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(source.type === 'website' || source.type === 'notion') && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2 px-2">
                              <Switch
                                checked={source.auto_retrain}
                                onCheckedChange={(checked) => handleAutoRetrainToggle(source.id, checked)}
                                disabled={autoRetrainLoading === source.id}
                              />
                              {autoRetrainLoading === source.id && (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Auto-retrain daily</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
<Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => source.type === 'notion' ? setEditNotionSource(source) : setEditSource(source)}
                      disabled={isLoading}
                      title="Edit source"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => toggleDebug(source.id)}
                            disabled={source.status !== 'completed' || source.chunks_count === 0}
                            title="View chunks"
                          >
                            <Code2 className={`h-4 w-4 ${debugSources.has(source.id) ? 'text-primary' : ''}`} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Debug vector chunks</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRetrain(source.id)}
                      disabled={isLoading || source.status === 'processing'}
                      title="Retrain source"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(source.id)}
                      disabled={isLoading}
                      title="Delete source"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
{isWebsite && isSitemapOrCrawl && isExpanded && (
                  <div className="mt-4 pt-4 border-t">
                    <WebsiteLinksPanel sourceId={source.id} projectId={projectId} />
                  </div>
                )}
                {debugSources.has(source.id) && source.chunks_count > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <ChunksDebugPanel sourceId={source.id} projectId={projectId} />
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {editSource && editSource.type !== 'notion' && (
        <EditSourceDialog
          source={{
            id: editSource.id,
            name: editSource.name,
            type: editSource.type as 'text' | 'qa' | 'website' | 'document',
            sourceText: getFirstOrObject(editSource.source_texts, (t) => ({ content: t.content })),
            sourceQa: getFirstOrObject(editSource.source_qa, (q) => ({ question: q.question, answer: q.answer })),
            sourceWebsite: getFirstOrObject(editSource.source_websites, (w) => ({ url: w.url })),
            sourceDocument: getFirstOrObject(editSource.source_documents, (d) => ({ fileName: d.file_name })),
          }}
          projectId={projectId}
          open={!!editSource}
          onOpenChange={(open) => !open && setEditSource(null)}
        />
      )}

      {editNotionSource && (
        <EditNotionSourceDialog
          sourceId={editNotionSource.id}
          sourceName={editNotionSource.name}
          sourceNotion={getFirstOrObject(editNotionSource.source_notion, (n) => ({
            id: n.id,
            notionWorkspaceId: n.notion_workspace_id,
            notionWorkspaceName: n.notion_workspace_name,
            accessTokenEncrypted: n.access_token_encrypted,
            pages: (n.pages || []).map(p => ({
              id: p.id,
              notionPageId: p.notion_page_id,
              title: p.title,
              pageType: p.page_type,
              status: p.status,
              isExcluded: p.is_excluded,
            })),
          }))}
          projectId={projectId}
          open={!!editNotionSource}
          onOpenChange={(open) => !open && setEditNotionSource(null)}
        />
      )}
    </>
  )
}
