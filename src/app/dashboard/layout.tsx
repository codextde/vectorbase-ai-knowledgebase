import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import type { Profile, Organization, Subscription, Plan } from '@/types/database'

interface OrgWithDetails extends Organization {
  organization_members: { role: string }[]
  subscriptions: (Subscription & { plans: Plan })[]
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  })

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
    include: {
      organization: {
        include: {
          subscription: {
            include: { plan: true },
          },
        },
      },
    },
  })

  if (!membership) {
    redirect('/auth/login')
  }

  const profileData: Profile | null = profile ? {
    id: profile.id,
    email: profile.email,
    full_name: profile.fullName,
    avatar_url: profile.avatarUrl,
    created_at: profile.createdAt.toISOString(),
    updated_at: profile.updatedAt.toISOString(),
  } : null

  const org = membership.organization
  const currentOrg: OrgWithDetails = {
    id: org.id,
    name: org.name,
    slug: org.slug,
    owner_id: org.ownerId,
    settings: org.settings as Organization['settings'],
    created_at: org.createdAt.toISOString(),
    updated_at: org.updatedAt.toISOString(),
    organization_members: [{ role: membership.role }],
    subscriptions: org.subscription ? [{
      id: org.subscription.id,
      organization_id: org.subscription.organizationId,
      plan_id: org.subscription.planId,
      status: org.subscription.status as Subscription['status'],
      stripe_subscription_id: org.subscription.stripeSubscriptionId,
      stripe_customer_id: org.subscription.stripeCustomerId,
      stripe_price_id: org.subscription.stripePriceId,
      current_period_start: org.subscription.currentPeriodStart?.toISOString() || null,
      current_period_end: org.subscription.currentPeriodEnd?.toISOString() || null,
      cancel_at_period_end: org.subscription.cancelAtPeriodEnd,
      created_at: org.subscription.createdAt.toISOString(),
      updated_at: org.subscription.updatedAt.toISOString(),
      plans: {
        id: org.subscription.plan.id,
        name: org.subscription.plan.name,
        description: org.subscription.plan.description,
        price_monthly: org.subscription.plan.priceMonthly,
        price_yearly: org.subscription.plan.priceYearly,
        limits: org.subscription.plan.limits as Plan['limits'],
        features: org.subscription.plan.features as Plan['features'],
        is_active: org.subscription.plan.isActive,
        created_at: org.subscription.plan.createdAt.toISOString(),
      },
    }] : [],
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar 
        user={user} 
        profile={profileData} 
        organizations={[currentOrg]}
        currentOrg={currentOrg}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader user={user} profile={profileData} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
