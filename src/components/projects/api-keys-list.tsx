'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Key, Trash2, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteApiKey } from '@/app/dashboard/projects/[projectId]/actions'
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

interface ApiKey {
  id: string
  name: string
  key_prefix: string
  is_active: boolean
  created_at: string
  last_used_at: string | null
}

interface ApiKeysListProps {
  apiKeys: ApiKey[]
  projectId: string
}

export function ApiKeysList({ apiKeys, projectId }: ApiKeysListProps) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleDelete = async (keyId: string) => {
    setLoadingId(keyId)
    try {
      const result = await deleteApiKey(keyId, projectId)
      
      if (result.success) {
        toast.success('API key deleted successfully')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to delete API key')
      }
    } catch {
      toast.error('Failed to delete API key')
    } finally {
      setLoadingId(null)
      setDeleteId(null)
    }
  }

  if (apiKeys.length === 0) {
    return null
  }

  return (
    <>
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently deactivate this API key. Any applications using this key will no longer be able to access your project. This action cannot be undone.
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
        {apiKeys.map((key) => {
          const isLoading = loadingId === key.id

          return (
            <div 
              key={key.id} 
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Key className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{key.name}</p>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-sm text-muted-foreground font-mono">{key.key_prefix}...</p>
                    <span className="text-xs text-muted-foreground">-</span>
                    <span className="text-xs text-muted-foreground">
                      Created {formatDistanceToNow(new Date(key.created_at), { addSuffix: true })}
                    </span>
                    {key.last_used_at && (
                      <>
                        <span className="text-xs text-muted-foreground">-</span>
                        <span className="text-xs text-muted-foreground">
                          Last used {formatDistanceToNow(new Date(key.last_used_at), { addSuffix: true })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleteId(key.id)}
                disabled={isLoading}
                title="Delete API key"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          )
        })}
      </div>
    </>
  )
}
