'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Mail, MessageSquare, Building2, HelpCircle, Github, Twitter } from 'lucide-react'

const contactOptions = [
  {
    icon: HelpCircle,
    title: 'Support',
    description: 'Get help with your VectorBase account or technical issues.',
    email: 'support@vectorbase.dev',
    responseTime: 'Usually responds within 24 hours',
  },
  {
    icon: Building2,
    title: 'Sales',
    description: 'Learn about Enterprise plans and custom solutions.',
    email: 'sales@vectorbase.dev',
    responseTime: 'Usually responds within 4 hours',
  },
  {
    icon: MessageSquare,
    title: 'Partnerships',
    description: 'Interested in partnering or integrating with VectorBase?',
    email: 'partners@vectorbase.dev',
    responseTime: 'Usually responds within 48 hours',
  },
  {
    icon: Mail,
    title: 'General Inquiries',
    description: 'For press, media, and other general questions.',
    email: 'hello@vectorbase.dev',
    responseTime: 'Usually responds within 48 hours',
  },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: 'general',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

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
                Get in Touch
              </h1>
              <p className="mt-6 text-lg text-white/60">
                Have questions about VectorBase? We'd love to hear from you. 
                Choose the best way to reach us below.
              </p>
            </div>
          </div>
        </section>

        <section className="pb-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {contactOptions.map((option) => (
                <div key={option.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 p-3">
                    <option.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{option.title}</h3>
                  <p className="mt-2 text-sm text-white/60">{option.description}</p>
                  <a
                    href={`mailto:${option.email}`}
                    className="mt-4 block text-sm font-medium text-violet-400 hover:text-violet-300"
                  >
                    {option.email}
                  </a>
                  <p className="mt-2 text-xs text-white/40">{option.responseTime}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-white/5 bg-white/[0.02] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-12 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Send us a message</h2>
                <p className="mt-4 text-lg text-white/60">
                  Fill out the form and we'll get back to you as soon as possible.
                </p>
                
                <div className="mt-12 space-y-8">
                  <div>
                    <h3 className="font-semibold text-white">Office</h3>
                    <p className="mt-2 text-white/60">
                      VectorBase Inc.<br />
                      548 Market St, Suite 95291<br />
                      San Francisco, CA 94104
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Community</h3>
                    <p className="mt-2 text-white/60">
                      Join our Discord community for real-time support and discussions with other developers.
                    </p>
                    <a href="https://discord.gg/vectorbase" className="mt-2 inline-block text-violet-400 hover:text-violet-300">
                      Join Discord →
                    </a>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
                {isSubmitted ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="mb-4 inline-flex rounded-full bg-green-500/20 p-4">
                      <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white">Message Sent!</h3>
                    <p className="mt-2 text-white/60">
                      Thanks for reaching out. We'll get back to you soon.
                    </p>
                    <Button 
                      className="mt-6"
                      onClick={() => {
                        setIsSubmitted(false)
                        setFormData({ name: '', email: '', company: '', subject: 'general', message: '' })
                      }}
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-white/80">
                          Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="mt-2 block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-white/80">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="mt-2 block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-white/80">
                        Company (optional)
                      </label>
                      <input
                        type="text"
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="mt-2 block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                        placeholder="Acme Inc."
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-white/80">
                        Subject
                      </label>
                      <select
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="mt-2 block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="support">Technical Support</option>
                        <option value="sales">Sales & Enterprise</option>
                        <option value="partnership">Partnership</option>
                        <option value="feedback">Product Feedback</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-white/80">
                        Message
                      </label>
                      <textarea
                        id="message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="mt-2 block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                        placeholder="Tell us how we can help..."
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-white text-black hover:bg-white/90 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 sm:p-12">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Frequently Asked Questions
                </h2>
                <p className="mt-4 text-white/60">
                  Before reaching out, you might find your answer in our documentation or FAQ.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Link href="/docs">
                    <Button className="w-full sm:w-auto bg-violet-500 hover:bg-violet-600">
                      View Documentation
                    </Button>
                  </Link>
                  <Link href="https://github.com/codextde/vectorbase-ai-knowledgebase/issues">
                    <Button variant="ghost" className="w-full sm:w-auto border border-white/10 hover:bg-white/5">
                      GitHub Issues
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
