'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Loader2, Settings } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { Project } from '@/types/database'

interface ProjectGeneralSettingsProps {
  project: Project
}

export function ProjectGeneralSettings({ project }: ProjectGeneralSettingsProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(project.name)
  const [description, setDescription] = useState(project.description || '')
  const [isActive, setIsActive] = useState(project.is_active)

  async function handleSave() {
    if (!name.trim()) {
      toast.error('Project name is required')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name,
          description: description || null,
          is_active: isActive,
          updated_at: new Date().toISOString(),
        } as never)
        .eq('id', project.id)

      if (error) throw error

      toast.success('Project settings saved')
      router.refresh()
    } catch (error) {
      toast.error('Failed to save project settings')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          General Settings
        </CardTitle>
        <CardDescription>
          Basic project information and status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 max-w-lg">
          <div className="space-y-2">
            <Label htmlFor="projectName">Project Name</Label>
            <Input
              id="projectName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Knowledge Base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this knowledge base is for..."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="isActive" className="font-medium">Active Status</Label>
              <p className="text-sm text-muted-foreground">
                {isActive 
                  ? 'Project is active and accepting queries' 
                  : 'Project is inactive and will not respond to queries'}
              </p>
            </div>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </CardContent>
    </Card>
  )
}
