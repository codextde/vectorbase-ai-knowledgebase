'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView } from 'motion/react'
import { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
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
  Menu,
  X,
  Github,
  Twitter,
  ChevronRight,
  Bot,
  Layers,
  Lock,
  Gauge,
} from 'lucide-react'

const features = [
  {
    icon: FileText,
    title: 'Document Processing',
    description: 'Upload PDFs, DOCX, TXT files and automatically extract and embed content with state-of-the-art embeddings.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Globe,
    title: 'Website Crawling',
    description: 'Crawl entire websites and sitemaps automatically. Keep your knowledge base synced and up-to-date.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Database,
    title: 'Vector Database',
    description: 'Powered by pgvector for lightning-fast semantic search with sub-millisecond query times.',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    icon: MessageSquare,
    title: 'AI-Powered Chat',
    description: 'Built-in RAG chat interface with streaming responses and source citations.',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    icon: Code,
    title: 'Developer API',
    description: 'RESTful API with Bearer token auth. Perfect for n8n, Zapier, and custom integrations.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: Shield,
    title: 'Enterprise Ready',
    description: 'Self-hosted option available. SOC 2 compliant with full data control and encryption.',
    gradient: 'from-indigo-500 to-blue-500',
  },
]

const stats = [
  { value: '10M+', label: 'Vectors Indexed' },
  { value: '500ms', label: 'Avg. Response Time' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '50+', label: 'Integrations' },
]

const logos = [
  'Vercel', 'Supabase', 'Railway', 'Render', 'Fly.io', 'DigitalOcean'
]

