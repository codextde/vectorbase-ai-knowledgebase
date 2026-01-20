'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Database,
} from 'lucide-react'
import { toast } from 'sonner'
import { ChunkDetailDialog } from './chunk-detail-dialog'
import type { ChunkDebug, ChunksDebugResponse, ChunksPagination } from '@/types/database'

interface ChunksDebugPanelProps {
  sourceId: string
  projectId: string
}

export function ChunksDebugPanel({ sourceId }: ChunksDebugPanelProps) {
  const [chunks, setChunks] = useState<ChunkDebug[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<ChunksPagination | null>(null)
  const [summary, setSummary] = useState<ChunksDebugResponse['summary'] | null>(null)
  const [showStats, setShowStats] = useState(false)
  const [selectedChunk, setSelectedChunk] = useState<ChunkDebug | null>(null)
  const [sortBy, setSortBy] = useState<'default' | 'tokens' | 'model'>('default')

  const fetchChunks = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        includeStats: String(showStats),
      })
      const response = await fetch(`/api/sources/${sourceId}/chunks?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch chunks')
      }
      const data: ChunksDebugResponse = await response.json()
      setChunks(data.chunks)
      setPagination(data.pagination)
      setSummary(data.summary)
    } catch {
      toast.error('Failed to load chunks')
    } finally {
      setLoading(false)
    }
  }, [sourceId, page, showStats])

  useEffect(() => {
    fetchChunks()
  }, [fetchChunks])

  const handleStatsToggle = (checked: boolean) => {
    setShowStats(checked)
    setPage(1)
  }

  const filteredChunks = chunks.filter((chunk) =>
    chunk.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chunk.contentPreview.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedChunks = [...filteredChunks].sort((a, b) => {
    switch (sortBy) {
      case 'tokens':
        return b.tokensCount - a.tokensCount
      case 'model':
        return a.embeddingModel.localeCompare(b.embeddingModel)
      default:
        return 0
    }
  })

  if (loading && chunks.length === 0) {
    return (
      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-4 w-48 mt-3" />
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
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
                placeholder="Search chunks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="show-stats"
                checked={showStats}
                onCheckedChange={handleStatsToggle}
              />
              <Label htmlFor="show-stats" className="text-sm cursor-pointer">
                Embedding Stats
              </Label>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Sort: {sortBy === 'default' ? 'Default' : sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy('default')}>Default</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('tokens')}>Tokens</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('model')}>Model</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {summary && (
            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
              <Database className="h-4 w-4" />
              <span>{summary.totalChunks.toLocaleString()} chunks</span>
              <span>-</span>
              <span>{summary.totalTokens.toLocaleString()} tokens</span>
            </div>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          <div className="divide-y">
            {sortedChunks.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {searchQuery ? 'No chunks match your search' : 'No chunks found'}
              </div>
            ) : (
              sortedChunks.map((chunk) => (
                <div
                  key={chunk.id}
                  className="p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedChunk(chunk)}
                >
                  <p className="text-sm font-mono line-clamp-2 text-muted-foreground">
                    &ldquo;{chunk.contentPreview}&rdquo;
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {chunk.tokensCount} tokens
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {chunk.embeddingModel}
                    </Badge>
                    {showStats && chunk.embeddingStats && (
                      <>
                        <Badge
                          variant={chunk.embeddingStats.hasEmbedding ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {chunk.embeddingStats.hasEmbedding ? 'embedded' : 'no embedding'}
                        </Badge>
                        {chunk.embeddingStats.dimension && (
                          <Badge variant="outline" className="text-xs">
                            {chunk.embeddingStats.dimension}d
                          </Badge>
                        )}
                        {chunk.embeddingStats.magnitude !== null && (
                          <Badge variant="outline" className="text-xs">
                            |v|={chunk.embeddingStats.magnitude.toFixed(3)}
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {pagination && pagination.totalPages > 1 && (
          <div className="p-3 border-t flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page >= pagination.totalPages || loading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <ChunkDetailDialog
        chunk={selectedChunk}
        open={!!selectedChunk}
        onOpenChange={(open) => !open && setSelectedChunk(null)}
      />
    </>
  )
}
