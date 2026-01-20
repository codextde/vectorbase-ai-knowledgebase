import Link from 'next/link'
import Image from 'next/image'
import { Github, Twitter } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 bg-[#0a0a0f]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative h-8 w-8 overflow-hidden rounded-lg">
                <Image src="/logo.jpg" alt="VectorBase" fill className="object-cover" />
              </div>
              <span className="text-lg font-semibold tracking-tight text-white">VectorBase</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-white/60">
              The modern RAG infrastructure for building AI-powered knowledge bases.
            </p>
            <div className="mt-6 flex gap-4">
              <Link href="https://twitter.com" className="text-white/40 transition-colors hover:text-white">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="https://github.com/codextde/vectorbase-ai-knowledgebase" className="text-white/40 transition-colors hover:text-white">
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-white">Product</h4>
            <ul className="mt-4 space-y-3">
              <li><Link href="/#features" className="text-sm text-white/60 hover:text-white">Features</Link></li>
              <li><Link href="/#pricing" className="text-sm text-white/60 hover:text-white">Pricing</Link></li>
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
  )
}
