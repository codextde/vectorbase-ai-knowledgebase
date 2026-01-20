import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/footer'
import { 
  Github, 
  Book, 
  Code, 
  Zap, 
  Database, 
  MessageSquare, 
  FileText, 
  Globe, 
  Key,
  ArrowRight
} from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Documentation - VectorBase',
  description: 'Learn how to use VectorBase to build AI-powered knowledge bases. Guides, API reference, and examples.',
}

const quickLinks = [
  {
    icon: Zap,
    title: 'Quick Start',
    description: 'Get up and running with VectorBase in under 5 minutes.',
    href: '#quickstart',
  },
  {
    icon: Code,
    title: 'API Reference',
    description: 'Complete REST API documentation with examples.',
    href: '#api',
  },
  {
    icon: Database,
    title: 'Data Sources',
    description: 'Learn how to import documents, websites, and more.',
    href: '#sources',
  },
  {
    icon: MessageSquare,
    title: 'RAG Chat',
    description: 'Build conversational AI with your knowledge base.',
    href: '#chat',
  },
]

const guides = [
  {
    icon: FileText,
    title: 'Uploading Documents',
    description: 'Import PDFs, DOCX, TXT files and automatically process them.',
    href: '#documents',
  },
  {
    icon: Globe,
    title: 'Website Crawling',
    description: 'Crawl websites and sitemaps to build your knowledge base.',
    href: '#crawling',
  },
  {
    icon: Key,
    title: 'API Authentication',
    description: 'Generate and manage API keys for your projects.',
    href: '#auth',
  },
]

