'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Loader2, Building2, AlertTriangle, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { Organization } from '@/types/database'
import { TeamMembersSettings } from './team-members-settings'

interface OrganizationSettingsProps {
  organization: Organization
}

export function OrganizationSettings({ organization }: OrganizationSettingsProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(organization.name)
  const [copied, setCopied] = useState(false)

  async function handleUpdateOrganization() {
    setLoading(true)

    try {
      const { error } = await supabase
        .from('organizations')
        .update({ 
          name,
          updated_at: new Date().toISOString(),
        } as never)
        .eq('id', organization.id)

      if (error) throw error

      toast.success('Organization updated successfully')
      router.refresh()
    } catch (error) {
      toast.error('Failed to update organization')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  function copyOrgId() {
    navigator.clipboard.writeText(organization.id)
    setCopied(true)
    toast.success('Organization ID copied')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organization Details
          </CardTitle>
          <CardDescription>
            Manage your organization settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization Name</Label>
              <Input
                id="orgName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter organization name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orgSlug">Organization Slug</Label>
              <Input
                id="orgSlug"
                value={organization.slug}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Used in URLs and API references
              </p>
            </div>

            <div className="space-y-2">
              <Label>Organization ID</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-muted rounded-md text-sm font-mono truncate">
                  {organization.id}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyOrgId}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <Button onClick={handleUpdateOrganization} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <TeamMembersSettings organizationId={organization.id} />

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible and destructive actions for the organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-destructive/30 rounded-lg bg-destructive/5">
            <div>
              <p className="font-medium">Transfer Ownership</p>
              <p className="text-sm text-muted-foreground">
                Transfer ownership to another team member
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Transfer
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-destructive/30 rounded-lg bg-destructive/5">
            <div>
              <p className="font-medium">Delete Organization</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete the organization and all data
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  Delete Organization
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Organization?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete &quot;{organization.name}&quot; and all 
                    associated projects, sources, API keys, and usage data. This action 
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => toast.info('Contact support to delete organization')}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Organization
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
