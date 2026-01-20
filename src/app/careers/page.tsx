import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight, MapPin, Clock, DollarSign, Briefcase, Heart, Zap, Globe, Github, Twitter } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Careers - VectorBase',
  description: 'Join the VectorBase team. We\'re building the future of AI-powered knowledge bases and looking for talented people to help us get there.',
}

const benefits = [
  {
    icon: DollarSign,
    title: 'Competitive Salary',
    description: 'Top-of-market compensation with equity packages that reward your contributions.',
  },
  {
    icon: Globe,
    title: 'Remote First',
    description: 'Work from anywhere in the world. We believe great talent isn\'t limited by geography.',
  },
  {
    icon: Heart,
    title: 'Health & Wellness',
    description: 'Comprehensive health, dental, and vision insurance for you and your family.',
  },
  {
    icon: Zap,
    title: 'Learning Budget',
    description: '$2,000 annual budget for courses, conferences, and books to fuel your growth.',
  },
  {
    icon: Clock,
    title: 'Flexible Hours',
    description: 'We care about results, not when you work. Build your schedule around your life.',
  },
  {
    icon: Briefcase,
    title: 'Latest Equipment',
    description: 'MacBook Pro, 4K monitor, and whatever else you need to do your best work.',
  },
]

const openPositions = [
  {
    title: 'Senior Backend Engineer',
    department: 'Engineering',
    location: 'Remote (US/EU)',
    type: 'Full-time',
    description: 'Build and scale our core API infrastructure. You\'ll work on vector search optimization, real-time processing pipelines, and database performance.',
    requirements: [
      '5+ years backend development experience',
      'Strong TypeScript/Node.js skills',
      'Experience with PostgreSQL and vector databases',
      'Understanding of distributed systems',
    ],
  },
  {
    title: 'Full Stack Engineer',
    department: 'Engineering',
    location: 'Remote (Worldwide)',
    type: 'Full-time',
    description: 'Own features end-to-end, from database to UI. Build delightful experiences for developers using VectorBase.',
    requirements: [
      '3+ years full stack experience',
      'React/Next.js expertise',
      'Comfortable with both frontend and backend',
      'Eye for clean, intuitive UX',
    ],
  },
  {
    title: 'ML Engineer',
    department: 'AI/ML',
    location: 'Remote (US/EU)',
    type: 'Full-time',
    description: 'Improve our embedding and retrieval systems. Research and implement state-of-the-art techniques for RAG applications.',
    requirements: [
      'MS/PhD in ML or equivalent experience',
      'Experience with embedding models and vector search',
      'Python and PyTorch proficiency',
      'Published research is a plus',
    ],
  },
  {
    title: 'Developer Advocate',
    department: 'DevRel',
    location: 'Remote (Worldwide)',
    type: 'Full-time',
    description: 'Be the bridge between VectorBase and the developer community. Create content, build demos, and gather feedback.',
    requirements: [
      'Strong technical background',
      'Excellent written and verbal communication',
      'Experience creating developer content',
      'Active in developer communities',
    ],
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote (US/EU)',
    type: 'Full-time',
    description: 'Design beautiful, intuitive interfaces for complex AI workflows. Shape the future of how developers interact with knowledge bases.',
    requirements: [
      '4+ years product design experience',
      'Strong systems thinking',
      'Experience with developer tools',
      'Figma expertise',
    ],
  },
]

export default function CareersPage() {
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
                Build the future of
                <span className="block bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  AI with us
                </span>
              </h1>
              <p className="mt-6 text-lg text-white/60 sm:text-xl">
                We're a small, passionate team solving big problems in AI infrastructure. 
                Join us in making knowledge retrieval accessible to every developer.
              </p>
              <div className="mt-10">
                <a href="#positions">
                  <Button size="lg" className="h-12 gap-2 bg-white px-8 text-black hover:bg-white/90">
                    View Open Positions
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/5 bg-white/[0.02] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Why VectorBase?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-white/60">
              We believe in taking care of our team so they can do their best work
            </p>
            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 p-3">
                    <benefit.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{benefit.title}</h3>
                  <p className="mt-2 text-sm text-white/60">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Our Culture</h2>
              <p className="mt-6 text-lg text-white/60 leading-relaxed">
                We're building something meaningful—tools that help developers create amazing AI experiences. 
                We value autonomy, clear communication, and shipping quality work. We don't have endless meetings 
                or bureaucracy. We trust each other to do great work and support each other along the way.
              </p>
              <p className="mt-6 text-lg text-white/60 leading-relaxed">
                We're remote-first but not isolated. We have regular virtual hangouts, annual team retreats, 
                and a Slack culture that's both professional and fun. We believe diverse perspectives make 
                better products, and we're committed to building an inclusive team.
              </p>
            </div>
          </div>
        </section>

        <section id="positions" className="border-y border-white/5 bg-gradient-to-b from-violet-500/5 to-transparent py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Open Positions</h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-white/60">
              Find your place on our team
            </p>
            <div className="mt-16 space-y-6">
              {openPositions.map((position) => (
                <div
                  key={position.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-white/20"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs font-medium text-violet-400">
                          {position.department}
                        </span>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/60">
                          {position.type}
                        </span>
                      </div>
                      <h3 className="mt-3 text-xl font-semibold text-white">{position.title}</h3>
                      <div className="mt-2 flex items-center gap-2 text-sm text-white/40">
                        <MapPin className="h-4 w-4" />
                        {position.location}
                      </div>
                      <p className="mt-4 text-white/60">{position.description}</p>
                      <div className="mt-4">
                        <p className="text-sm font-medium text-white/80">Requirements:</p>
                        <ul className="mt-2 space-y-1">
                          {position.requirements.map((req, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-white/60">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <Button className="gap-2 bg-white text-black hover:bg-white/90">
                        Apply Now
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
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
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Don't see a perfect fit?</h2>
                <p className="mx-auto mt-4 max-w-xl text-lg text-white/60">
                  We're always looking for talented people. Send us your resume and tell us how you'd like to contribute.
                </p>
                <div className="mt-8">
                  <Link href="mailto:careers@vectorbase.dev">
                    <Button size="lg" className="h-12 gap-2 bg-white px-8 text-black hover:bg-white/90">
                      Send Open Application
                      <ArrowRight className="h-4 w-4" />
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
