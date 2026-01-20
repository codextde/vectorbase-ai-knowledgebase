import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        await ensureUserSetup(user.id, user.email!, user.user_metadata?.full_name)
      }
      
      return NextResponse.redirect(`${origin}${redirectTo}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=Could not authenticate`)
}

async function ensureUserSetup(userId: string, email: string, fullName?: string) {
  try {
    const existingProfile = await prisma.profile.findUnique({
      where: { id: userId },
    })

    if (existingProfile) {
      return
    }

    const userName = fullName || email.split('@')[0]
    const orgSlug = generateSlug(userName)

    await prisma.$transaction(async (tx) => {
      await tx.profile.create({
        data: {
          id: userId,
          email: email,
          fullName: fullName || null,
        },
      })

      const organization = await tx.organization.create({
        data: {
          name: `${userName}'s Workspace`,
          slug: orgSlug,
          ownerId: userId,
        },
      })

      await tx.organizationMember.create({
        data: {
          organizationId: organization.id,
          userId: userId,
          role: 'owner',
        },
      })

      await tx.subscription.create({
        data: {
          organizationId: organization.id,
          planId: 'free',
          status: 'active',
        },
      })
    })
  } catch (error) {
    console.error('Error ensuring user setup:', error)
  }
}

function generateSlug(name: string): string {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 30)
  
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  return `${baseSlug}-${randomSuffix}`
}
