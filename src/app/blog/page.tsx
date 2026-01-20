import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/footer'
import { ArrowRight, Calendar, Clock, User } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog - VectorBase',
  description: 'Latest news, tutorials, and insights about RAG, vector databases, and AI-powered knowledge bases.',
}

const featuredPost = {
  title: 'Introducing VectorBase 2.0: Faster Embeddings, Smarter Retrieval',
  excerpt: 'We\'ve completely rebuilt our embedding pipeline, achieving 3x faster processing and 40% better retrieval accuracy. Here\'s what\'s new and how to upgrade.',
  author: 'Alex Chen',
  date: '2025-01-15',
  readTime: '8 min read',
  category: 'Product',
  slug: 'vectorbase-2-0-release',
}

const posts = [
  {
    title: 'Building a Customer Support Bot with VectorBase and n8n',
    excerpt: 'Learn how to create an intelligent support bot that answers questions from your documentation using VectorBase\'s RAG API and n8n workflows.',
    author: 'Sarah Miller',
    date: '2025-01-10',
    readTime: '12 min read',
    category: 'Tutorial',
    slug: 'customer-support-bot-n8n',
  },
  {
    title: 'Understanding Chunking Strategies for Better RAG Results',
    excerpt: 'Chunk size matters. We dive deep into different chunking strategies and show you how to optimize for your specific use case.',
    author: 'Emily Zhang',
    date: '2025-01-05',
    readTime: '10 min read',
    category: 'Engineering',
    slug: 'chunking-strategies-rag',
  },
  {
    title: 'Notion Integration: Sync Your Workspace in Real-Time',
    excerpt: 'Our new Notion integration automatically syncs your pages and databases. Here\'s how to set it up and best practices for organization.',
    author: 'Marcus Johnson',
    date: '2024-12-28',
    readTime: '6 min read',
    category: 'Product',
    slug: 'notion-integration-guide',
  },
  {
    title: 'Scaling to 10 Million Vectors: Lessons Learned',
    excerpt: 'As we crossed 10M indexed vectors, we encountered and solved numerous scaling challenges. Here\'s what we learned about pgvector at scale.',
    author: 'Emily Zhang',
    date: '2024-12-20',
    readTime: '15 min read',
    category: 'Engineering',
    slug: 'scaling-10-million-vectors',
  },
  {
    title: 'RAG vs Fine-Tuning: When to Use Each',
    excerpt: 'Both approaches have their place. We break down the tradeoffs and help you decide which is right for your use case.',
    author: 'Alex Chen',
    date: '2024-12-15',
    readTime: '9 min read',
    category: 'AI/ML',
    slug: 'rag-vs-fine-tuning',
  },
  {
    title: 'Self-Hosting VectorBase: A Complete Guide',
    excerpt: 'Everything you need to know about deploying VectorBase on your own infrastructure, from Docker setup to production hardening.',
    author: 'Sarah Miller',
    date: '2024-12-10',
    readTime: '14 min read',
    category: 'Tutorial',
    slug: 'self-hosting-guide',
  },
]

const categories = ['All', 'Product', 'Engineering', 'Tutorial', 'AI/ML']

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function BlogPage() {
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
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                VectorBase Blog
              </h1>
              <p className="mt-6 text-lg text-white/60">
                Insights, tutorials, and updates from the VectorBase team. 
                Learn about RAG, vector databases, and building AI-powered applications.
              </p>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    category === 'All'
                      ? 'bg-violet-500 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-transparent">
              <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
              <div className="p-8 sm:p-12">
                <span className="inline-block rounded-full bg-violet-500/20 px-3 py-1 text-xs font-medium text-violet-400">
                  {featuredPost.category}
                </span>
                <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                  {featuredPost.title}
                </h2>
                <p className="mt-4 max-w-2xl text-white/60">
                  {featuredPost.excerpt}
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-white/40">
                  <span className="flex items-center gap-1.5">
                    <User className="h-4 w-4" />
                    {featuredPost.author}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {formatDate(featuredPost.date)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {featuredPost.readTime}
                  </span>
                </div>
                <div className="mt-8">
                  <Button className="gap-2 bg-white text-black hover:bg-white/90">
                    Read Article
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-2xl font-bold tracking-tight">Latest Articles</h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <article
                  key={post.slug}
                  className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-white/20"
                >
                  <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/60">
                    {post.category}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-white group-hover:text-violet-400 transition-colors">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm text-white/60 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/40">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {post.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(post.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {post.readTime}
                    </span>
                  </div>
                  <Link href={`/blog/${post.slug}`} className="absolute inset-0">
                    <span className="sr-only">Read {post.title}</span>
                  </Link>
                </article>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Button variant="ghost" className="gap-2 border border-white/10 hover:bg-white/5">
                Load More Articles
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 sm:p-12">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Subscribe to our newsletter
                </h2>
                <p className="mt-4 text-white/60">
                  Get the latest articles, tutorials, and product updates delivered to your inbox.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="h-12 rounded-lg border border-white/10 bg-white/5 px-4 text-white placeholder:text-white/40 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 sm:w-80"
                  />
                  <Button className="h-12 bg-violet-500 px-6 hover:bg-violet-600">
                    Subscribe
                  </Button>
                </div>
                <p className="mt-4 text-xs text-white/40">
                  No spam, unsubscribe anytime. Read our <Link href="/privacy" className="underline hover:text-white">Privacy Policy</Link>.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

<Footer />
    </div>
  )
}
