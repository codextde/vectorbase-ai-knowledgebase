'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import type { ChunkDebug } from '@/types/database'

interface ChunkDetailDialogProps {
  chunk: ChunkDebug | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChunkDetailDialog({ chunk, open, onOpenChange }: ChunkDetailDialogProps) {
  const [copied, setCopied] = useState(false)

  if (!chunk) return null

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(chunk.content)
      setCopied(true)
      toast.success('Content copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy content')
    }
  }

  const formatMetadata = (metadata: ChunkDebug['metadata']) => {
    try {
      return JSON.stringify(metadata, null, 2)
    } catch {
      return String(metadata)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Chunk Details
            <Badge variant="outline" className="font-mono text-xs">
              {chunk.id.slice(0, 8)}...
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Content</span>
              <span className="text-xs text-muted-foreground">
                {chunk.content.length.toLocaleString()} characters
              </span>
            </div>
            <ScrollArea className="h-[200px] rounded-md border bg-muted/30">
              <pre className="p-3 text-sm whitespace-pre-wrap font-mono">
                {chunk.content}
              </pre>
            </ScrollArea>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium">Metadata</span>
            <ScrollArea className="h-[120px] rounded-md border bg-muted/30">
              <pre className="p-3 text-sm font-mono text-muted-foreground">
                {formatMetadata(chunk.metadata)}
              </pre>
            </ScrollArea>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {chunk.tokensCount.toLocaleString()} tokens
            </Badge>
            <Badge variant="secondary">
              {chunk.embeddingModel}
            </Badge>
            {chunk.embeddingStats && (
              <>
                <Badge variant={chunk.embeddingStats.hasEmbedding ? 'default' : 'destructive'}>
                  {chunk.embeddingStats.hasEmbedding ? 'Has embedding' : 'No embedding'}
                </Badge>
                {chunk.embeddingStats.dimension && (
                  <Badge variant="outline">
                    {chunk.embeddingStats.dimension} dimensions
                  </Badge>
                )}
                {chunk.embeddingStats.magnitude !== null && (
                  <Badge variant="outline">
                    magnitude: {chunk.embeddingStats.magnitude.toFixed(4)}
                  </Badge>
                )}
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCopyContent}>
            {copied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {copied ? 'Copied!' : 'Copy Content'}
          </Button>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
