'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useMobileSidebar } from './mobile-sidebar-context'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FolderKanban,
  Settings,
  CreditCard,
  Key,
  MessageSquare,
  BarChart3,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/projects', label: 'Projects', icon: FolderKanban },
  { href: '/dashboard/playground', label: 'Playground', icon: MessageSquare },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/api-keys', label: 'API Keys', icon: Key },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

interface MobileSidebarDrawerProps {
  currentPlan?: string
}

export function MobileSidebarDrawer({ currentPlan = 'Free' }: MobileSidebarDrawerProps) {
  const pathname = usePathname()
  const { isOpen, setIsOpen, close } = useMobileSidebar()

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="h-14 flex-row items-center justify-start gap-2.5 border-b px-4">
          <Link href="/dashboard" className="flex items-center gap-2.5" onClick={close}>
            <div className="relative h-8 w-8 overflow-hidden rounded-lg shadow-sm">
              <Image src="/logo.jpg" alt="VectorBase" fill className="object-cover" />
            </div>
            <SheetTitle className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent font-bold tracking-tight">
              VectorBase
            </SheetTitle>
          </Link>
        </SheetHeader>

        <ScrollArea className="flex-1 py-4 h-[calc(100vh-8rem)]">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link key={item.href} href={item.href} onClick={close}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={cn('w-full justify-start gap-2', isActive && 'bg-secondary')}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </ScrollArea>

        <div className="absolute bottom-0 left-0 right-0 border-t p-4 bg-background">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs font-medium text-muted-foreground">Current Plan</p>
            <p className="text-sm font-semibold">{currentPlan}</p>
            <Link href="/dashboard/billing" onClick={close}>
              <Button variant="outline" size="sm" className="mt-2 w-full">
                Upgrade
              </Button>
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