function AnimatedText({ children, className = '', delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function FeatureCard({ feature, index }: { feature: typeof features[0], index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      <motion.div
        whileHover={{ y: -5, scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className="group relative h-full rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent p-6 backdrop-blur-sm transition-colors hover:border-white/20"
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${feature.gradient} p-3`}>
          <feature.icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-white">{feature.title}</h3>
        <p className="text-sm leading-relaxed text-white/60">{feature.description}</p>
      </motion.div>
    </motion.div>
  )
}

function PricingCard({ plan, index, isPopular }: { plan: { name: string, price: string, description: string, features: string[], cta: string, href: string }, index: number, isPopular?: boolean }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative"
    >
      {isPopular && (
        <div className="absolute -top-4 left-0 right-0 flex justify-center">
          <span className="rounded-full bg-gradient-to-r from-violet-500 to-purple-500 px-4 py-1 text-xs font-medium text-white">
            Most Popular
          </span>
        </div>
      )}
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
        className={`relative h-full rounded-2xl border p-6 backdrop-blur-sm ${
          isPopular 
            ? 'border-violet-500/50 bg-gradient-to-br from-violet-500/10 to-purple-500/5' 
            : 'border-white/10 bg-white/[0.03]'
        }`}
      >
        <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
        <p className="mt-2 text-sm text-white/60">{plan.description}</p>
        <div className="mt-4">
          <span className="text-4xl font-bold text-white">{plan.price}</span>
          {plan.price !== 'Custom' && <span className="text-white/60">/month</span>}
        </div>
        <ul className="mt-6 space-y-3">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-center gap-3 text-sm text-white/80">
              <Check className="h-4 w-4 shrink-0 text-violet-400" />
              {feature}
            </li>
          ))}
        </ul>
        <Link href={plan.href} className="mt-6 block">
          <Button 
            className={`w-full ${isPopular ? 'bg-white text-black hover:bg-white/90' : 'bg-white/10 hover:bg-white/20'}`}
            variant={isPopular ? 'default' : 'ghost'}
          >
            {plan.cta}
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  )
}

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for trying out VectorBase',
    features: ['1 Project', '10 Documents', '20 Messages/month', 'Community Support'],
    cta: 'Get Started',
    href: '/auth/signup',
  },
  {
    name: 'Pro',
    price: '$29',
    description: 'For growing teams and products',
    features: ['Unlimited Projects', 'Unlimited Documents', '10,000 Messages/month', 'Priority Support', 'API Access', 'Custom Integrations'],
    cta: 'Start Free Trial',
    href: '/auth/signup',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large-scale deployments',
    features: ['Everything in Pro', 'Unlimited Messages', 'Dedicated Support', 'SLA Guarantee', 'Self-hosted Option', 'Custom Contracts'],
    cta: 'Contact Sales',
    href: '/contact',
  },
]

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent" />
        <div className="absolute inset-0 grid-pattern opacity-30" />
      </div>
      
      <motion.header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5' : ''
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative h-8 w-8 overflow-hidden rounded-lg">
                <Image src="/logo.jpg" alt="VectorBase" fill className="object-cover" priority />
              </div>
              <span className="text-lg font-semibold tracking-tight">VectorBase</span>
            </Link>
            
            <nav className="hidden items-center gap-8 md:flex">
              <Link href="#features" className="text-sm text-white/60 transition-colors hover:text-white">Features</Link>
              <Link href="#pricing" className="text-sm text-white/60 transition-colors hover:text-white">Pricing</Link>
              <Link href="https://github.com" className="text-sm text-white/60 transition-colors hover:text-white">Docs</Link>
              <Link href="https://github.com" className="text-sm text-white/60 transition-colors hover:text-white">GitHub</Link>
            </nav>
            
            <div className="hidden items-center gap-3 md:flex">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">Log in</Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-white text-black hover:bg-white/90">Get Started</Button>
              </Link>
            </div>
            
            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="border-t border-white/10 bg-[#0a0a0f]/95 backdrop-blur-xl md:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              <Link href="#features" className="block rounded-lg px-3 py-2 text-white/80 hover:bg-white/5" onClick={() => setMobileMenuOpen(false)}>Features</Link>
              <Link href="#pricing" className="block rounded-lg px-3 py-2 text-white/80 hover:bg-white/5" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
              <Link href="https://github.com" className="block rounded-lg px-3 py-2 text-white/80 hover:bg-white/5">Docs</Link>
              <Link href="https://github.com" className="block rounded-lg px-3 py-2 text-white/80 hover:bg-white/5">GitHub</Link>
              <div className="border-t border-white/10 pt-4 mt-4 space-y-2">
                <Link href="/auth/login" className="block">
                  <Button variant="ghost" className="w-full justify-center text-white/80">Log in</Button>
                </Link>
                <Link href="/auth/signup" className="block">
                  <Button className="w-full bg-white text-black hover:bg-white/90">Get Started</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </motion.header>

      <main>
        <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Link 
                  href="/changelog" 
                  className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/80 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
                >
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                  New: Notion Integration Available
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </motion.div>
              
              <motion.h1 
                className="mt-8 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <span className="block">Build AI-powered</span>
                <span className="block bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  knowledge bases
                </span>
              </motion.h1>
              
              <motion.p 
                className="mx-auto mt-6 max-w-2xl text-lg text-white/60 sm:text-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Upload documents, crawl websites, and create intelligent AI assistants. 
                The modern RAG infrastructure for developers.
              </motion.p>
              
              <motion.div 
                className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Link href="/auth/signup">
                  <Button size="lg" className="h-12 gap-2 bg-white px-6 text-black hover:bg-white/90">
                    Start Building Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="https://github.com">
                  <Button size="lg" variant="ghost" className="h-12 gap-2 border border-white/10 px-6 hover:bg-white/5">
                    <Github className="h-4 w-4" />
                    View on GitHub
                  </Button>
                </Link>
              </motion.div>
              
              <motion.p 
                className="mt-6 text-sm text-white/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                No credit card required · Free tier available · Self-host option
              </motion.p>
            </div>
            
            <motion.div 
              className="relative mx-auto mt-20 max-w-5xl"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl" />
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent p-2 backdrop-blur-sm">
                <div className="rounded-xl bg-[#0d0d14] p-1">
                  <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-white/10" />
                      <div className="h-3 w-3 rounded-full bg-white/10" />
                      <div className="h-3 w-3 rounded-full bg-white/10" />
                    </div>
                    <div className="ml-4 flex-1 rounded-md bg-white/5 px-3 py-1 text-xs text-white/40">
                      app.vectorbase.dev/dashboard
                    </div>
                  </div>
                  <div className="aspect-[16/9] rounded-b-lg bg-gradient-to-br from-[#12121a] to-[#0a0a0f] p-8">
                    <div className="grid h-full grid-cols-4 gap-4">
                      <div className="col-span-1 space-y-3">
                        <div className="h-8 w-full rounded-lg bg-white/5" />
                        <div className="h-6 w-3/4 rounded-lg bg-white/5" />
                        <div className="h-6 w-full rounded-lg bg-violet-500/20" />
                        <div className="h-6 w-3/4 rounded-lg bg-white/5" />
                        <div className="h-6 w-5/6 rounded-lg bg-white/5" />
                      </div>
                      <div className="col-span-3 space-y-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                        <div className="flex items-center justify-between">
                          <div className="h-6 w-32 rounded-lg bg-white/10" />
                          <div className="h-8 w-24 rounded-lg bg-violet-500/30" />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          {[...Array(6)].map((_, i) => (
                            <div key={i} className="space-y-2 rounded-lg border border-white/5 bg-white/[0.02] p-3">
                              <div className="h-4 w-3/4 rounded bg-white/10" />
                              <div className="h-3 w-full rounded bg-white/5" />
                              <div className="h-3 w-2/3 rounded bg-white/5" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="border-y border-white/5 bg-white/[0.02] py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <p className="mb-8 text-center text-sm text-white/40">Trusted by developers at</p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
              {logos.map((logo, i) => (
                <motion.span 
                  key={logo}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="text-lg font-semibold text-white/20"
                >
                  {logo}
                </motion.span>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, i) => (
                <AnimatedText key={stat.label} delay={i * 0.1} className="text-center">
                  <div className="text-4xl font-bold text-white sm:text-5xl">{stat.value}</div>
                  <div className="mt-2 text-sm text-white/60">{stat.label}</div>
                </AnimatedText>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <AnimatedText className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need to build
                <span className="block bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                  intelligent applications
                </span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60">
                A complete RAG infrastructure with all the tools to upload, process, 
                and query your knowledge bases at scale.
              </p>
            </AnimatedText>
            
            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <FeatureCard key={feature.title} feature={feature} index={index} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <AnimatedText className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60">
                Get started in minutes with our simple three-step process
              </p>
            </AnimatedText>
            
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {[
                { step: '01', title: 'Create a Project', description: 'Set up a new knowledge base project in seconds. Configure your AI model and chunking strategy.', icon: Layers },
                { step: '02', title: 'Add Your Data', description: 'Upload documents, paste text, crawl websites, or sync Notion. We handle the embeddings automatically.', icon: Database },
                { step: '03', title: 'Query via API', description: 'Use our REST API to search and chat with your knowledge base. Perfect for chatbots and integrations.', icon: Code },
              ].map((item, i) => (
                <AnimatedText key={item.step} delay={i * 0.15}>
                  <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                    <span className="absolute -top-4 left-6 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 px-3 py-1 text-xs font-semibold">
                      Step {item.step}
                    </span>
                    <div className="mb-4 mt-2 inline-flex rounded-xl bg-white/5 p-3">
                      <item.icon className="h-6 w-6 text-violet-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-white/60">{item.description}</p>
                  </div>
                </AnimatedText>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-white/5 bg-gradient-to-b from-violet-500/5 to-transparent py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <AnimatedText className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Built for developers</h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60">
                Simple, powerful APIs that get out of your way
              </p>
            </AnimatedText>
            
            <AnimatedText delay={0.2} className="mx-auto mt-12 max-w-3xl">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d14]">
                <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
                  <span className="text-xs text-white/40">Query your knowledge base</span>
                </div>
                <pre className="overflow-x-auto p-4 text-sm">
                  <code className="text-white/80">{`curl -X POST https://api.vectorbase.dev/v1/chat \\
  -H "Authorization: Bearer vb_sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "messages": [
      {"role": "user", "content": "What is our refund policy?"}
    ],
    "stream": true
  }'`}</code>
                </pre>
              </div>
            </AnimatedText>
            
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {[
                { icon: Gauge, title: 'Sub-100ms Latency', description: 'Optimized for real-time applications' },
                { icon: Lock, title: 'Enterprise Security', description: 'SOC 2 compliant, encrypted at rest' },
                { icon: Bot, title: 'AI-Native', description: 'Built for LLM applications from day one' },
              ].map((item, i) => (
                <AnimatedText key={item.title} delay={0.3 + i * 0.1} className="text-center">
                  <div className="inline-flex rounded-xl bg-white/5 p-3">
                    <item.icon className="h-6 w-6 text-violet-400" />
                  </div>
                  <h3 className="mt-4 font-semibold text-white">{item.title}</h3>
                  <p className="mt-1 text-sm text-white/60">{item.description}</p>
                </AnimatedText>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <AnimatedText className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple, transparent pricing</h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60">
                Start free, scale as you grow. No hidden fees.
              </p>
            </AnimatedText>
            
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {plans.map((plan, index) => (
                <PricingCard key={plan.name} plan={plan} index={index} isPopular={plan.name === 'Pro'} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <AnimatedText>
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-transparent p-8 sm:p-16">
                <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
                <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
                <div className="relative text-center">
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Ready to get started?
                  </h2>
                  <p className="mx-auto mt-4 max-w-xl text-lg text-white/60">
                    Join thousands of developers building AI-powered applications with VectorBase.
                  </p>
                  <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                    <Link href="/auth/signup">
                      <Button size="lg" className="h-12 gap-2 bg-white px-8 text-black hover:bg-white/90">
                        Start Building Free
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/contact">
                      <Button size="lg" variant="ghost" className="h-12 gap-2 border border-white/10 px-8 hover:bg-white/5">
                        Contact Sales
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </AnimatedText>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="relative h-8 w-8 overflow-hidden rounded-lg">
                  <Image src="/logo.jpg" alt="VectorBase" fill className="object-cover" />
                </div>
                <span className="text-lg font-semibold tracking-tight">VectorBase</span>
              </Link>
              <p className="mt-4 max-w-xs text-sm text-white/60">
                The modern RAG infrastructure for building AI-powered knowledge bases.
              </p>
              <div className="mt-6 flex gap-4">
                <Link href="https://twitter.com" className="text-white/40 transition-colors hover:text-white">
                  <Twitter className="h-5 w-5" />
                </Link>
                <Link href="https://github.com" className="text-white/40 transition-colors hover:text-white">
                  <Github className="h-5 w-5" />
                </Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-white">Product</h4>
              <ul className="mt-4 space-y-3">
                <li><Link href="#features" className="text-sm text-white/60 hover:text-white">Features</Link></li>
                <li><Link href="#pricing" className="text-sm text-white/60 hover:text-white">Pricing</Link></li>
                <li><Link href="/changelog" className="text-sm text-white/60 hover:text-white">Changelog</Link></li>
                <li><Link href="/docs" className="text-sm text-white/60 hover:text-white">Documentation</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white">Company</h4>
              <ul className="mt-4 space-y-3">
                <li><Link href="/about" className="text-sm text-white/60 hover:text-white">About</Link></li>
                <li><Link href="/blog" className="text-sm text-white/60 hover:text-white">Blog</Link></li>
                <li><Link href="/careers" className="text-sm text-white/60 hover:text-white">Careers</Link></li>
                <li><Link href="/contact" className="text-sm text-white/60 hover:text-white">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white">Legal</h4>
              <ul className="mt-4 space-y-3">
                <li><Link href="/privacy" className="text-sm text-white/60 hover:text-white">Privacy</Link></li>
                <li><Link href="/terms" className="text-sm text-white/60 hover:text-white">Terms</Link></li>
                <li><Link href="/security" className="text-sm text-white/60 hover:text-white">Security</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
            <p className="text-sm text-white/40">
              © {new Date().getFullYear()} VectorBase. All rights reserved.
            </p>
            <p className="text-sm text-white/40">
              Made with ❤️ for developers
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
