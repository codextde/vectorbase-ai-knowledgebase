import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - VectorBase',
  description: 'Read the terms and conditions governing your use of VectorBase services.',
}

export default function TermsPage() {
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
          <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
          <p className="mt-4 text-white/60">Last updated: January 15, 2025</p>
          
          <div className="mt-12 space-y-12 text-white/80">
            <section>
              <h2 className="text-2xl font-semibold text-white">1. Agreement to Terms</h2>
              <p className="mt-4 leading-relaxed">
                These Terms of Service ("Terms") constitute a legally binding agreement between you and VectorBase Inc. 
                ("VectorBase," "we," "us," or "our") governing your access to and use of the VectorBase website, 
                applications, APIs, and services (collectively, the "Services").
              </p>
              <p className="mt-4 leading-relaxed">
                By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these 
                Terms, you may not access or use our Services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">2. Description of Services</h2>
              <p className="mt-4 leading-relaxed">
                VectorBase provides a platform for creating AI-powered knowledge bases using vector embeddings. 
                Our Services include:
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-6">
                <li>Document and content upload and processing</li>
                <li>Website crawling and content extraction</li>
                <li>Vector embedding generation and storage</li>
                <li>Semantic search and retrieval APIs</li>
                <li>AI-powered chat interfaces (RAG)</li>
                <li>Team collaboration and project management tools</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">3. Account Registration</h2>
              <p className="mt-4 leading-relaxed">
                To use certain features of our Services, you must create an account. You agree to:
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-6">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information to keep it accurate</li>
                <li>Keep your password secure and confidential</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized access</li>
              </ul>
              <p className="mt-4 leading-relaxed">
                We reserve the right to suspend or terminate accounts that violate these Terms or for any other reason 
                at our sole discretion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">4. Acceptable Use</h2>
              <p className="mt-4 leading-relaxed">You agree not to use our Services to:</p>
              <ul className="mt-4 list-disc space-y-2 pl-6">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights of others</li>
                <li>Upload malicious code, viruses, or harmful content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Engage in activities that disrupt or burden our infrastructure</li>
                <li>Scrape or collect data without authorization</li>
                <li>Create knowledge bases containing illegal, harmful, or offensive content</li>
                <li>Use the Services to build competing products</li>
                <li>Resell or redistribute our Services without permission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">5. Your Content</h2>
              <p className="mt-4 leading-relaxed">
                You retain ownership of all content you upload to VectorBase ("Your Content"). By uploading content, 
                you grant us a worldwide, non-exclusive, royalty-free license to:
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-6">
                <li>Store, process, and display Your Content to provide the Services</li>
                <li>Create embeddings and derivatives necessary for vector search functionality</li>
                <li>Make backups for disaster recovery purposes</li>
              </ul>
              <p className="mt-4 leading-relaxed">
                You represent that you have all necessary rights to upload Your Content and that it does not violate 
                any third-party rights or applicable laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">6. Pricing and Payment</h2>
              <p className="mt-4 leading-relaxed">
                Some features of our Services require payment. By subscribing to a paid plan, you agree to:
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-6">
                <li>Pay all applicable fees as described on our pricing page</li>
                <li>Provide accurate billing information</li>
                <li>Authorize us to charge your payment method on a recurring basis</li>
              </ul>
              <p className="mt-4 leading-relaxed">
                Fees are non-refundable except as required by law or as explicitly stated in these Terms. We may change 
                pricing with 30 days' notice. If you do not agree to the new pricing, you may cancel your subscription.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">7. API Usage</h2>
              <p className="mt-4 leading-relaxed">
                Our APIs are subject to rate limits and usage quotas as specified in your plan. You agree to:
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-6">
                <li>Comply with rate limits and not circumvent them</li>
                <li>Keep your API keys secure and not share them publicly</li>
                <li>Implement proper error handling and retry logic</li>
                <li>Not use the API in ways that could damage or overburden our infrastructure</li>
              </ul>
              <p className="mt-4 leading-relaxed">
                We reserve the right to suspend API access for accounts that violate these terms or exhibit abusive 
                usage patterns.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">8. Intellectual Property</h2>
              <p className="mt-4 leading-relaxed">
                The Services, including all software, designs, text, graphics, and other content created by VectorBase, 
                are owned by us and protected by intellectual property laws. You may not copy, modify, distribute, or 
                create derivative works without our express written permission.
              </p>
              <p className="mt-4 leading-relaxed">
                VectorBase and our logo are trademarks of VectorBase Inc. You may not use our trademarks without prior 
                written consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">9. Disclaimer of Warranties</h2>
              <p className="mt-4 leading-relaxed">
                THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. 
                WE DISCLAIM ALL WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
              <p className="mt-4 leading-relaxed">
                We do not warrant that the Services will be uninterrupted, error-free, or secure. AI-generated responses 
                may contain inaccuracies, and you should verify critical information independently.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">10. Limitation of Liability</h2>
              <p className="mt-4 leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, VECTORBASE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, 
                SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, OR USE, ARISING 
                OUT OF OR RELATED TO THESE TERMS OR THE SERVICES.
              </p>
              <p className="mt-4 leading-relaxed">
                Our total liability shall not exceed the greater of (a) the amount you paid us in the 12 months 
                preceding the claim, or (b) $100.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">11. Indemnification</h2>
              <p className="mt-4 leading-relaxed">
                You agree to indemnify and hold harmless VectorBase and its officers, directors, employees, and agents 
                from any claims, damages, losses, or expenses (including reasonable attorneys' fees) arising from:
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-6">
                <li>Your use of the Services</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights</li>
                <li>Your Content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">12. Termination</h2>
              <p className="mt-4 leading-relaxed">
                You may terminate your account at any time through your account settings. We may suspend or terminate 
                your access to the Services at any time, with or without cause, with or without notice.
              </p>
              <p className="mt-4 leading-relaxed">
                Upon termination, your right to use the Services will immediately cease. Sections that by their nature 
                should survive termination shall survive, including ownership, warranty disclaimers, indemnity, and 
                limitations of liability.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">13. Governing Law</h2>
              <p className="mt-4 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the State of California, 
                without regard to its conflict of law provisions. Any disputes shall be resolved in the state or federal 
                courts located in San Francisco County, California.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">14. Changes to Terms</h2>
              <p className="mt-4 leading-relaxed">
                We may modify these Terms at any time. We will provide notice of material changes by posting the updated 
                Terms and updating the "Last updated" date. Your continued use of the Services after changes constitutes 
                acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">15. Contact</h2>
              <p className="mt-4 leading-relaxed">
                If you have questions about these Terms, please contact us:
              </p>
              <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-6">
                <p><strong>VectorBase Inc.</strong></p>
                <p className="mt-2">548 Market St, Suite 95291</p>
                <p>San Francisco, CA 94104</p>
                <p className="mt-2">Email: <a href="mailto:legal@vectorbase.dev" className="text-violet-400 hover:text-violet-300">legal@vectorbase.dev</a></p>
              </div>
            </section>
          </div>
        </div>
      </main>

<Footer />
    </div>
  )
}
