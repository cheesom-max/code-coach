import { Polar } from '@polar-sh/sdk'
import { createAdminClient } from '@/lib/db/supabase'

const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
})

export interface CreateCheckoutOptions {
  userId: string
  email: string
  plan: 'pro' | 'team'
  successUrl: string
  cancelUrl: string
}

export async function createCheckout({
  userId,
  email,
  plan,
  successUrl,
  cancelUrl,
}: CreateCheckoutOptions): Promise<string> {
  const productId =
    plan === 'pro'
      ? process.env.POLAR_PRO_PRODUCT_ID!
      : process.env.POLAR_TEAM_PRODUCT_ID!

  const checkout = await polar.checkouts.create({
    products: [productId],
    successUrl,
    customerEmail: email,
    metadata: {
      userId,
      plan,
    },
  })

  return checkout.url
}

export async function getCustomerPortalUrl(polarCustomerId: string): Promise<string | null> {
  try {
    // Polar provides customer portal through their SDK
    // The exact implementation depends on Polar's current API
    // For now, return the Polar dashboard URL
    return `https://polar.sh/purchases/subscriptions`
  } catch (error) {
    console.error('Error getting customer portal URL:', error)
    return null
  }
}

// Webhook event handlers
export async function handleSubscriptionActive(data: {
  id: string
  customer_id: string
  metadata?: { userId?: string; plan?: string }
}) {
  const adminClient = createAdminClient()
  const userId = data.metadata?.userId
  const plan = data.metadata?.plan as 'pro' | 'team' | undefined

  if (!userId || !plan) {
    console.error('Missing userId or plan in subscription metadata')
    return
  }

  // Create or update subscription record
  await adminClient.from('subscriptions').upsert(
    {
      user_id: userId,
      polar_subscription_id: data.id,
      polar_customer_id: data.customer_id,
      plan,
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: getNextMonthDate().toISOString(),
    },
    {
      onConflict: 'user_id',
    }
  )

  // Update user's plan
  await adminClient
    .from('users')
    .update({
      plan,
      review_count: 0, // Reset count when upgrading
    })
    .eq('id', userId)
}

export async function handleSubscriptionCanceled(data: {
  id: string
  metadata?: { userId?: string }
}) {
  const adminClient = createAdminClient()
  const userId = data.metadata?.userId

  if (!userId) {
    // Try to find user by subscription ID
    const { data: subscription } = await adminClient
      .from('subscriptions')
      .select('user_id')
      .eq('polar_subscription_id', data.id)
      .single()

    if (!subscription) {
      console.error('Subscription not found:', data.id)
      return
    }

    // Update subscription status
    await adminClient
      .from('subscriptions')
      .update({ status: 'canceled' })
      .eq('polar_subscription_id', data.id)

    // Downgrade user to free plan
    await adminClient
      .from('users')
      .update({ plan: 'free' })
      .eq('id', subscription.user_id)

    return
  }

  // Update subscription status
  await adminClient
    .from('subscriptions')
    .update({ status: 'canceled' })
    .eq('user_id', userId)

  // Downgrade user to free plan
  await adminClient.from('users').update({ plan: 'free' }).eq('id', userId)
}

export async function handleOrderPaid(data: {
  id: string
  customer_id: string
  metadata?: { userId?: string; plan?: string }
}) {
  // Order paid is typically handled for one-time purchases
  // For subscriptions, we primarily use subscription.active event
  console.log('Order paid:', data.id)
}

function getNextMonthDate(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
}
