'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Users,
  UserPlus,
  Mail,
  MoreHorizontal,
  Trash2,
  Crown,
  Shield,
  User,
  Loader2,
  Copy,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

type Role = 'owner' | 'admin' | 'member'

interface TeamMember {
  id: string
  userId: string
  role: Role
  createdAt: string
  user: {
    id: string
    email: string
    fullName: string | null
    avatarUrl: string | null
  }
}

interface PendingInvite {
  id: string
  email: string
  role: Role
  status: string
  expiresAt: string
  createdAt: string
  invitedBy: string
}

interface MembersResponse {
  members: TeamMember[]
  invites: PendingInvite[]
  currentUserRole: Role
}

interface TeamMembersSettingsProps {
  organizationId: string
}

const roleConfig: Record<Role, { label: string; icon: typeof Crown; className: string }> = {
  owner: {
    label: 'Owner',
    icon: Crown,
    className: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  },
  admin: {
    label: 'Admin',
    icon: Shield,
    className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  member: {
    label: 'Member',
    icon: User,
    className: 'bg-muted text-muted-foreground border-border',
  },
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  return email.slice(0, 2).toUpperCase()
}

export function TeamMembersSettings({ organizationId }: TeamMembersSettingsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [invites, setInvites] = useState<PendingInvite[]>([])
  const [currentUserRole, setCurrentUserRole] = useState<Role>('member')

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<Role>('member')
  const [inviteLoading, setInviteLoading] = useState(false)

  const [removeMemberId, setRemoveMemberId] = useState<string | null>(null)
  const [removeLoading, setRemoveLoading] = useState(false)

  const [cancelInviteId, setCancelInviteId] = useState<string | null>(null)
  const [cancelLoading, setCancelLoading] = useState(false)

  const [roleChangeLoading, setRoleChangeLoading] = useState<string | null>(null)

  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null)

  const fetchMembers = useCallback(async () => {
    try {
      const response = await fetch(`/api/organizations/members?organizationId=${organizationId}`)
      if (!response.ok) throw new Error('Failed to fetch members')
      const data: MembersResponse = await response.json()
      setMembers(data.members)
      setInvites(data.invites)
      setCurrentUserRole(data.currentUserRole)
    } catch {
      toast.error('Failed to load team members')
    } finally {
      setLoading(false)
    }
  }, [organizationId])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  async function handleInviteMember() {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address')
      return
    }

    setInviteLoading(true)
    try {
      const response = await fetch('/api/organizations/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to send invite')
      }

      toast.success(`Invitation sent to ${inviteEmail}`)
      setInviteDialogOpen(false)
      setInviteEmail('')
      setInviteRole('member')
      fetchMembers()
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send invitation')
    } finally {
      setInviteLoading(false)
    }
  }

  async function handleRemoveMember(memberId: string) {
    setRemoveLoading(true)
    try {
      const response = await fetch(`/api/organizations/members/${memberId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to remove member')
      }

      toast.success('Member removed successfully')
      setRemoveMemberId(null)
      fetchMembers()
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove member')
    } finally {
      setRemoveLoading(false)
    }
  }

  async function handleCancelInvite(inviteId: string) {
    setCancelLoading(true)
    try {
      const response = await fetch(`/api/organizations/invites/${inviteId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to cancel invite')
      }

      toast.success('Invitation cancelled')
      setCancelInviteId(null)
      fetchMembers()
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to cancel invitation')
    } finally {
      setCancelLoading(false)
    }
  }

  async function handleRoleChange(memberId: string, newRole: Role) {
    setRoleChangeLoading(memberId)
    try {
      const response = await fetch(`/api/organizations/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update role')
      }

      toast.success('Role updated successfully')
      fetchMembers()
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update role')
    } finally {
      setRoleChangeLoading(null)
    }
  }

  function copyInviteLink(inviteId: string) {
    const inviteUrl = `${window.location.origin}/invite/${inviteId}`
    navigator.clipboard.writeText(inviteUrl)
    setCopiedInviteId(inviteId)
    toast.success('Invite link copied')
    setTimeout(() => setCopiedInviteId(null), 2000)
  }

  function canChangeRole(targetMember: TeamMember): boolean {
    if (currentUserRole !== 'owner') return false
    if (targetMember.role === 'owner') return false
    return true
  }

  function canRemoveMember(targetMember: TeamMember): boolean {
    if (targetMember.role === 'owner') return false
    if (currentUserRole === 'owner') return true
    if (currentUserRole === 'admin' && targetMember.role === 'member') return true
    return false
  }

  function canInviteMembers(): boolean {
    return currentUserRole === 'owner' || currentUserRole === 'admin'
  }

  function canCancelInvite(): boolean {
    return currentUserRole === 'owner' || currentUserRole === 'admin'
  }

  const memberToRemove = members.find((m) => m.id === removeMemberId)
  const inviteToCancel = invites.find((i) => i.id === cancelInviteId)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </CardTitle>
          <CardDescription>Manage who has access to your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </CardTitle>
              <CardDescription>Manage who has access to your organization</CardDescription>
            </div>
            {canInviteMembers() && (
              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>
                      Send an invitation to join your organization
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="invite-email">Email Address</Label>
                      <Input
                        id="invite-email"
                        type="email"
                        placeholder="colleague@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invite-role">Role</Label>
                      <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as Role)}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Member
                            </div>
                          </SelectItem>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              Admin
                            </div>
                          </SelectItem>
                          {currentUserRole === 'owner' && (
                            <SelectItem value="owner">
                              <div className="flex items-center gap-2">
                                <Crown className="h-4 w-4" />
                                Owner
                              </div>
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {inviteRole === 'member' && 'Members can view and use projects'}
                        {inviteRole === 'admin' && 'Admins can manage projects and invite members'}
                        {inviteRole === 'owner' && 'Owners have full control over the organization'}
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleInviteMember} disabled={inviteLoading}>
                      {inviteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Send Invitation
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => {
                const config = roleConfig[member.role]
                const RoleIcon = config.icon
                const isChangingRole = roleChangeLoading === member.id

                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.user.avatarUrl || undefined} />
                          <AvatarFallback>
                            {getInitials(member.user.fullName, member.user.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {member.user.fullName || member.user.email}
                          </p>
                          {member.user.fullName && (
                            <p className="text-sm text-muted-foreground">{member.user.email}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {canChangeRole(member) ? (
                        <Select
                          value={member.role}
                          onValueChange={(v) => handleRoleChange(member.id, v as Role)}
                          disabled={isChangingRole}
                        >
                          <SelectTrigger className="w-[130px]" size="sm">
                            {isChangingRole ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <SelectValue />
                            )}
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Member
                              </div>
                            </SelectItem>
                            <SelectItem value="admin">
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Admin
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline" className={config.className}>
                          <RoleIcon className="mr-1 h-3 w-3" />
                          {config.label}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(member.createdAt), { addSuffix: true })}
                      </span>
                    </TableCell>
                    <TableCell>
                      {canRemoveMember(member) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setRemoveMemberId(member.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {invites.length > 0 && canCancelInvite() && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium">Pending Invitations</h3>
                <Badge variant="secondary">{invites.length}</Badge>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Invited By</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invites.map((invite) => {
                    const config = roleConfig[invite.role]
                    const RoleIcon = config.icon
                    const isCopied = copiedInviteId === invite.id

                    return (
                      <TableRow key={invite.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-muted">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{invite.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={config.className}>
                            <RoleIcon className="mr-1 h-3 w-3" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">{invite.invitedBy}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(invite.expiresAt), { addSuffix: true })}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyInviteLink(invite.id)}
                              title="Copy invite link"
                            >
                              {isCopied ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setCancelInviteId(invite.id)}
                              title="Cancel invitation"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {members.length === 0 && invites.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No team members yet</p>
              <p className="text-sm text-muted-foreground">
                Invite your colleagues to collaborate
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!removeMemberId} onOpenChange={() => setRemoveMemberId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{' '}
              <span className="font-medium">
                {memberToRemove?.user.fullName || memberToRemove?.user.email}
              </span>{' '}
              from the organization? They will lose access to all projects and resources.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removeMemberId && handleRemoveMember(removeMemberId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={removeLoading}
            >
              {removeLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!cancelInviteId} onOpenChange={() => setCancelInviteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Invitation?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel the invitation to{' '}
              <span className="font-medium">{inviteToCancel?.email}</span>? They will no longer be
              able to join the organization using this link.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelInviteId && handleCancelInvite(cancelInviteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={cancelLoading}
            >
              {cancelLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cancel Invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
