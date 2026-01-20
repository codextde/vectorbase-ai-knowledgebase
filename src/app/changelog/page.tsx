import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Github, Twitter, Sparkles, Bug, Zap, Shield } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Changelog - VectorBase',
  description: 'Stay up to date with the latest features, improvements, and fixes in VectorBase.',
}

const releases = [
  {
    version: '2.1.0',
    date: '2025-01-15',
    title: 'Performance Boost & New Integrations',
    description: 'Major performance improvements and new third-party integrations.',
    changes: [
      { type: 'feature', text: 'Added Slack integration for notifications' },
      { type: 'feature', text: 'New bulk import API for large document sets' },
      { type: 'improvement', text: '3x faster embedding generation with batching' },
      { type: 'improvement', text: 'Reduced API latency by 40% with query optimization' },
      { type: 'fix', text: 'Fixed memory leak in long-running crawl jobs' },
      { type: 'fix', text: 'Resolved issue with special characters in document titles' },
    ],
  },
  {
    version: '2.0.0',
    date: '2024-12-20',
    title: 'VectorBase 2.0 - Complete Redesign',
    description: 'A major release with a redesigned dashboard, new AI models, and improved developer experience.',
    changes: [
      { type: 'feature', text: 'Completely redesigned dashboard with dark mode' },
      { type: 'feature', text: 'Support for GPT-4 Turbo and Claude 3 models' },
      { type: 'feature', text: 'New playground for testing queries in real-time' },
      { type: 'feature', text: 'Team collaboration with roles and permissions' },
      { type: 'improvement', text: 'New embedding model with 20% better accuracy' },
      { type: 'improvement', text: 'Streaming responses for chat API' },
      { type: 'security', text: 'Added SOC 2 Type II compliance' },
    ],
  },
  {
    version: '1.8.0',
    date: '2024-11-15',
    title: 'Notion Integration',
    description: 'Seamlessly sync your Notion workspace with VectorBase.',
    changes: [
      { type: 'feature', text: 'Notion OAuth integration for workspace sync' },
      { type: 'feature', text: 'Automatic page and database import' },
      { type: 'feature', text: 'Real-time sync when Notion pages are updated' },
      { type: 'improvement', text: 'Better handling of rich text formatting' },
      { type: 'fix', text: 'Fixed pagination issues with large workspaces' },
    ],
  },
  {
    version: '1.7.0',
    date: '2024-10-20',
    title: 'Enhanced Website Crawling',
    description: 'Improved crawling capabilities with JavaScript rendering support.',
    changes: [
      { type: 'feature', text: 'JavaScript rendering with Playwright for SPA sites' },
      { type: 'feature', text: 'Automatic sitemap.xml discovery and parsing' },
      { type: 'feature', text: 'Custom crawl rules and URL patterns' },
      { type: 'improvement', text: 'Smarter content extraction with boilerplate removal' },
      { type: 'improvement', text: 'Parallel crawling for faster indexing' },
      { type: 'fix', text: 'Fixed redirect handling in crawl jobs' },
    ],
  },
  {
    version: '1.6.0',
    date: '2024-09-10',
    title: 'API Keys & Rate Limiting',
    description: 'Better API management with project-level keys and rate limiting.',
    changes: [
      { type: 'feature', text: 'Project-specific API keys with custom permissions' },
      { type: 'feature', text: 'Rate limiting dashboard with usage analytics' },
      { type: 'feature', text: 'API key rotation and expiration settings' },
      { type: 'improvement', text: 'More detailed API error messages' },
      { type: 'security', text: 'API keys now hashed in database' },
    ],
  },
  {
    version: '1.5.0',
    date: '2024-08-05',
    title: 'Document Processing Improvements',
    description: 'Better support for complex document formats.',
    changes: [
      { type: 'feature', text: 'PDF processing with OCR for scanned documents' },
      { type: 'feature', text: 'Support for DOCX, PPTX, and XLSX files' },
      { type: 'feature', text: 'Markdown file support with frontmatter parsing' },
      { type: 'improvement', text: 'Improved table extraction from documents' },
      { type: 'fix', text: 'Fixed encoding issues with non-UTF8 files' },
    ],
  },
  {
    version: '1.4.0',
    date: '2024-07-01',
    title: 'Chat API & Streaming',
    description: 'New RAG-powered chat endpoint with streaming support.',
    changes: [
      { type: 'feature', text: 'New /api/v1/chat endpoint for RAG conversations' },
      { type: 'feature', text: 'Server-sent events for streaming responses' },
      { type: 'feature', text: 'Conversation history and session management' },
      { type: 'feature', text: 'Source citations in chat responses' },
      { type: 'improvement', text: 'Better context window management' },
    ],
  },
  {
    version: '1.3.0',
    date: '2024-06-01',
    title: 'Self-Hosted Option',
    description: 'Deploy VectorBase on your own infrastructure.',
    changes: [
      { type: 'feature', text: 'Docker image for self-hosted deployments' },
      { type: 'feature', text: 'Helm chart for Kubernetes' },
      { type: 'feature', text: 'Environment variable configuration' },
      { type: 'improvement', text: 'Reduced resource requirements' },
      { type: 'security', text: 'Air-gapped deployment support' },
    ],
  },
]

