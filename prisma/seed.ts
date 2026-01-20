import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const plans = [
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for trying out VectorBase',
      priceMonthly: 0,
      priceYearly: 0,
      limits: {
        projects: 1,
        documents_per_project: 10,
        websites_per_project: 1,
        message_credits_monthly: 20,
        storage_mb: 100,
        team_members: 1,
      },
      features: ['1 Project', '10 Documents', '20 Messages/month', 'Community Support'],
    },
    {
      id: 'starter',
      name: 'Starter',
      description: 'For individuals and small projects',
      priceMonthly: 19,
      priceYearly: 190,
      limits: {
        projects: 3,
        documents_per_project: 100,
        websites_per_project: 5,
        message_credits_monthly: 1000,
        storage_mb: 1024,
        team_members: 2,
      },
      features: ['3 Projects', '100 Documents each', '1,000 Messages/month', 'Email Support', 'API Access'],
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'For growing teams and businesses',
      priceMonthly: 49,
      priceYearly: 490,
      limits: {
        projects: 10,
        documents_per_project: 500,
        websites_per_project: 20,
        message_credits_monthly: 10000,
        storage_mb: 10240,
        team_members: 10,
      },
      features: ['10 Projects', '500 Documents each', '10,000 Messages/month', 'Priority Support', 'Advanced Analytics', 'Custom Branding'],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large organizations',
      priceMonthly: 199,
      priceYearly: 1990,
      limits: {
        projects: -1,
        documents_per_project: -1,
        websites_per_project: -1,
        message_credits_monthly: -1,
        storage_mb: -1,
        team_members: -1,
      },
      features: ['Unlimited Projects', 'Unlimited Documents', 'Unlimited Messages', 'Dedicated Support', 'SLA', 'SSO', 'Custom Integrations'],
    },
  ]

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { id: plan.id },
      update: plan,
      create: plan,
    })
  }

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
