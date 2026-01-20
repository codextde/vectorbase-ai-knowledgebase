import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { stripe, STRIPE_PRICE_IDS } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 503 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { planId, billingInterval = 'monthly' } = body

    if (!planId || !STRIPE_PRICE_IDS[planId]) {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      )
    }

    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      include: {
        ownedOrganizations: {
          include: {
            subscription: true,
          },
          take: 1,
        },
      },
    })

    if (!profile || profile.ownedOrganizations.length === 0) {
      return NextResponse.json(
        { error: 'No organization found' },
        { status: 404 }
      )
    }

    const organization = profile.ownedOrganizations[0]
    const subscription = organization.subscription

    const priceId = billingInterval === 'yearly' 
      ? STRIPE_PRICE_IDS[planId].yearly 
      : STRIPE_PRICE_IDS[planId].monthly

    let customerId = subscription?.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email,
        name: profile.fullName || undefined,
        metadata: {
          organizationId: organization.id,
          userId: user.id,
        },
      })
      customerId = customer.id

      if (subscription) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { stripeCustomerId: customerId },
        })
      }
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
      metadata: {
        organizationId: organization.id,
        planId,
        billingInterval,
      },
      subscription_data: {
        metadata: {
          organizationId: organization.id,
          planId,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
