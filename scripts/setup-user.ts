import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { createClient } from '@supabase/supabase-js'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function main() {
  const email = 'admin@vectorbase.dev'
  const password = 'adminpass123'

  let userId: string

  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
  const existingUser = existingUsers?.users?.find(u => u.email === email)

  if (existingUser) {
    userId = existingUser.id
    console.log('Found existing user:', userId)
  } else {
    const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (error) throw error
    userId = newUser.user.id
    console.log('Created new user:', userId)
  }

  const existingProfile = await prisma.profile.findUnique({ where: { id: userId } })
  if (!existingProfile) {
    await prisma.profile.create({
      data: {
        id: userId,
        email,
        fullName: 'Admin User',
      },
    })
    console.log('Created profile')
  } else {
    console.log('Profile already exists')
  }

  let org = await prisma.organization.findFirst({
    where: { ownerId: userId },
  })
  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: "Admin's Workspace",
        slug: 'admin-workspace',
        ownerId: userId,
      },
    })
    console.log('Created organization:', org.id)
  } else {
    console.log('Organization already exists:', org.id)
  }

  const existingMembership = await prisma.organizationMember.findFirst({
    where: { userId, organizationId: org.id },
  })
  if (!existingMembership) {
    await prisma.organizationMember.create({
      data: {
        userId,
        organizationId: org.id,
        role: 'owner',
      },
    })
    console.log('Created membership')
  } else {
    console.log('Membership already exists')
  }

  const existingSubscription = await prisma.subscription.findFirst({
    where: { organizationId: org.id },
  })
  if (!existingSubscription) {
    await prisma.subscription.create({
      data: {
        organizationId: org.id,
        planId: 'free',
        status: 'active',
      },
    })
    console.log('Created subscription')
  } else {
    console.log('Subscription already exists')
  }

  console.log('\nSetup complete!')
  console.log(`Email: ${email}`)
  console.log(`Password: ${password}`)
}

main()
  .catch(console.error)
  .finally(() => {
    pool.end()
    process.exit(0)
  })
