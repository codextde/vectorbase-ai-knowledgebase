'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Loader2,
  ExternalLink,
  FileText,
  Database,
  Search,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'

interface NotionPageInfo {
  id: string
  title: string
  type: 'page' | 'database'
  lastEditedTime: string
  url: string
  icon?: string
}

interface ExistingNotionPage {
  id: string
  notionPageId: string
  title: string | null
  pageType: string
  status: string
  isExcluded: boolean
}

interface SourceNotionData {
  id: string
  notionWorkspaceId: string | null
  notionWorkspaceName: string | null
  accessTokenEncrypted: string | null
  pages: ExistingNotionPage[]
}

interface EditNotionSourceDialogProps {
  sourceId: string
  sourceName: string
  sourceNotion: SourceNotionData | null
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditNotionSourceDialog({
  sourceId,
  sourceName,
  sourceNotion,
  projectId,
  open,
  onOpenChange,
}: EditNotionSourceDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [reprocessing, setReprocessing] = useState(false)
  const [pages, setPages] = useState<NotionPageInfo[]>([])
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [name, setName] = useState(sourceName)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (open && sourceNotion?.accessTokenEncrypted) {
      loadPages()
      const existingPageIds = sourceNotion.pages
        .filter(p => !p.isExcluded)
        .map(p => p.notionPageId)
      setSelectedPages(new Set(existingPageIds))
    }
    setName(sourceName)
  }, [open, sourceNotion, sourceName])

  useEffect(() => {
    if (!sourceNotion) return
    const existingPageIds = new Set(
      sourceNotion.pages.filter(p => !p.isExcluded).map(p => p.notionPageId)
    )
    const currentPageIds = selectedPages
    const nameChanged = name !== sourceName
    const pagesChanged = existingPageIds.size !== currentPageIds.size ||
      [...existingPageIds].some(id => !currentPageIds.has(id))
    setHasChanges(nameChanged || pagesChanged)
  }, [selectedPages, name, sourceNotion, sourceName])

  async function loadPages() {
    if (!sourceNotion?.accessTokenEncrypted) return
    
    setLoading(true)
    try {
      const response = await fetch(
        `/api/notion/pages?token=${encodeURIComponent(sourceNotion.accessTokenEncrypted)}`
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load pages')
      }

      setPages(data.pages)
    } catch (error) {
      toast.error('Failed to load Notion pages. You may need to reconnect.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const selectedPagesList = pages.filter(p => selectedPages.has(p.id))

      const response = await fetch(`/api/sources/${sourceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          selectedPages: selectedPagesList,
        }),
      })

      if (response.ok) {
        toast.success('Notion source updated')
        onOpenChange(false)
        router.refresh()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to update source')
      }
    } catch {
      toast.error('Failed to update source')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveAndReprocess() {
    setReprocessing(true)
    try {
      const selectedPagesList = pages.filter(p => selectedPages.has(p.id))

      const updateResponse = await fetch(`/api/sources/${sourceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          selectedPages: selectedPagesList,
        }),
      })

      if (!updateResponse.ok) {
        const data = await updateResponse.json()
        toast.error(data.error || 'Failed to update source')
        return
      }

      const retrainResponse = await fetch(`/api/sources/${sourceId}/retrain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      })

      if (retrainResponse.ok) {
        const data = await retrainResponse.json()
        toast.success(`Source updated and reprocessed: ${data.chunksCreated} chunks`)
        onOpenChange(false)
        router.refresh()
      } else {
        const data = await retrainResponse.json()
        toast.error(data.error || 'Failed to reprocess source')
      }
    } catch {
      toast.error('Failed to update and reprocess source')
    } finally {
      setReprocessing(false)
    }
  }

  function togglePage(pageId: string) {
    setSelectedPages(prev => {
      const next = new Set(prev)
      if (next.has(pageId)) {
        next.delete(pageId)
      } else {
        next.add(pageId)
      }
      return next
    })
  }

  function selectAll() {
    setSelectedPages(new Set(filteredPages.map(p => p.id)))
  }

  function deselectAll() {
    setSelectedPages(new Set())
  }

  const filteredPages = pages.filter(
    page =>
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.id.includes(searchQuery)
  )

  if (!sourceNotion) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Notion Source</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No Notion configuration found for this source.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Notion Source</DialogTitle>
          <DialogDescription>
            Update the source name or change which pages are synced from{' '}
            {sourceNotion.notionWorkspaceName || 'your Notion workspace'}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Source Name</Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Source name"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Selected Pages</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadPages}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pages..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {selectedPages.size} of {filteredPages.length} selected
              </span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button variant="ghost" size="sm" onClick={deselectAll}>
                  Deselect All
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ScrollArea className="h-[250px] border rounded-lg">
                <div className="p-2 space-y-1">
                  {filteredPages.map(page => (
                    <div
                      key={page.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedPages.has(page.id) ? 'bg-muted' : ''
                      }`}
                      onClick={() => togglePage(page.id)}
                    >
                      <Checkbox
                        checked={selectedPages.has(page.id)}
                        onCheckedChange={() => togglePage(page.id)}
                      />
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {page.icon ? (
                          <span className="text-lg">{page.icon}</span>
                        ) : page.type === 'database' ? (
                          <Database className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="truncate">{page.title}</span>
                        <Badge variant="secondary" className="text-xs">
                          {page.type}
                        </Badge>
                      </div>
                      <a
                        href={page.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                  {filteredPages.length === 0 && !loading && (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchQuery
                        ? 'No pages match your search'
                        : 'No accessible pages found. Try refreshing.'}
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || reprocessing || !hasChanges || selectedPages.size === 0}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
          <Button
            onClick={handleSaveAndReprocess}
            disabled={saving || reprocessing || selectedPages.size === 0}
          >
            {reprocessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save & Reprocess
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
