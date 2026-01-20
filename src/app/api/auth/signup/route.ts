import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  let userId: string | null = null
  
  try {
    const { email, password, fullName } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName || '',
      },
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    userId = data.user.id
    const userName = fullName || email.split('@')[0]
    const orgSlug = generateSlug(userName)

    await prisma.$transaction(async (tx) => {
      await tx.profile.create({
        data: {
          id: userId!,
          email: email,
          fullName: fullName || null,
        },
      })

      const organization = await tx.organization.create({
        data: {
          name: `${userName}'s Workspace`,
          slug: orgSlug,
          ownerId: userId!,
        },
      })

      await tx.organizationMember.create({
        data: {
          organizationId: organization.id,
          userId: userId!,
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

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: data.user.email,
      },
    })
  } catch (error) {
    console.error('Signup error:', error)
    
    if (userId) {
      try {
        const supabase = createAdminClient()
        await supabase.auth.admin.deleteUser(userId)
      } catch (deleteError) {
        console.error('Failed to cleanup user after error:', deleteError)
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    )
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
