import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - VectorBase',
  description: 'Learn how VectorBase collects, uses, and protects your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent" />
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

      <main className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="mt-4 text-white/60">Last updated: January 15, 2025</p>
          
          <div className="mt-12 space-y-12 text-white/80">
            <section>
              <h2 className="text-2xl font-semibold text-white">1. Introduction</h2>
              <p className="mt-4 leading-relaxed">
                VectorBase Inc. ("VectorBase," "we," "us," or "our") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when 
                you use our website, applications, and services (collectively, the "Services").
              </p>
              <p className="mt-4 leading-relaxed">
                By using our Services, you agree to the collection and use of information in accordance with this 
                policy. If you do not agree with this policy, please do not use our Services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">2. Information We Collect</h2>
              
              <h3 className="mt-6 text-xl font-medium text-white">2.1 Information You Provide</h3>
              <ul className="mt-4 list-disc space-y-2 pl-6">
                <li><strong>Account Information:</strong> Name, email address, password, and organization name when you create an account.</li>
                <li><strong>Payment Information:</strong> Billing address and payment card details (processed securely by Stripe).</li>
                <li><strong>Content:</strong> Documents, text, and other data you upload to create knowledge bases.</li>
                <li><strong>Communications:</strong> Messages you send to us through support channels or email.</li>
              </ul>

              <h3 className="mt-6 text-xl font-medium text-white">2.2 Information Collected Automatically</h3>
              <ul className="mt-4 list-disc space-y-2 pl-6">
                <li><strong>Usage Data:</strong> API calls, queries, features used, and interaction patterns.</li>
                <li><strong>Device Information:</strong> Browser type, operating system, and device identifiers.</li>
                <li><strong>Log Data:</strong> IP addresses, access times, pages viewed, and referrer URLs.</li>
                <li><strong>Cookies:</strong> Session and preference cookies to maintain your login and settings.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">3. How We Use Your Information</h2>
              <p className="mt-4 leading-relaxed">We use the collected information to:</p>
              <ul className="mt-4 list-disc space-y-2 pl-6">
                <li>Provide, maintain, and improve our Services</li>
                <li>Process transactions and send related information</li>
                <li>Send administrative messages, updates, and security alerts</li>
                <li>Respond to your comments, questions, and support requests</li>
                <li>Monitor and analyze usage trends to improve user experience</li>
                <li>Detect, prevent, and address technical issues and security threats</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">4. Data Storage and Security</h2>
              <p className="mt-4 leading-relaxed">
                Your data is stored on secure servers provided by our infrastructure partners (Supabase, AWS). 
                We implement industry-standard security measures including:
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-6">
                <li>Encryption of data in transit (TLS 1.3) and at rest (AES-256)</li>
                <li>Regular security audits and penetration testing</li>
                <li>Access controls and authentication requirements</li>
                <li>Automated backups and disaster recovery procedures</li>
              </ul>
              <p className="mt-4 leading-relaxed">
                While we strive to protect your data, no method of transmission over the Internet is 100% secure. 
                We cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">5. Data Sharing and Disclosure</h2>
              <p className="mt-4 leading-relaxed">We may share your information in the following circumstances:</p>
              <ul className="mt-4 list-disc space-y-2 pl-6">
                <li><strong>Service Providers:</strong> Third parties that help us operate our Services (hosting, payment processing, analytics).</li>
                <li><strong>Legal Requirements:</strong> When required by law, subpoena, or government request.</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
                <li><strong>With Your Consent:</strong> When you explicitly agree to share your information.</li>
              </ul>
              <p className="mt-4 leading-relaxed">
                We do not sell your personal information to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">6. Your Rights and Choices</h2>
              <p className="mt-4 leading-relaxed">Depending on your location, you may have the right to:</p>
              <ul className="mt-4 list-disc space-y-2 pl-6">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your data</li>
                <li>Object to or restrict processing of your data</li>
                <li>Data portability (receive your data in a structured format)</li>
                <li>Withdraw consent at any time</li>
              </ul>
              <p className="mt-4 leading-relaxed">
                To exercise these rights, contact us at <a href="mailto:privacy@vectorbase.dev" className="text-violet-400 hover:text-violet-300">privacy@vectorbase.dev</a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">7. Data Retention</h2>
              <p className="mt-4 leading-relaxed">
                We retain your personal information for as long as your account is active or as needed to provide 
                Services. We may retain certain information after account deletion for legitimate business purposes, 
                such as complying with legal obligations, resolving disputes, and enforcing agreements.
              </p>
              <p className="mt-4 leading-relaxed">
                You can request deletion of your data at any time through your account settings or by contacting us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">8. International Data Transfers</h2>
              <p className="mt-4 leading-relaxed">
                Your information may be transferred to and processed in countries other than your own. We ensure 
                appropriate safeguards are in place, including Standard Contractual Clauses approved by the European 
                Commission for transfers from the EEA.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">9. Children's Privacy</h2>
              <p className="mt-4 leading-relaxed">
                Our Services are not intended for users under 16 years of age. We do not knowingly collect personal 
                information from children. If we learn we have collected information from a child, we will delete 
                it promptly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">10. Changes to This Policy</h2>
              <p className="mt-4 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by 
                posting the new policy on this page and updating the "Last updated" date. Your continued use of the 
                Services after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">11. Contact Us</h2>
              <p className="mt-4 leading-relaxed">
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-6">
                <p><strong>VectorBase Inc.</strong></p>
                <p className="mt-2">548 Market St, Suite 95291</p>
                <p>San Francisco, CA 94104</p>
                <p className="mt-2">Email: <a href="mailto:privacy@vectorbase.dev" className="text-violet-400 hover:text-violet-300">privacy@vectorbase.dev</a></p>
              </div>
            </section>
          </div>
        </div>
      </main>

<Footer />
    </div>
  )
}
