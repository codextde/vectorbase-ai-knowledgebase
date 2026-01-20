'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Building2, Shield, User, Crown } from 'lucide-react'
import { toast } from 'sonner'

interface AcceptInviteFormProps {
  token: string
  organizationName: string
  inviterName: string
  role: string
}

const roleLabels: Record<string, { label: string; icon: typeof Crown }> = {
  owner: { label: 'Owner', icon: Crown },
  admin: { label: 'Admin', icon: Shield },
  member: { label: 'Member', icon: User },
}

export function AcceptInviteForm({ token, organizationName, inviterName, role }: AcceptInviteFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleAccept() {
    setLoading(true)
    try {
      const response = await fetch('/api/organizations/invites/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to accept invitation')
      }

      toast.success(`Welcome to ${organizationName}!`)
      router.push('/dashboard')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to accept invitation')
    } finally {
      setLoading(false)
    }
  }

  const roleConfig = roleLabels[role] || roleLabels.member
  const RoleIcon = roleConfig.icon

  return (
    <Card className="max-w-md w-full mx-4">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Building2 className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Join {organizationName}</CardTitle>
        <CardDescription>
          {inviterName} has invited you to join their organization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-muted-foreground">You will join as:</span>
          <Badge variant="outline" className="gap-1">
            <RoleIcon className="h-3 w-3" />
            {roleConfig.label}
          </Badge>
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={handleAccept} disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Accept Invitation
          </Button>
          <Button variant="outline" onClick={() => router.push('/dashboard')} disabled={loading}>
            Decline
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