function getChangeIcon(type: string) {
  switch (type) {
    case 'feature':
      return <Sparkles className="h-4 w-4 text-violet-400" />
    case 'improvement':
      return <Zap className="h-4 w-4 text-blue-400" />
    case 'fix':
      return <Bug className="h-4 w-4 text-orange-400" />
    case 'security':
      return <Shield className="h-4 w-4 text-green-400" />
    default:
      return <Sparkles className="h-4 w-4 text-white/40" />
  }
}

function getChangeLabel(type: string) {
  switch (type) {
    case 'feature':
      return 'New'
    case 'improvement':
      return 'Improved'
    case 'fix':
      return 'Fixed'
    case 'security':
      return 'Security'
    default:
      return type
  }
}

function getChangeLabelColor(type: string) {
  switch (type) {
    case 'feature':
      return 'bg-violet-500/20 text-violet-400'
    case 'improvement':
      return 'bg-blue-500/20 text-blue-400'
    case 'fix':
      return 'bg-orange-500/20 text-orange-400'
    case 'security':
      return 'bg-green-500/20 text-green-400'
    default:
      return 'bg-white/10 text-white/60'
  }
}

export default function ChangelogPage() {
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
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Changelog</h1>
              <p className="mt-6 text-lg text-white/60">
                Stay up to date with new features, improvements, and fixes. 
                We ship updates regularly to make VectorBase better for everyone.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <Link href="https://github.com/codextde/vectorbase-ai-knowledgebase/releases">
                  <Button variant="ghost" className="gap-2 border border-white/10 hover:bg-white/5">
                    <Github className="h-4 w-4" />
                    View on GitHub
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="space-y-12">
              {releases.map((release, index) => (
                <div key={release.version} className="relative">
                  {index < releases.length - 1 && (
                    <div className="absolute left-[19px] top-12 h-full w-px bg-white/10" />
                  )}
                  <div className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/20 text-sm font-semibold text-violet-400">
                        {release.version.split('.')[0]}.{release.version.split('.')[1]}
                      </div>
                    </div>
                    <div className="flex-1 pb-12">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-violet-500 px-3 py-1 text-xs font-semibold text-white">
                          v{release.version}
                        </span>
                        <time className="text-sm text-white/40">
                          {new Date(release.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </time>
                      </div>
                      <h2 className="mt-4 text-2xl font-bold text-white">{release.title}</h2>
                      <p className="mt-2 text-white/60">{release.description}</p>
                      
                      <div className="mt-6 space-y-3">
                        {release.changes.map((change, changeIndex) => (
                          <div key={changeIndex} className="flex items-start gap-3">
                            <span className={`mt-0.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${getChangeLabelColor(change.type)}`}>
                              {getChangeIcon(change.type)}
                              {getChangeLabel(change.type)}
                            </span>
                            <span className="text-sm text-white/80">{change.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
              <h3 className="text-xl font-semibold text-white">Want to see what's next?</h3>
              <p className="mt-2 text-white/60">
                Check out our public roadmap and vote on upcoming features.
              </p>
              <div className="mt-6">
                <Link href="https://github.com/codextde/vectorbase-ai-knowledgebase/projects">
                  <Button className="gap-2 bg-white text-black hover:bg-white/90">
                    View Roadmap
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="relative h-8 w-8 overflow-hidden rounded-lg">
                <Image src="/logo.jpg" alt="VectorBase" fill className="object-cover" />
              </div>
              <span className="text-lg font-semibold tracking-tight">VectorBase</span>
            </div>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-white/60 hover:text-white">Privacy</Link>
              <Link href="/terms" className="text-sm text-white/60 hover:text-white">Terms</Link>
              <Link href="/security" className="text-sm text-white/60 hover:text-white">Security</Link>
            </div>
            <div className="flex gap-4">
              <Link href="https://twitter.com" className="text-white/40 transition-colors hover:text-white">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="https://github.com/codextde/vectorbase-ai-knowledgebase" className="text-white/40 transition-colors hover:text-white">
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>
          <p className="mt-8 text-center text-sm text-white/40">
            © {new Date().getFullYear()} VectorBase. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
