import { NextResponse } from 'next/server'
import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks'
import {
  handleSubscriptionActive,
  handleSubscriptionCanceled,
  handleOrderPaid,
} from '@/lib/payments/polar'

// P0-3: Validate webhook secret at module load time
if (!process.env.POLAR_WEBHOOK_SECRET) {
  throw new Error('POLAR_WEBHOOK_SECRET environment variable is required')
}

const WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const headers: Record<string, string> = {}

    request.headers.forEach((value, key) => {
      headers[key] = value
    })

    // Validate webhook signature
    let event
    try {
      event = validateEvent(
        body,
        headers,
        WEBHOOK_SECRET
      )
    } catch (error) {
      if (error instanceof WebhookVerificationError) {
        console.error('Webhook verification failed:', error)
        return NextResponse.json(
          { error: 'Invalid webhook signature' },
          { status: 403 }
        )
      }
      throw error
    }

    // Handle different event types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eventData = event.data as any

    switch (event.type) {
      case 'subscription.active':
        await handleSubscriptionActive({
          id: eventData.id,
          customer_id: eventData.customer_id || eventData.customerId || '',
          metadata: eventData.metadata,
        })
        break

      case 'subscription.canceled':
        await handleSubscriptionCanceled({
          id: eventData.id,
          metadata: eventData.metadata,
        })
        break

      case 'order.paid':
        await handleOrderPaid({
          id: eventData.id,
          customer_id: eventData.customer_id || eventData.customerId || '',
          metadata: eventData.metadata,
        })
        break

      default:
        console.log('Unhandled webhook event type:', event.type)
    }

    return NextResponse.json({ received: true }, { status: 202 })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
