import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  MessageSquare, 
  Search, 
  Database, 
  TrendingUp,
  Calendar,
  Activity
} from 'lucide-react'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth/login')
  }

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
    include: { organization: true },
  })

  if (!membership) {
    redirect('/auth/login')
  }

  const now = new Date()
  const thirtyDaysAgo = subDays(now, 30)
  const sevenDaysAgo = subDays(now, 7)

  const [
    totalMessages,
    totalQueries,
    totalSources,
    totalChunks,
    messagesLast7Days,
    messagesLast30Days,
    projects,
  ] = await Promise.all([
    prisma.usageRecord.count({
      where: {
        organizationId: membership.organizationId,
        type: 'message',
      },
    }),
    prisma.usageRecord.count({
      where: {
        organizationId: membership.organizationId,
        type: 'embedding',
      },
    }),
    prisma.source.count({
      where: {
        project: { organizationId: membership.organizationId },
      },
    }),
    prisma.chunk.count({
      where: {
        project: { organizationId: membership.organizationId },
      },
    }),
    prisma.usageRecord.count({
      where: {
        organizationId: membership.organizationId,
        type: 'message',
        createdAt: { gte: sevenDaysAgo },
      },
    }),
    prisma.usageRecord.count({
      where: {
        organizationId: membership.organizationId,
        type: 'message',
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    prisma.project.findMany({
      where: { organizationId: membership.organizationId },
      include: {
        _count: {
          select: {
            sources: true,
            chunks: true,
            usageRecords: { where: { type: 'message' } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const usageByDay = await prisma.usageRecord.groupBy({
    by: ['createdAt'],
    where: {
      organizationId: membership.organizationId,
      createdAt: { gte: sevenDaysAgo },
    },
    _count: true,
  })

  const dailyUsage: Record<string, number> = {}
  for (let i = 6; i >= 0; i--) {
    const date = format(subDays(now, i), 'MMM dd')
    dailyUsage[date] = 0
  }
  
  usageByDay.forEach((record: { createdAt: Date; _count: number }) => {
    const date = format(new Date(record.createdAt), 'MMM dd')
    if (dailyUsage[date] !== undefined) {
      dailyUsage[date] += record._count
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Monitor your knowledge base usage and performance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMessages.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {messagesLast7Days} in last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQueries.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Vector similarity searches
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sources</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSources.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Chunks</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalChunks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Embedded vectors
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Usage Last 7 Days
            </CardTitle>
            <CardDescription>Daily API usage breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(dailyUsage).map(([date, count]) => (
                <div key={date} className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-16">{date}</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ 
                        width: `${Math.max(2, (count / Math.max(...Object.values(dailyUsage), 1)) * 100)}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Projects Overview
            </CardTitle>
            <CardDescription>Usage by project</CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No projects yet
              </p>
            ) : (
              <div className="space-y-4">
                {projects.slice(0, 5).map((project: typeof projects[number]) => (
                  <div key={project.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {project._count.sources} sources · {project._count.chunks} chunks
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{project._count.usageRecords}</p>
                      <p className="text-xs text-muted-foreground">messages</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usage Summary</CardTitle>
          <CardDescription>Your usage for the current billing period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Messages (30 days)</p>
              <p className="text-2xl font-bold">{messagesLast30Days}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Active Projects</p>
              <p className="text-2xl font-bold">{projects.filter((p: typeof projects[number]) => p.isActive).length}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Storage Used</p>
              <p className="text-2xl font-bold">
                {(totalChunks * 0.002).toFixed(2)} MB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
