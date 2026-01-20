'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import {
  Link as LinkIcon,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  EyeOff,
  Eye,
  Loader2,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { EditWebsiteLinkDialog } from './edit-website-link-dialog'

interface WebsiteLink {
  id: string
  url: string
  title: string | null
  contentSize: number | null
  status: 'pending' | 'processing' | 'completed' | 'failed'
  isExcluded: boolean
  errorMessage: string | null
  lastCrawledAt: string | null
  createdAt: string
}

interface WebsiteLinksPanelProps {
  sourceId: string
  projectId: string
}

const statusConfig = {
  pending: { icon: Clock, className: 'text-yellow-500', label: 'Pending' },
  processing: { icon: Loader2, className: 'text-blue-500 animate-spin', label: 'Processing' },
  completed: { icon: CheckCircle2, className: 'text-green-500', label: 'Completed' },
  failed: { icon: AlertCircle, className: 'text-red-500', label: 'Failed' },
}

export function WebsiteLinksPanel({ sourceId, projectId }: WebsiteLinksPanelProps) {
  const router = useRouter()
  const [links, setLinks] = useState<WebsiteLink[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [editLink, setEditLink] = useState<WebsiteLink | null>(null)
  const [deleteLink, setDeleteLink] = useState<WebsiteLink | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'default' | 'url' | 'size' | 'status'>('default')

  const fetchLinks = useCallback(async () => {
    try {
      const response = await fetch(`/api/sources/${sourceId}/links`)
      if (!response.ok) {
        throw new Error('Failed to fetch links')
      }
      const data = await response.json()
      setLinks(data.links)
    } catch (error) {
      toast.error('Failed to load links')
    } finally {
      setLoading(false)
    }
  }, [sourceId])

  useEffect(() => {
    fetchLinks()
  }, [fetchLinks])

  const handleToggleExclude = async (link: WebsiteLink) => {
    setActionLoading(link.id)
    try {
      const response = await fetch(`/api/sources/${sourceId}/links/${link.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isExcluded: !link.isExcluded }),
      })

      if (!response.ok) {
        throw new Error('Failed to update link')
      }

      setLinks((prev) =>
        prev.map((l) => (l.id === link.id ? { ...l, isExcluded: !l.isExcluded } : l))
      )
      toast.success(link.isExcluded ? 'Link included' : 'Link excluded')
    } catch (error) {
      toast.error('Failed to update link')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteLink) return

    setActionLoading(deleteLink.id)
    try {
      const response = await fetch(`/api/sources/${sourceId}/links/${deleteLink.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete link')
      }

      setLinks((prev) => prev.filter((l) => l.id !== deleteLink.id))
      toast.success('Link deleted')
      router.refresh()
    } catch (error) {
      toast.error('Failed to delete link')
    } finally {
      setActionLoading(null)
      setDeleteLink(null)
    }
  }

  const handleLinkUpdated = (updatedLink: WebsiteLink) => {
    setLinks((prev) => prev.map((l) => (l.id === updatedLink.id ? updatedLink : l)))
    setEditLink(null)
  }

  const handleRecrawl = async (link: WebsiteLink) => {
    setActionLoading(link.id)
    try {
      const response = await fetch(`/api/sources/${sourceId}/links/${link.id}/recrawl`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to start recrawl')
      }

      setLinks((prev) =>
        prev.map((l) => (l.id === link.id ? { ...l, status: 'processing' as const } : l))
      )
      toast.success('Recrawl started')
    } catch (error) {
      toast.error('Failed to start recrawl')
    } finally {
      setActionLoading(null)
    }
  }

  const filteredLinks = links.filter((link) =>
    link.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (link.title && link.title.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const sortedLinks = [...filteredLinks].sort((a, b) => {
    switch (sortBy) {
      case 'url':
        return a.url.localeCompare(b.url)
      case 'size':
        return (b.contentSize || 0) - (a.contentSize || 0)
      case 'status':
        const statusOrder = { pending: 0, processing: 1, completed: 2, failed: 3 }
        return statusOrder[a.status] - statusOrder[b.status]
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  const includedCount = links.filter((l) => !l.isExcluded).length
  const excludedCount = links.filter((l) => l.isExcluded).length

  const formatSize = (bytes: number | null) => {
    if (!bytes) return null
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search links..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Sort: {sortBy === 'default' ? 'Default' : sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy('default')}>Default</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('url')}>URL</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('size')}>Size</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('status')}>Status</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex gap-2 mt-3 text-sm text-muted-foreground">
            <span>{includedCount} links included</span>
            {excludedCount > 0 && (
              <>
                <span>-</span>
                <span>{excludedCount} excluded</span>
              </>
            )}
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          <div className="divide-y">
            {sortedLinks.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {searchQuery ? 'No links match your search' : 'No links found'}
              </div>
            ) : (
              sortedLinks.map((link) => {
                const StatusIcon = statusConfig[link.status].icon
                const isLoading = actionLoading === link.id

                return (
                  <div
                    key={link.id}
                    className={`flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors ${
                      link.isExcluded ? 'opacity-50' : ''
                    }`}
                  >
                    <LinkIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium truncate hover:underline flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {link.title || link.url}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        {link.isExcluded && (
                          <Badge variant="secondary" className="text-xs">
                            Excluded
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StatusIcon className={`h-3 w-3 ${statusConfig[link.status].className}`} />
                        <span className="text-xs text-muted-foreground">
                          {statusConfig[link.status].label}
                        </span>
                        {link.contentSize && (
                          <>
                            <span className="text-xs text-muted-foreground">-</span>
                            <span className="text-xs text-muted-foreground">
                              {formatSize(link.contentSize)}
                            </span>
                          </>
                        )}
                        {link.lastCrawledAt && (
                          <>
                            <span className="text-xs text-muted-foreground">-</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(link.lastCrawledAt), { addSuffix: true })}
                            </span>
                          </>
                        )}
                      </div>
                      {link.errorMessage && (
                        <p className="text-xs text-red-500 mt-0.5 truncate">{link.errorMessage}</p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={isLoading}>
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreVertical className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditLink(link)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit URL
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleExclude(link)}>
                          {link.isExcluded ? (
                            <>
                              <Eye className="mr-2 h-4 w-4" />
                              Include
                            </>
                          ) : (
                            <>
                              <EyeOff className="mr-2 h-4 w-4" />
                              Exclude
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRecrawl(link)}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Recrawl
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteLink(link)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {editLink && (
        <EditWebsiteLinkDialog
          link={editLink}
          sourceId={sourceId}
          open={!!editLink}
          onOpenChange={(open) => !open && setEditLink(null)}
          onSave={handleLinkUpdated}
        />
      )}

      <AlertDialog open={!!deleteLink} onOpenChange={(isOpen: boolean) => !isOpen && setDeleteLink(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Link</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this link? This will also remove any associated content and embeddings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
