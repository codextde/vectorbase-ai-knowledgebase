'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Loader2,
  ExternalLink,
  FileText,
  Database,
  Search,
  CheckCircle2,
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

interface NotionSourceDialogProps {
  projectId: string
  trigger: React.ReactNode
}

export function NotionSourceDialog({ projectId, trigger }: NotionSourceDialogProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'connect' | 'select'>('connect')
  const [loading, setLoading] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [pages, setPages] = useState<NotionPageInfo[]>([])
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [workspaceInfo, setWorkspaceInfo] = useState<{
    id: string
    name: string
    token: string
  } | null>(null)

  useEffect(() => {
    const notionConnected = searchParams.get('notion_connected')
    const workspaceId = searchParams.get('workspace_id')
    const workspaceName = searchParams.get('workspace_name')
    const accessToken = searchParams.get('access_token')
    const notionError = searchParams.get('notion_error')

    if (notionError) {
      toast.error(`Notion connection failed: ${notionError}`)
      const url = new URL(window.location.href)
      url.searchParams.delete('notion_error')
      window.history.replaceState({}, '', url.toString())
    }

    if (notionConnected === 'true' && workspaceId && accessToken) {
      setWorkspaceInfo({
        id: workspaceId,
        name: workspaceName || 'Notion Workspace',
        token: accessToken,
      })
      setStep('select')
      setOpen(true)
      loadPages(accessToken)

      const url = new URL(window.location.href)
      url.searchParams.delete('notion_connected')
      url.searchParams.delete('workspace_id')
      url.searchParams.delete('workspace_name')
      url.searchParams.delete('access_token')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams])

  async function loadPages(token: string) {
    setLoading(true)
    try {
      const response = await fetch(`/api/notion/pages?token=${encodeURIComponent(token)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load pages')
      }

      setPages(data.pages)
    } catch (error) {
      toast.error('Failed to load Notion pages')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleConnect() {
    setConnecting(true)
    try {
      const response = await fetch(`/api/notion/auth?projectId=${projectId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate Notion connection')
      }

      window.location.href = data.authUrl
    } catch (error) {
      toast.error('Failed to connect to Notion')
      console.error(error)
      setConnecting(false)
    }
  }

  async function handleAddSource() {
    if (!workspaceInfo || selectedPages.size === 0) return

    setLoading(true)
    try {
      const selectedPagesList = pages.filter((p) => selectedPages.has(p.id))

      const response = await fetch('/api/notion/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          workspaceId: workspaceInfo.id,
          workspaceName: workspaceInfo.name,
          encryptedToken: workspaceInfo.token,
          selectedPages: selectedPagesList,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create Notion source')
      }

      toast.success(`Notion source created with ${selectedPages.size} pages!`)
      setOpen(false)
      resetState()
      router.refresh()
    } catch (error) {
      toast.error('Failed to create Notion source')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  function resetState() {
    setStep('connect')
    setPages([])
    setSelectedPages(new Set())
    setSearchQuery('')
    setWorkspaceInfo(null)
  }

  function togglePage(pageId: string) {
    setSelectedPages((prev) => {
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
    setSelectedPages(new Set(filteredPages.map((p) => p.id)))
  }

  function deselectAll() {
    setSelectedPages(new Set())
  }

  const filteredPages = pages.filter(
    (page) =>
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.id.includes(searchQuery)
  )

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetState() }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {step === 'connect' ? 'Connect Notion' : 'Select Pages'}
          </DialogTitle>
          <DialogDescription>
            {step === 'connect'
              ? 'Connect your Notion workspace to import pages and databases into your knowledge base.'
              : `Select the pages and databases you want to sync from ${workspaceInfo?.name || 'Notion'}.`}
          </DialogDescription>
        </DialogHeader>

        {step === 'connect' && (
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <svg
                  viewBox="0 0 100 100"
                  className="h-10 w-10"
                  fill="currentColor"
                >
                  <path d="M6.017 4.313l55.333 -4.087c6.797 -0.583 8.543 -0.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277 -1.553 6.807 -6.99 7.193L24.467 99.967c-4.08 0.193 -6.023 -0.39 -8.16 -3.113L3.3 79.94c-2.333 -3.113 -3.3 -5.443 -3.3 -8.167V11.113c0 -3.497 1.553 -6.413 6.017 -6.8z" />
                  <path
                    fill="white"
                    d="M61.35 36.293l-23.567 2.14c-2.333 0.193 -2.72 0.387 -4.467 1.747l-13.773 10.11c-0.583 0.39 -0.39 0.78 0.583 0.78l24.15 -1.557c2.333 -0.193 2.72 -0.387 4.467 -1.747l13.773 -10.11c0.583 -0.39 0.39 -0.78 -0.583 -0.78l-0.583 -0.583z"
                  />
                  <path
                    fill="white"
                    d="M25.047 52.913v36.553c0 2.333 1.167 3.307 3.693 3.113l41.557 -2.723c2.527 -0.193 2.913 -1.553 2.913 -3.5V50.193c0 -1.943 -0.78 -2.913 -2.527 -2.72l-43.313 2.917c-1.75 0.193 -2.333 1.167 -2.333 2.527l0.01 -0.004zM64.263 55.147c0.193 1.167 0 2.333 -1.167 2.527l-1.943 0.387v26.83c-1.75 0.97 -3.307 1.553 -4.663 1.553 -2.14 0 -2.72 -0.583 -4.277 -2.527l-13.193 -20.42v19.837l4.08 0.97s0 2.333 -3.307 2.333l-9.137 0.583c-0.193 -0.583 0 -1.943 0.97 -2.14l2.527 -0.583V56.9l-3.5 -0.387c-0.193 -1.167 0.39 -2.913 2.14 -3.113l9.717 -0.583 13.773 21.003V55.92l-3.5 -0.387c-0.193 -1.36 0.78 -2.333 1.943 -2.527l9.527 -0.583v2.724z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Connect to Notion</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Click the button below to authorize VectorBase to access your Notion workspace.
                </p>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-sm">What we can access:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Pages and databases you select
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Content and properties of selected items
                </li>
                <li className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  We never modify your Notion content
                </li>
              </ul>
            </div>

            <Button onClick={handleConnect} className="w-full" disabled={connecting}>
              {connecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Connect Notion Workspace
            </Button>
          </div>
        )}

        {step === 'select' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
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
              <ScrollArea className="h-[300px] border rounded-lg">
                <div className="p-2 space-y-1">
                  {filteredPages.map((page) => (
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
                        onClick={(e) => e.stopPropagation()}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                  {filteredPages.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchQuery
                        ? 'No pages match your search'
                        : 'No accessible pages found'}
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('connect')} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleAddSource}
                disabled={loading || selectedPages.size === 0}
                className="flex-1"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add {selectedPages.size} Page{selectedPages.size !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
