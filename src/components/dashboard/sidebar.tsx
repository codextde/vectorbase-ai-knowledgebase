'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  LayoutDashboard,
  FolderKanban,
  Settings,
  CreditCard,
  Key,
  MessageSquare,
  BarChart3,
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import type { Profile, Organization, Subscription, Plan } from '@/types/database'

interface OrgWithDetails extends Organization {
  organization_members: { role: string }[]
  subscriptions: (Subscription & { plans: Plan })[]
}

interface DashboardSidebarProps {
  user: User
  profile: Profile | null
  organizations: OrgWithDetails[]
  currentOrg: OrgWithDetails | null
}

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/projects', label: 'Projects', icon: FolderKanban },
  { href: '/dashboard/playground', label: 'Playground', icon: MessageSquare },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/api-keys', label: 'API Keys', icon: Key },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function DashboardSidebar({ currentOrg }: DashboardSidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-muted/10">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2.5 font-semibold group">
          <div className="relative h-8 w-8 overflow-hidden rounded-lg shadow-sm transition-transform group-hover:scale-105">
            <Image
              src="/logo.jpg"
              alt="VectorBase"
              fill
              className="object-cover"
              priority
            />
          </div>
          <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent font-bold tracking-tight">
            VectorBase
          </span>
        </Link>
      </div>
      
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-2',
                    isActive && 'bg-secondary'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs font-medium text-muted-foreground">Current Plan</p>
          <p className="text-sm font-semibold">
            {currentOrg?.subscriptions?.[0]?.plans?.name || 'Free'}
          </p>
          <Link href="/dashboard/billing">
            <Button variant="outline" size="sm" className="mt-2 w-full">
              Upgrade
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
