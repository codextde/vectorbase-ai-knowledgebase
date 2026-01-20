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
import { Plus, Copy, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface CreateApiKeyDialogProps {
  projectId: string
}

export function CreateApiKeyDialog({ projectId }: CreateApiKeyDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [keyName, setKeyName] = useState('')
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  async function handleCreateKey(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/projects/${projectId}/api-keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: keyName }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Failed to create API key')
        setLoading(false)
        return
      }

      setGeneratedKey(result.key)
      await navigator.clipboard.writeText(result.key)
      setCopied(true)
      toast.success('API key created and copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
      router.refresh()
    } catch {
      toast.error('Failed to create API key')
    }
    setLoading(false)
  }

  function handleCopy() {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey)
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function handleClose() {
    setOpen(false)
    setKeyName('')
    setGeneratedKey(null)
    setCopied(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { 
      if (!o && generatedKey) return;
      if (!o) handleClose(); 
      else setOpen(true); 
    }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Create API Key
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{generatedKey ? 'API Key Created' : 'Create API Key'}</DialogTitle>
          <DialogDescription>
            {generatedKey 
              ? 'Copy your API key now. You won\'t be able to see it again!'
              : 'Create a new API key to access your knowledge base'}
          </DialogDescription>
        </DialogHeader>

        {generatedKey ? (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <code className="text-sm font-mono break-all">{generatedKey}</code>
                <Button variant="ghost" size="icon" onClick={handleCopy}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <p className="text-sm text-destructive">
              Make sure to copy this key - you won&apos;t be able to see it again!
            </p>
            <Button onClick={handleClose} className="w-full">Done</Button>
          </div>
        ) : (
          <form onSubmit={handleCreateKey} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="key-name">Key Name</Label>
              <Input
                id="key-name"
                placeholder="e.g., Production, Development"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Key
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
