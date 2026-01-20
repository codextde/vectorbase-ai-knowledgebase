import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight, Users, Target, Lightbulb, Heart, Github, Twitter } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About - VectorBase',
  description: 'Learn about VectorBase, our mission to democratize AI-powered knowledge bases, and the team behind the platform.',
}

const values = [
  {
    icon: Target,
    title: 'Developer First',
    description: 'We build tools that developers actually want to use. Clean APIs, comprehensive docs, and seamless integrations.',
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    description: 'We push the boundaries of what\'s possible with RAG technology, constantly improving our embedding and retrieval systems.',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Open source at heart. We believe in transparency, collaboration, and building together with our community.',
  },
  {
    icon: Heart,
    title: 'Simplicity',
    description: 'Complex technology should feel simple. We obsess over developer experience to make AI accessible to everyone.',
  },
]

const team = [
  {
    name: 'Alex Chen',
    role: 'Founder & CEO',
    bio: 'Previously ML Engineer at Google. Built search systems serving billions of queries.',
    image: '/team/alex.jpg',
  },
  {
    name: 'Sarah Miller',
    role: 'CTO',
    bio: 'Ex-Stripe engineer. Passionate about building reliable, scalable infrastructure.',
    image: '/team/sarah.jpg',
  },
  {
    name: 'Marcus Johnson',
    role: 'Head of Product',
    bio: 'Former PM at Notion. Loves crafting delightful developer experiences.',
    image: '/team/marcus.jpg',
  },
  {
    name: 'Emily Zhang',
    role: 'Lead Engineer',
    bio: 'Open source contributor. Built vector databases used by Fortune 500 companies.',
    image: '/team/emily.jpg',
  },
]

const milestones = [
  { year: '2023', title: 'Founded', description: 'VectorBase was born from a simple idea: make RAG accessible to every developer.' },
  { year: '2023', title: 'First Release', description: 'Launched v1.0 with document upload, website crawling, and REST API.' },
  { year: '2024', title: 'Notion Integration', description: 'Added seamless Notion workspace sync for knowledge base creation.' },
  { year: '2024', title: '10M+ Vectors', description: 'Crossed 10 million vectors indexed across thousands of projects.' },
  { year: '2025', title: 'Enterprise Launch', description: 'Released self-hosted option and enterprise features for large teams.' },
]

export default function AboutPage() {
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
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Building the future of
                <span className="block bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  AI knowledge bases
                </span>
              </h1>
              <p className="mt-6 text-lg text-white/60 sm:text-xl">
                We're on a mission to make AI-powered knowledge retrieval accessible to every developer. 
                No ML expertise required—just upload your data and start building.
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-white/5 bg-white/[0.02] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Our Story</h2>
            <div className="mx-auto mt-8 max-w-3xl text-center">
              <p className="text-lg text-white/60 leading-relaxed">
                VectorBase started in 2023 when our founders realized that building AI-powered search and chat 
                was far too complex. Teams were spending months building infrastructure instead of focusing on 
                their products.
              </p>
              <p className="mt-6 text-lg text-white/60 leading-relaxed">
                We set out to change that. Today, VectorBase powers thousands of knowledge bases, from startup 
                documentation portals to enterprise customer support systems. Our platform handles the complexity 
                of embeddings, vector storage, and retrieval—so you can focus on building amazing products.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Our Values</h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-white/60">
              The principles that guide everything we build
            </p>
            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value) => (
                <div key={value.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 p-3">
                    <value.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{value.title}</h3>
                  <p className="mt-2 text-sm text-white/60">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-white/5 bg-gradient-to-b from-violet-500/5 to-transparent py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Our Journey</h2>
            <div className="mx-auto mt-16 max-w-3xl">
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/20 text-sm font-semibold text-violet-400">
                        {milestone.year.slice(-2)}
                      </div>
                      {index < milestones.length - 1 && <div className="mt-2 h-full w-px bg-white/10" />}
                    </div>
                    <div className="pb-8">
                      <h3 className="font-semibold text-white">{milestone.title}</h3>
                      <p className="mt-1 text-sm text-white/60">{milestone.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Meet the Team</h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-white/60">
              The people behind VectorBase
            </p>
            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {team.map((member) => (
                <div key={member.name} className="text-center">
                  <div className="mx-auto h-32 w-32 overflow-hidden rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20">
                    <div className="flex h-full items-center justify-center text-3xl font-bold text-violet-400">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>
                  <h3 className="mt-4 font-semibold text-white">{member.name}</h3>
                  <p className="text-sm text-violet-400">{member.role}</p>
                  <p className="mt-2 text-sm text-white/60">{member.bio}</p>
                </div>
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
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Join us on our journey</h2>
                <p className="mx-auto mt-4 max-w-xl text-lg text-white/60">
                  We're always looking for talented people who share our passion for developer tools and AI.
                </p>
                <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                  <Link href="/careers">
                    <Button size="lg" className="h-12 gap-2 bg-white px-8 text-black hover:bg-white/90">
                      View Open Positions
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="https://github.com/codextde/vectorbase-ai-knowledgebase">
                    <Button size="lg" variant="ghost" className="h-12 gap-2 border border-white/10 px-8 hover:bg-white/5">
                      <Github className="h-4 w-4" />
                      Star on GitHub
                    </Button>
                  </Link>
                </div>
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
