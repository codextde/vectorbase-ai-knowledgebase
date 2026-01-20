import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { prisma } from '@/lib/prisma'
import type { PlanLimits } from '@/types/database'
import {
  Database,
  FileText,
  Globe,
  MessageSquare,
  Shield,
  Code,
  ArrowRight,
  Check,
  Zap,
  Building2,
  Sparkles,
  TrendingUp,
} from 'lucide-react'

const features = [
  {
    icon: FileText,
    title: 'Document Processing',
    description: 'Upload PDFs, DOCX, TXT files and automatically extract and embed content.',
  },
  {
    icon: Globe,
    title: 'Website Crawling',
    description: 'Crawl websites and sitemaps to keep your knowledge base up-to-date.',
  },
  {
    icon: Database,
    title: 'Vector Database',
    description: 'Powered by pgvector for fast and accurate semantic search.',
  },
  {
    icon: MessageSquare,
    title: 'AI Chat',
    description: 'Built-in chat interface with RAG for accurate, contextual responses.',
  },
  {
    icon: Code,
    title: 'Developer API',
    description: 'RESTful API with token authentication. Perfect for n8n workflows.',
  },
  {
    icon: Shield,
    title: 'Self-Hosted Option',
    description: 'Run on your own infrastructure with full data control.',
  },
]

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

interface ParsedPlan {
  id: string
  name: string
  description: string | null
  price_monthly: number
  price_yearly: number
  limits: PlanLimits
  features: string[]
}

export default async function HomePage() {
  const dbPlans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { priceMonthly: 'asc' },
  })

  const plans: ParsedPlan[] = dbPlans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    description: plan.description,
    price_monthly: plan.priceMonthly,
    price_yearly: plan.priceYearly,
    limits: plan.limits as unknown as PlanLimits,
    features: plan.features as unknown as string[],
  }))
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-semibold text-xl group">
            <div className="relative h-9 w-9 overflow-hidden rounded-lg shadow-sm transition-transform group-hover:scale-105">
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
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-muted-foreground hover:text-foreground">
              Features
            </Link>
            <Link href="#pricing" className="text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Link href="https://github.com" className="text-muted-foreground hover:text-foreground">
              GitHub
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="secondary" className="mb-4">
              Developer-Friendly AI Knowledgebase
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-4xl mx-auto">
              Build AI-Powered Knowledge Bases in Minutes
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload documents, crawl websites, and create powerful AI assistants. 
              Perfect for chatbots, search, and n8n integrations.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="gap-2">
                  Start Building Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required - Free plan available
            </p>
          </div>
        </section>

        <section id="features" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold">Everything You Need</h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                A complete platform for building and deploying AI-powered knowledge bases
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <Card key={feature.title}>
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold">How It Works</h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Get started in three simple steps
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto">
                  1
                </div>
                <h3 className="mt-4 text-xl font-semibold">Create a Project</h3>
                <p className="mt-2 text-muted-foreground">
                  Set up a new knowledge base project in seconds
                </p>
              </div>
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto">
                  2
                </div>
                <h3 className="mt-4 text-xl font-semibold">Add Your Content</h3>
                <p className="mt-2 text-muted-foreground">
                  Upload documents, add text, or crawl websites
                </p>
              </div>
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto">
                  3
                </div>
                <h3 className="mt-4 text-xl font-semibold">Query via API</h3>
                <p className="mt-2 text-muted-foreground">
                  Use our API to search and chat with your knowledge base
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold">Simple, Transparent Pricing</h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Choose the plan that best fits your needs. Upgrade or downgrade anytime.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {plans.map((plan) => {
                const Icon = planIcons[plan.id] || Sparkles
                const isPopular = plan.id === 'pro'
                
                return (
                  <Card 
                    key={plan.id} 
                    className={`relative flex flex-col ${isPopular ? 'border-purple-300 dark:border-purple-700' : ''}`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-purple-600 text-white">Most Popular</Badge>
                      </div>
                    )}
                    
                    <CardHeader className="pb-4">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center mb-3 ${planColors[plan.id] || planColors.free}`}>
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
                      {plan.id === 'enterprise' ? (
                        <Button variant="outline" className="w-full">
                          Contact Sales
                        </Button>
                      ) : plan.id === 'free' ? (
                        <Link href="/auth/signup" className="w-full">
                          <Button variant="outline" className="w-full">
                            Get Started Free
                          </Button>
                        </Link>
                      ) : (
                        <Link href="/auth/signup" className="w-full">
                          <Button className="w-full" variant={isPopular ? 'default' : 'outline'}>
                            Start Free Trial
                          </Button>
                        </Link>
                      )}
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Join thousands of developers building AI-powered applications with VectorBase
            </p>
            <div className="mt-8">
              <Link href="/auth/signup">
                <Button size="lg" className="gap-2">
                  Create Your Free Account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2 font-semibold group">
              <div className="relative h-7 w-7 overflow-hidden rounded-md shadow-sm">
                <Image
                  src="/logo.jpg"
                  alt="VectorBase"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent font-semibold tracking-tight">
                VectorBase
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} VectorBase. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