const codeExamples = {
  query: `curl -X POST https://api.vectorbase.dev/v1/query \\
  -H "Authorization: Bearer vb_sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "How do I reset my password?",
    "top_k": 5,
    "threshold": 0.5
  }'`,
  chat: `curl -X POST https://api.vectorbase.dev/v1/chat \\
  -H "Authorization: Bearer vb_sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "messages": [
      {"role": "user", "content": "What are the pricing plans?"}
    ],
    "stream": true
  }'`,
  sources: `curl -X POST https://api.vectorbase.dev/v1/sources \\
  -H "Authorization: Bearer vb_sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "text",
    "name": "Company FAQ",
    "content": "Your text content here..."
  }'`,
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent" />
      </div>

      <header className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative h-8 w-8 overflow-hidden rounded-lg">
                <Image src="/logo.jpg" alt="VectorBase" fill className="object-cover" priority />
              </div>
              <span className="text-lg font-semibold tracking-tight">VectorBase</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">Log in</Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-white text-black hover:bg-white/90">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto mb-6 inline-flex rounded-full bg-violet-500/20 p-4">
                <Book className="h-8 w-8 text-violet-400" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Documentation</h1>
              <p className="mt-6 text-lg text-white/60">
                Everything you need to build AI-powered knowledge bases with VectorBase. 
                From quick starts to advanced API usage.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link href="https://github.com/codextde/vectorbase-ai-knowledgebase">
                  <Button size="lg" className="h-12 w-full gap-2 bg-white text-black hover:bg-white/90 sm:w-auto">
                    <Github className="h-4 w-4" />
                    View on GitHub
                  </Button>
                </Link>
                <Link href="#quickstart">
                  <Button size="lg" variant="ghost" className="h-12 w-full gap-2 border border-white/10 hover:bg-white/5 sm:w-auto">
                    Quick Start Guide
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/5 bg-white/[0.02] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">Quick Links</h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {quickLinks.map((link) => (
                <a
                  key={link.title}
                  href={link.href}
                  className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-violet-500/50"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 p-3">
                    <link.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-violet-400 transition-colors">
                    {link.title}
                  </h3>
                  <p className="mt-2 text-sm text-white/60">{link.description}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section id="quickstart" className="py-20 sm:py-32">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Quick Start</h2>
            <p className="mt-4 text-lg text-white/60">
              Get your first knowledge base up and running in just a few steps.
            </p>

            <div className="mt-12 space-y-8">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500 text-sm font-bold">1</span>
                  <h3 className="text-xl font-semibold">Create a Project</h3>
                </div>
                <p className="mt-4 text-white/60">
                  Sign up for a free account and create your first project from the dashboard. 
                  Each project is an isolated knowledge base with its own sources and API keys.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500 text-sm font-bold">2</span>
                  <h3 className="text-xl font-semibold">Add Your Data</h3>
                </div>
                <p className="mt-4 text-white/60">
                  Upload documents, paste text, or crawl a website. VectorBase automatically processes 
                  your content, creates embeddings, and indexes everything for semantic search.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500 text-sm font-bold">3</span>
                  <h3 className="text-xl font-semibold">Generate an API Key</h3>
                </div>
                <p className="mt-4 text-white/60">
                  Go to the API Keys section in your project settings and create a new key. 
                  This key authenticates your API requests.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500 text-sm font-bold">4</span>
                  <h3 className="text-xl font-semibold">Query Your Knowledge Base</h3>
                </div>
                <p className="mt-4 text-white/60 mb-4">
                  Use the REST API to search and chat with your knowledge base:
                </p>
                <div className="rounded-xl bg-[#0d0d14] p-4 overflow-x-auto">
                  <pre className="text-sm text-white/80">
                    <code>{codeExamples.query}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="api" className="border-y border-white/5 bg-gradient-to-b from-violet-500/5 to-transparent py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">API Reference</h2>
            <p className="mt-4 text-lg text-white/60">
              VectorBase provides a REST API for all operations. All requests require authentication 
              via Bearer token.
            </p>

            <div className="mt-12 space-y-8">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-green-500/20 px-2 py-1 text-xs font-bold text-green-400">POST</span>
                  <code className="text-white">/api/v1/query</code>
                </div>
                <p className="mt-4 text-white/60">
                  Perform semantic search across your knowledge base. Returns the most relevant chunks 
                  based on vector similarity.
                </p>
                <div className="mt-4 rounded-xl bg-[#0d0d14] p-4 overflow-x-auto">
                  <pre className="text-sm text-white/80">
                    <code>{codeExamples.query}</code>
                  </pre>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-green-500/20 px-2 py-1 text-xs font-bold text-green-400">POST</span>
                  <code className="text-white">/api/v1/chat</code>
                </div>
                <p className="mt-4 text-white/60">
                  RAG-powered chat endpoint. Automatically retrieves relevant context and generates 
                  AI responses with source citations.
                </p>
                <div className="mt-4 rounded-xl bg-[#0d0d14] p-4 overflow-x-auto">
                  <pre className="text-sm text-white/80">
                    <code>{codeExamples.chat}</code>
                  </pre>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-green-500/20 px-2 py-1 text-xs font-bold text-green-400">POST</span>
                  <code className="text-white">/api/v1/sources</code>
                </div>
                <p className="mt-4 text-white/60">
                  Create a new source in your project. Sources can be text, Q&A pairs, websites, 
                  or documents.
                </p>
                <div className="mt-4 rounded-xl bg-[#0d0d14] p-4 overflow-x-auto">
                  <pre className="text-sm text-white/80">
                    <code>{codeExamples.sources}</code>
                  </pre>
                </div>
              </div>
            </div>

            <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="text-xl font-semibold text-white">Rate Limits</h3>
              <p className="mt-4 text-white/60">
                API requests are rate-limited to <strong className="text-white">60 requests per minute</strong> per project. 
                Rate limit headers are included in all responses:
              </p>
              <ul className="mt-4 space-y-2 text-white/60">
                <li><code className="text-violet-400">X-RateLimit-Limit</code>: Maximum requests per window</li>
                <li><code className="text-violet-400">X-RateLimit-Remaining</code>: Requests remaining in current window</li>
                <li><code className="text-violet-400">X-RateLimit-Reset</code>: Unix timestamp when the window resets</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Guides</h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-white/60">
              Step-by-step tutorials for common use cases
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {guides.map((guide) => (
                <a
                  key={guide.title}
                  href={guide.href}
                  className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-violet-500/50"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-white/10 p-3">
                    <guide.icon className="h-6 w-6 text-violet-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-violet-400 transition-colors">
                    {guide.title}
                  </h3>
                  <p className="mt-2 text-sm text-white/60">{guide.description}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-transparent p-8 sm:p-16">
              <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
              <div className="relative text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Need Help?</h2>
                <p className="mx-auto mt-4 max-w-xl text-lg text-white/60">
                  Can't find what you're looking for? Check out our GitHub discussions or reach out to support.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Link href="https://github.com/codextde/vectorbase-ai-knowledgebase/discussions">
                    <Button size="lg" className="h-12 w-full gap-2 bg-white text-black hover:bg-white/90 sm:w-auto">
                      <Github className="h-4 w-4" />
                      GitHub Discussions
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button size="lg" variant="ghost" className="h-12 w-full gap-2 border border-white/10 hover:bg-white/5 sm:w-auto">
                      Contact Support
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

<Footer />
    </div>
  )
}
