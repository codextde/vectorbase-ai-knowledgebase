'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, FileText, Type, HelpCircle, Globe, Upload, Loader2, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import type { Source } from '@/types/database'
import { WebsiteSourceDialog } from '@/components/projects/website-source-dialog'
import { NotionSourceDialog } from '@/components/projects/notion-source-dialog'

interface AddSourceDialogProps {
  projectId: string
}

export function AddSourceDialog({ projectId }: AddSourceDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [textName, setTextName] = useState('')
  const [textContent, setTextContent] = useState('')

  const [qaQuestion, setQaQuestion] = useState('')
  const [qaAnswer, setQaAnswer] = useState('')

  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  async function handleAddDocument(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedFile) {
      toast.error('Please select a file')
      return
    }
    
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File too large (max 10MB)')
      return
    }
    
    setLoading(true)

    const supabase = createClient()
    
    const fileExt = selectedFile.name.split('.').pop()
    const storagePath = `${projectId}/${crypto.randomUUID()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, selectedFile)

    if (uploadError) {
      toast.error(uploadError.message)
      setLoading(false)
      return
    }

    const { data: source, error: sourceError } = await supabase
      .from('sources')
      .insert({
        project_id: projectId,
        type: 'document' as const,
        name: selectedFile.name,
        status: 'pending' as const,
      } as never)
      .select()
      .single() as { data: Source | null, error: Error | null }

    if (sourceError || !source) {
      toast.error(sourceError?.message || 'Failed to create source')
      setLoading(false)
      return
    }

    const { error: docError } = await supabase
      .from('source_documents')
      .insert({
        id: source.id,
        file_name: selectedFile.name,
        file_type: selectedFile.type || `application/${fileExt}`,
        file_size: selectedFile.size,
        storage_path: storagePath,
        original_name: selectedFile.name,
      } as never)

    if (docError) {
      toast.error(docError.message)
      setLoading(false)
      return
    }

    toast.success('Document uploaded! Processing in background...')
    
    fetch(`/api/sources/${source.id}/process`, { method: 'POST' })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          toast.success('Processing started! Check back soon.')
        } else {
          toast.error(result.error || 'Failed to start processing')
        }
        router.refresh()
      })
      .catch(() => toast.error('Failed to start processing'))
    
    setSelectedFile(null)
    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  async function handleAddText(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    
    const { data: source, error: sourceError } = await supabase
      .from('sources')
      .insert({
        project_id: projectId,
        type: 'text' as const,
        name: textName,
        status: 'pending' as const,
      } as never)
      .select()
      .single() as { data: Source | null, error: Error | null }

    if (sourceError || !source) {
      toast.error(sourceError?.message || 'Failed to create source')
      setLoading(false)
      return
    }

    const { error: textError } = await supabase
      .from('source_texts')
      .insert({
        id: source.id,
        content: textContent,
      } as never)

    if (textError) {
      toast.error(textError.message)
      setLoading(false)
      return
    }

    toast.success('Text source added! Processing in background...')
    
    fetch(`/api/sources/${source.id}/process`, { method: 'POST' })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          toast.success('Processing started!')
        } else {
          toast.error(result.error || 'Failed to start processing')
        }
        router.refresh()
      })
      .catch(() => toast.error('Failed to start processing'))
    
    setTextName('')
    setTextContent('')
    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  async function handleAddQA(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    
    const { data: source, error: sourceError } = await supabase
      .from('sources')
      .insert({
        project_id: projectId,
        type: 'qa' as const,
        name: qaQuestion.substring(0, 50) + (qaQuestion.length > 50 ? '...' : ''),
        status: 'pending' as const,
      } as never)
      .select()
      .single() as { data: Source | null, error: Error | null }

    if (sourceError || !source) {
      toast.error(sourceError?.message || 'Failed to create source')
      setLoading(false)
      return
    }

    const { error: qaError } = await supabase
      .from('source_qa')
      .insert({
        id: source.id,
        question: qaQuestion,
        answer: qaAnswer,
      } as never)

    if (qaError) {
      toast.error(qaError.message)
      setLoading(false)
      return
    }

    toast.success('Q&A pair added! Processing in background...')
    
    fetch(`/api/sources/${source.id}/process`, { method: 'POST' })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          toast.success('Processing started!')
        } else {
          toast.error(result.error || 'Failed to start processing')
        }
        router.refresh()
      })
      .catch(() => toast.error('Failed to start processing'))
    
    setQaQuestion('')
    setQaAnswer('')
    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Source
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Source</DialogTitle>
          <DialogDescription>
            Add a new source to train your knowledge base
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="document" className="mt-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="document" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Document
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Text
            </TabsTrigger>
            <TabsTrigger value="qa" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Q&A
            </TabsTrigger>
            <TabsTrigger value="website" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Website
            </TabsTrigger>
            <TabsTrigger value="notion" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Notion
            </TabsTrigger>
          </TabsList>

          <TabsContent value="document" className="space-y-4 pt-4">
            <form onSubmit={handleAddDocument} className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                {selectedFile ? (
                  <p className="mt-2 text-sm font-medium">{selectedFile.name}</p>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Click to select a file
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Supports PDF, DOCX, TXT, and images (PNG, JPG, GIF, WebP) - max 10MB
                </p>
                <Input
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg,.gif,.webp,image/*"
                  id="file-upload"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                <Button variant="outline" className="mt-4" type="button" asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {selectedFile ? 'Change File' : 'Select File'}
                  </label>
                </Button>
              </div>
              <Button type="submit" className="w-full" disabled={loading || !selectedFile}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Upload Document
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="text" className="space-y-4 pt-4">
            <form onSubmit={handleAddText} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="text-name">Name</Label>
                <Input
                  id="text-name"
                  placeholder="e.g., Company Overview"
                  value={textName}
                  onChange={(e) => setTextName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="text-content">Content</Label>
                <Textarea
                  id="text-content"
                  placeholder="Enter your text content..."
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  rows={8}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Text Source
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="qa" className="space-y-4 pt-4">
            <form onSubmit={handleAddQA} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qa-question">Question</Label>
                <Input
                  id="qa-question"
                  placeholder="e.g., What are your business hours?"
                  value={qaQuestion}
                  onChange={(e) => setQaQuestion(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qa-answer">Answer</Label>
                <Textarea
                  id="qa-answer"
                  placeholder="Enter the answer..."
                  value={qaAnswer}
                  onChange={(e) => setQaAnswer(e.target.value)}
                  rows={4}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Q&A Pair
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="website" className="space-y-4 pt-4">
            <div className="flex flex-col items-center justify-center py-8">
              <Globe className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground text-center mb-4">
                Crawl websites, submit sitemaps, or add individual links to your knowledge base.
              </p>
              <WebsiteSourceDialog
                projectId={projectId}
                trigger={
                  <Button>
                    <Globe className="mr-2 h-4 w-4" />
                    Add Website Source
                  </Button>
                }
              />
            </div>
          </TabsContent>

          <TabsContent value="notion" className="space-y-4 pt-4">
            <div className="flex flex-col items-center justify-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground text-center mb-4">
                Connect your Notion workspace to import pages and databases.
              </p>
              <NotionSourceDialog
                projectId={projectId}
                trigger={
                  <Button>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Connect Notion
                  </Button>
                }
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
