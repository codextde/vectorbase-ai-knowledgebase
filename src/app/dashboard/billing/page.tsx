import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Check, 
  Zap, 
  Building2, 
  Sparkles,
  CreditCard,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { format, subDays } from 'date-fns'
import type { Plan, PlanLimits } from '@/types/database'
import { CheckoutButton } from '@/components/billing/checkout-button'
import { ManageSubscriptionButton } from '@/components/billing/manage-subscription-button'

interface PlanWithParsedData extends Omit<Plan, 'limits' | 'features'> {
  limits: PlanLimits
  features: string[]
}

const planIcons: Record<string, React.ElementType> = {
  free: Sparkles,
  starter: Zap,
  pro: TrendingUp,
  enterprise: Building2,
}

const planColors: Record<string, string> = {
  free: 'bg-slate-100 text-slate-700 border-slate-200',
  starter: 'bg-blue-100 text-blue-700 border-blue-200',
  pro: 'bg-purple-100 text-purple-700 border-purple-200',
  enterprise: 'bg-amber-100 text-amber-700 border-amber-200',
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth/login')
  }
  
  const showSuccess = params.success === 'true'
  const showCanceled = params.canceled === 'true'

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

  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { priceMonthly: 'asc' },
  })

  const parsedPlans: PlanWithParsedData[] = plans.map((plan: typeof plans[number]) => ({
    id: plan.id,
    name: plan.name,
    description: plan.description,
    price_monthly: plan.priceMonthly,
    price_yearly: plan.priceYearly,
    limits: plan.limits as unknown as PlanLimits,
    features: plan.features as unknown as string[],
    is_active: plan.isActive,
    created_at: plan.createdAt.toISOString(),
  }))

  const currentSubscription = membership.organization.subscription
  const currentPlan = currentSubscription?.plan
  const currentPlanId = currentPlan?.id || 'free'

  const thirtyDaysAgo = subDays(new Date(), 30)
  
  const [messagesUsed, projectsCount, sourcesCount, totalChunks] = await Promise.all([
    prisma.usageRecord.count({
      where: {
        organizationId: membership.organizationId,
        type: 'message',
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    prisma.project.count({
      where: { organizationId: membership.organizationId },
    }),
    prisma.source.count({
      where: { project: { organizationId: membership.organizationId } },
    }),
    prisma.chunk.count({
      where: { project: { organizationId: membership.organizationId } },
    }),
  ])

  const currentLimits = (currentPlan?.limits as unknown as PlanLimits) || parsedPlans.find(p => p.id === 'free')?.limits
  const messageLimit = currentLimits?.message_credits_monthly || 20
  const projectLimit = currentLimits?.projects || 1
  const storageUsedMb = (totalChunks * 0.002)
  const storageLimit = currentLimits?.storage_mb || 100

  const messagePercentage = messageLimit === -1 ? 0 : Math.min((messagesUsed / messageLimit) * 100, 100)
  const projectPercentage = projectLimit === -1 ? 0 : Math.min((projectsCount / projectLimit) * 100, 100)
  const storagePercentage = storageLimit === -1 ? 0 : Math.min((storageUsedMb / storageLimit) * 100, 100)

  const hasStripeCustomer = !!currentSubscription?.stripeCustomerId

  return (
    <div className="space-y-8">
      {showSuccess && (
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-medium text-green-800 dark:text-green-200">
              Payment successful!
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              Your subscription has been updated. Thank you for your purchase.
            </p>
          </div>
        </div>
      )}

      {showCanceled && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <XCircle className="h-5 w-5 text-amber-600" />
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-200">
              Checkout canceled
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Your subscription was not changed. You can try again anytime.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing & Plans</h1>
          <p className="text-muted-foreground">
            Manage your subscription and view usage
          </p>
        </div>
        {hasStripeCustomer && <ManageSubscriptionButton />}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Current Plan
                </CardTitle>
                <CardDescription>Your active subscription details</CardDescription>
              </div>
              <Badge className={planColors[currentPlanId] || planColors.free}>
                {currentPlan?.name || 'Free'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-semibold text-2xl">
                  ${currentPlan?.priceMonthly || 0}
                  <span className="text-sm font-normal text-muted-foreground">/month</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentPlan?.description || 'Perfect for trying out VectorBase'}
                </p>
              </div>
              {currentSubscription && (
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Renews</span>
                  </div>
                  <p className="font-medium">
                    {currentSubscription.currentPeriodEnd 
                      ? format(new Date(currentSubscription.currentPeriodEnd), 'MMM d, yyyy')
                      : 'N/A'}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Usage This Month</h4>
              
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Messages</span>
                    <span className="text-muted-foreground">
                      {messagesUsed.toLocaleString()} / {messageLimit === -1 ? 'Unlimited' : messageLimit.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={messagePercentage} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Projects</span>
                    <span className="text-muted-foreground">
                      {projectsCount} / {projectLimit === -1 ? 'Unlimited' : projectLimit}
                    </span>
                  </div>
                  <Progress value={projectPercentage} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Storage</span>
                    <span className="text-muted-foreground">
                      {storageUsedMb.toFixed(2)} MB / {storageLimit === -1 ? 'Unlimited' : `${storageLimit} MB`}
                    </span>
                  </div>
                  <Progress value={storagePercentage} className="h-2" />
                </div>
              </div>
            </div>

            {(messagePercentage > 80 || projectPercentage > 80) && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    Approaching limit
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    You&apos;re using most of your plan&apos;s resources. Consider upgrading for more capacity.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Your account overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Total Sources</span>
              <span className="font-semibold">{sourcesCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Total Chunks</span>
              <span className="font-semibold">{totalChunks.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Organization</span>
              <span className="font-semibold">{membership.organization.name}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Member Since</span>
              <span className="font-semibold">
                {format(new Date(membership.organization.createdAt), 'MMM yyyy')}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Available Plans</h2>
        <p className="text-muted-foreground mb-6">
          Choose the plan that best fits your needs. Upgrade or downgrade anytime.
        </p>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {parsedPlans.map((plan) => {
            const Icon = planIcons[plan.id] || Sparkles
            const isCurrentPlan = plan.id === currentPlanId
            const isPopular = plan.id === 'pro'
            
            return (
              <Card 
                key={plan.id} 
                className={`relative flex flex-col ${isCurrentPlan ? 'ring-2 ring-primary' : ''} ${isPopular ? 'border-purple-300 dark:border-purple-700' : ''}`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-purple-600 text-white">Most Popular</Badge>
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-3 right-4">
                    <Badge variant="default">Current</Badge>
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center mb-3 ${planColors[plan.id]}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription className="min-h-[40px]">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1">
                  <div className="mb-6">
                    <span className="text-4xl font-bold">${plan.price_monthly}</span>
                    <span className="text-muted-foreground">/month</span>
                    {plan.price_yearly > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        ${plan.price_yearly}/year (save ${plan.price_monthly * 12 - plan.price_yearly})
                      </p>
                    )}
                  </div>
                  
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter className="pt-4">
                  {isCurrentPlan ? (
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : plan.id === 'enterprise' ? (
                    <Button variant="outline" className="w-full">
                      Contact Sales
                    </Button>
                  ) : plan.id === 'free' ? (
                    <Button variant="outline" className="w-full" disabled>
                      Free Forever
                    </Button>
                  ) : (
                    <CheckoutButton
                      planId={plan.id}
                      currentPlanPrice={currentPlan?.priceMonthly || 0}
                      planPrice={plan.price_monthly}
                      isPopular={isPopular}
                    />
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View your past invoices and payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No billing history yet</p>
            <p className="text-sm">Your invoices will appear here once you upgrade to a paid plan.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
