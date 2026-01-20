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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface SourceData {
  id: string
  name: string
  type: 'text' | 'qa' | 'website' | 'document'
  sourceText?: { content: string } | null
  sourceQa?: { question: string; answer: string } | null
  sourceWebsite?: { url: string } | null
  sourceDocument?: { fileName: string } | null
}

interface EditSourceDialogProps {
  source: SourceData
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditSourceDialog({ source, projectId, open, onOpenChange }: EditSourceDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [reprocessing, setReprocessing] = useState(false)

  const [name, setName] = useState(source.name)
  const [textContent, setTextContent] = useState(source.sourceText?.content || '')
  const [qaQuestion, setQaQuestion] = useState(source.sourceQa?.question || '')
  const [qaAnswer, setQaAnswer] = useState(source.sourceQa?.answer || '')
  const [websiteUrl, setWebsiteUrl] = useState(source.sourceWebsite?.url || '')

  useEffect(() => {
    setName(source.name)
    setTextContent(source.sourceText?.content || '')
    setQaQuestion(source.sourceQa?.question || '')
    setQaAnswer(source.sourceQa?.answer || '')
    setWebsiteUrl(source.sourceWebsite?.url || '')
  }, [source])

  async function handleSave() {
    setLoading(true)

    try {
      const body: Record<string, string> = { name }

      if (source.type === 'text') {
        body.content = textContent
      } else if (source.type === 'qa') {
        body.question = qaQuestion
        body.answer = qaAnswer
      } else if (source.type === 'website') {
        body.url = websiteUrl
      }

      const response = await fetch(`/api/sources/${source.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        toast.success('Source updated successfully')
        onOpenChange(false)
        router.refresh()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to update source')
      }
    } catch {
      toast.error('Failed to update source')
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveAndReprocess() {
    setReprocessing(true)

    try {
      const body: Record<string, string> = { name }

      if (source.type === 'text') {
        body.content = textContent
      } else if (source.type === 'qa') {
        body.question = qaQuestion
        body.answer = qaAnswer
      } else if (source.type === 'website') {
        body.url = websiteUrl
      }

      const updateResponse = await fetch(`/api/sources/${source.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!updateResponse.ok) {
        const data = await updateResponse.json()
        toast.error(data.error || 'Failed to update source')
        return
      }

      const retrainResponse = await fetch(`/api/sources/${source.id}/retrain`, {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Source</DialogTitle>
          <DialogDescription>
            Update the source content. Save to keep changes, or Save & Reprocess to regenerate embeddings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Source name"
            />
          </div>

          {source.type === 'text' && (
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={10}
                placeholder="Enter text content..."
              />
            </div>
          )}

          {source.type === 'qa' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="question">Question</Label>
                <Input
                  id="question"
                  value={qaQuestion}
                  onChange={(e) => setQaQuestion(e.target.value)}
                  placeholder="Enter the question..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="answer">Answer</Label>
                <Textarea
                  id="answer"
                  value={qaAnswer}
                  onChange={(e) => setQaAnswer(e.target.value)}
                  rows={4}
                  placeholder="Enter the answer..."
                />
              </div>
            </>
          )}

          {source.type === 'website' && (
            <div className="space-y-2">
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          )}

          {source.type === 'document' && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                File: <span className="font-medium">{source.sourceDocument?.fileName}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                To change the document, delete this source and upload a new file.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {source.type !== 'document' && (
            <>
              <Button onClick={handleSave} disabled={loading || reprocessing}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
              <Button onClick={handleSaveAndReprocess} disabled={loading || reprocessing}>
                {reprocessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save & Reprocess
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
