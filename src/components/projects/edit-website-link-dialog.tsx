'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

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

interface EditWebsiteLinkDialogProps {
  link: WebsiteLink
  sourceId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (link: WebsiteLink) => void
}

export function EditWebsiteLinkDialog({
  link,
  sourceId,
  open,
  onOpenChange,
  onSave,
}: EditWebsiteLinkDialogProps) {
  const [url, setUrl] = useState(link.url)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setUrl(link.url)
  }, [link])

  const handleSave = async () => {
    if (!url.trim()) {
      toast.error('Please enter a URL')
      return
    }

    try {
      new URL(url)
    } catch {
      toast.error('Please enter a valid URL')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/sources/${sourceId}/links/${link.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update link')
      }

      const data = await response.json()
      onSave({ ...link, url: data.link.url })
      toast.success('Link updated')
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Link URL</DialogTitle>
          <DialogDescription>
            Update the URL for this link. The content will need to be recrawled after changing the URL.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/page"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
