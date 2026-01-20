'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Menu, Github } from 'lucide-react'
import Image from 'next/image'

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: 'https://github.com', label: 'Docs' },
  { href: 'https://github.com', label: 'GitHub', icon: Github },
]

export function LandingMobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72 border-white/10 bg-[#0a0a0f]/95 backdrop-blur-xl">
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center gap-2">
            <div className="relative h-8 w-8 overflow-hidden rounded-lg">
              <Image src="/logo.jpg" alt="VectorBase" fill className="object-cover" />
            </div>
            <span className="text-white font-semibold">
              VectorBase
            </span>
          </SheetTitle>
        </SheetHeader>
        <nav className="mt-8 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            >
              {link.icon && <link.icon className="h-4 w-4" />}
              {link.label}
            </Link>
          ))}
          <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
            <Link href="/auth/login" onClick={() => setIsOpen(false)}>
              <Button variant="ghost" className="w-full justify-center text-white/80 hover:bg-white/5 hover:text-white">
                Log in
              </Button>
            </Link>
            <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
              <Button className="w-full bg-white text-black hover:bg-white/90">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
