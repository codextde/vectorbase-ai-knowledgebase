import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Shield, Lock, Eye, Server, FileCheck, Users, Github, Twitter, CheckCircle } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Security - VectorBase',
  description: 'Learn about VectorBase security practices, compliance certifications, and how we protect your data.',
}

const securityFeatures = [
  {
    icon: Lock,
    title: 'Encryption',
    description: 'All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption.',
  },
  {
    icon: Server,
    title: 'Infrastructure',
    description: 'Hosted on SOC 2 Type II certified infrastructure with redundant backups across multiple regions.',
  },
  {
    icon: Eye,
    title: 'Access Control',
    description: 'Role-based access control, SSO support, and audit logs for all account activities.',
  },
  {
    icon: FileCheck,
    title: 'Compliance',
    description: 'GDPR compliant with data processing agreements available for enterprise customers.',
  },
  {
    icon: Users,
    title: 'Team Security',
    description: 'All employees undergo background checks and security training. Access follows least-privilege principle.',
  },
  {
    icon: Shield,
    title: 'Vulnerability Management',
    description: 'Regular penetration testing, bug bounty program, and continuous security monitoring.',
  },
]

const certifications = [
  { name: 'SOC 2 Type II', status: 'Certified', description: 'Annual audit of security controls' },
  { name: 'GDPR', status: 'Compliant', description: 'EU data protection regulation' },
  { name: 'CCPA', status: 'Compliant', description: 'California Consumer Privacy Act' },
  { name: 'ISO 27001', status: 'In Progress', description: 'Information security management' },
]

const practices = [
  {
    title: 'Secure Development',
    items: [
      'Code review required for all changes',
      'Automated security scanning in CI/CD',
      'Dependency vulnerability monitoring',
      'Regular security training for developers',
    ],
  },
  {
    title: 'Data Protection',
    items: [
      'Data isolation between customers',
      'Automatic data backup every 6 hours',
      '30-day backup retention',
      'Secure data deletion on request',
    ],
  },
  {
    title: 'Incident Response',
    items: [
      '24/7 security monitoring',
      'Defined incident response procedures',
      'Customer notification within 72 hours',
      'Post-incident analysis and remediation',
    ],
  },
]

export default function SecurityPage() {
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
              <div className="mx-auto mb-6 inline-flex rounded-full bg-green-500/20 p-4">
                <Shield className="h-8 w-8 text-green-400" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Security at VectorBase
              </h1>
              <p className="mt-6 text-lg text-white/60">
                Your data security is our top priority. We implement industry-leading security practices 
                to ensure your knowledge bases are protected at every layer.
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-white/5 bg-white/[0.02] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Security Features</h2>
            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {securityFeatures.map((feature) => (
                <div key={feature.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 p-3">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm text-white/60">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Compliance & Certifications</h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-white/60">
              We maintain rigorous compliance standards to meet enterprise requirements
            </p>
            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {certifications.map((cert) => (
                <div key={cert.name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{cert.name}</h3>
                  <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                    cert.status === 'Certified' || cert.status === 'Compliant'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {cert.status}
                  </span>
                  <p className="mt-3 text-sm text-white/60">{cert.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-white/5 bg-gradient-to-b from-violet-500/5 to-transparent py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Security Practices</h2>
            <div className="mt-16 grid gap-8 lg:grid-cols-3">
              {practices.map((practice) => (
                <div key={practice.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <h3 className="text-xl font-semibold text-white">{practice.title}</h3>
                  <ul className="mt-4 space-y-3">
                    {practice.items.map((item, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm text-white/60">
                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Responsible Disclosure</h2>
              <p className="mt-6 text-lg text-white/60 leading-relaxed">
                We take security vulnerabilities seriously. If you discover a security issue, please report it 
                responsibly. We appreciate the security research community's efforts in helping us keep VectorBase secure.
              </p>
              
              <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h3 className="font-semibold text-white">Bug Bounty Program</h3>
                <p className="mt-2 text-white/60">
                  We offer rewards for responsibly disclosed security vulnerabilities. Rewards range from $100 to 
                  $10,000 depending on severity.
                </p>
                <div className="mt-4">
                  <a href="mailto:security@vectorbase.dev" className="text-violet-400 hover:text-violet-300">
                    security@vectorbase.dev →
                  </a>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h3 className="font-semibold text-white">Security Contact</h3>
                <p className="mt-2 text-white/60">
                  For security-related inquiries or to report a vulnerability:
                </p>
                <ul className="mt-4 space-y-2 text-white/60">
                  <li>Email: <a href="mailto:security@vectorbase.dev" className="text-violet-400 hover:text-violet-300">security@vectorbase.dev</a></li>
                  <li>PGP Key: Available on request</li>
                  <li>Response time: Within 24 hours for critical issues</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-transparent p-8 sm:p-16">
              <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
              <div className="relative text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Need more details?</h2>
                <p className="mx-auto mt-4 max-w-xl text-lg text-white/60">
                  Enterprise customers can request our SOC 2 report, security questionnaire responses, 
                  and schedule a security review call.
                </p>
                <div className="mt-8">
                  <Link href="/contact">
                    <Button size="lg" className="h-12 gap-2 bg-white px-8 text-black hover:bg-white/90">
                      Contact Security Team
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
              <Link href="/security" className="text-sm text-white hover:text-white">Security</Link>
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
