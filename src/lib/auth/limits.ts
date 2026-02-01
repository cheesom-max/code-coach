import { createAdminClient } from '@/lib/db/supabase'
import { PLAN_LIMITS, type User } from '@/types'

export interface ReviewLimitResult {
  canReview: boolean
  remaining: number
  limit: number
  resetAt: Date
}

export async function checkReviewLimit(userId: string): Promise<ReviewLimitResult> {
  const adminClient = createAdminClient()

  const { data: user, error } = await adminClient
    .from('users')
    .select('plan, review_count, review_reset_at')
    .eq('id', userId)
    .single()

  if (error || !user) {
    return {
      canReview: false,
      remaining: 0,
      limit: 0,
      resetAt: new Date(),
    }
  }

  const plan = user.plan as keyof typeof PLAN_LIMITS
  const limit = PLAN_LIMITS[plan]

  // Check if we need to reset the count (new month)
  const now = new Date()
  const resetAt = new Date(user.review_reset_at)
  const needsReset = resetAt.getMonth() !== now.getMonth() || resetAt.getFullYear() !== now.getFullYear()

  if (needsReset) {
    // Reset the count
    await adminClient
      .from('users')
      .update({
        review_count: 0,
        review_reset_at: now.toISOString(),
      })
      .eq('id', userId)

    return {
      canReview: true,
      remaining: limit === Infinity ? -1 : limit, // -1 indicates unlimited
      limit: limit === Infinity ? -1 : limit,
      resetAt: getNextResetDate(),
    }
  }

  const remaining = limit === Infinity ? -1 : Math.max(0, limit - user.review_count)

  return {
    canReview: limit === Infinity || user.review_count < limit,
    remaining,
    limit: limit === Infinity ? -1 : limit,
    resetAt: getNextResetDate(),
  }
}

export async function incrementReviewCount(userId: string): Promise<number> {
  const adminClient = createAdminClient()

  const { data: user, error } = await adminClient
    .from('users')
    .select('review_count')
    .eq('id', userId)
    .single()

  if (error || !user) {
    return 0
  }

  const newCount = user.review_count + 1

  await adminClient
    .from('users')
    .update({ review_count: newCount })
    .eq('id', userId)

  return newCount
}

function getNextResetDate(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 1)
}

export function formatRemainingReviews(remaining: number): string {
  if (remaining === -1) {
    return '무제한'
  }
  return `${remaining}회 남음`
}
