import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Shield, Bell, Building2 } from 'lucide-react'
import { ProfileSettings } from '@/components/settings/profile-settings'
import { SecuritySettings } from '@/components/settings/security-settings'
import { NotificationSettings } from '@/components/settings/notification-settings'
import { OrganizationSettings } from '@/components/settings/organization-settings'
import type { Organization } from '@/types/database'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
    include: { organization: true },
  })

  if (!membership) {
    redirect('/auth/login')
  }

  const isOwner = membership.role === 'owner'
  
  const organization: Organization = {
    id: membership.organization.id,
    name: membership.organization.name,
    slug: membership.organization.slug,
    owner_id: membership.organization.ownerId,
    settings: membership.organization.settings as Organization['settings'],
    created_at: membership.organization.createdAt.toISOString(),
    updated_at: membership.organization.updatedAt.toISOString(),
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none lg:flex">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          {isOwner && (
            <TabsTrigger value="organization" className="gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Organization</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <ProfileSettings 
            user={user} 
            profile={profile} 
          />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <SecuritySettings user={user} />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationSettings />
        </TabsContent>

        {isOwner && (
          <TabsContent value="organization" className="space-y-6">
            <OrganizationSettings organization={organization} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
