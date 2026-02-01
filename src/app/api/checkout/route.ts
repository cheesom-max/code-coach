import { NextResponse } from 'next/server'
import { getSession, getUser } from '@/lib/auth/session'
import { createCheckout } from '@/lib/payments/polar'
import type { CheckoutRequest, CheckoutResponse } from '@/types'

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse request body
    const body: CheckoutRequest = await request.json()
    const { plan, successUrl, cancelUrl } = body

    if (!plan || !['pro', 'team'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      )
    }

    // Check if user already has this plan
    if (user.plan === plan) {
      return NextResponse.json(
        { error: 'Already subscribed to this plan' },
        { status: 400 }
      )
    }

    // Create checkout session
    const checkoutUrl = await createCheckout({
      userId: user.id,
      email: user.email,
      plan,
      successUrl: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
      cancelUrl: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    })

    const response: CheckoutResponse = {
      checkoutUrl,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Checkout API error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
