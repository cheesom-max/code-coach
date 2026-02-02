import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PLAN_LIMITS } from '../../../../src/types'

// Mock Supabase client
const mockSelect = vi.fn()
const mockUpdate = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()

vi.mock('../../../../src/lib/db/supabase', () => ({
  createAdminClient: () => ({
    from: vi.fn().mockReturnValue({
      select: mockSelect.mockReturnThis(),
      update: mockUpdate.mockReturnThis(),
      eq: mockEq.mockReturnThis(),
      single: mockSingle,
    }),
  }),
}))

describe('Review Limits', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  describe('PLAN_LIMITS', () => {
    it('should have correct limits for free plan', () => {
      expect(PLAN_LIMITS.free).toBe(3)
    })

    it('should have correct limits for pro plan', () => {
      expect(PLAN_LIMITS.pro).toBe(50)
    })

    it('should have unlimited reviews for team plan', () => {
      expect(PLAN_LIMITS.team).toBe(Infinity)
    })
  })

  describe('checkReviewLimit', () => {
    it('should allow review when under limit for free plan', async () => {
      const now = new Date()
      mockSingle.mockResolvedValue({
        data: {
          plan: 'free',
          review_count: 2,
          review_reset_at: now.toISOString(),
        },
        error: null,
      })

      const { checkReviewLimit } = await import('../../../../src/lib/auth/limits')
      const result = await checkReviewLimit('user-123')

      expect(result.canReview).toBe(true)
      expect(result.remaining).toBe(1) // 3 - 2 = 1
      expect(result.limit).toBe(3)
    })

    it('should deny review when at limit for free plan', async () => {
      const now = new Date()
      mockSingle.mockResolvedValue({
        data: {
          plan: 'free',
          review_count: 3, // At limit
          review_reset_at: now.toISOString(),
        },
        error: null,
      })

      const { checkReviewLimit } = await import('../../../../src/lib/auth/limits')
      const result = await checkReviewLimit('user-123')

      expect(result.canReview).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should allow unlimited reviews for team plan', async () => {
      const now = new Date()
      mockSingle.mockResolvedValue({
        data: {
          plan: 'team',
          review_count: 1000,
          review_reset_at: now.toISOString(),
        },
        error: null,
      })

      const { checkReviewLimit } = await import('../../../../src/lib/auth/limits')
      const result = await checkReviewLimit('user-123')

      expect(result.canReview).toBe(true)
      expect(result.remaining).toBe(-1) // -1 indicates unlimited
      expect(result.limit).toBe(-1)
    })

    it('should reset count on new month', async () => {
      // Set reset date to last month
      const lastMonth = new Date()
      lastMonth.setMonth(lastMonth.getMonth() - 1)

      mockSingle.mockResolvedValue({
        data: {
          plan: 'free',
          review_count: 3, // Was at limit
          review_reset_at: lastMonth.toISOString(),
        },
        error: null,
      })

      const { checkReviewLimit } = await import('../../../../src/lib/auth/limits')
      const result = await checkReviewLimit('user-123')

      expect(result.canReview).toBe(true)
      expect(result.remaining).toBe(3) // Reset to full limit
    })

    it('should handle user not found', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      })

      const { checkReviewLimit } = await import('../../../../src/lib/auth/limits')
      const result = await checkReviewLimit('unknown-user')

      expect(result.canReview).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.limit).toBe(0)
    })

    it('should allow review when under limit for pro plan', async () => {
      const now = new Date()
      mockSingle.mockResolvedValue({
        data: {
          plan: 'pro',
          review_count: 49,
          review_reset_at: now.toISOString(),
        },
        error: null,
      })

      const { checkReviewLimit } = await import('../../../../src/lib/auth/limits')
      const result = await checkReviewLimit('user-123')

      expect(result.canReview).toBe(true)
      expect(result.remaining).toBe(1) // 50 - 49 = 1
      expect(result.limit).toBe(50)
    })
  })

  describe('incrementReviewCount', () => {
    it('should increment count by 1', async () => {
      mockSingle.mockResolvedValue({
        data: { review_count: 2 },
        error: null,
      })

      const { incrementReviewCount } = await import('../../../../src/lib/auth/limits')
      const newCount = await incrementReviewCount('user-123')

      expect(newCount).toBe(3)
      expect(mockUpdate).toHaveBeenCalledWith({ review_count: 3 })
    })

    it('should return 0 if user not found', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      })

      const { incrementReviewCount } = await import('../../../../src/lib/auth/limits')
      const newCount = await incrementReviewCount('unknown-user')

      expect(newCount).toBe(0)
    })
  })

  describe('formatRemainingReviews', () => {
    it('should format unlimited as "무제한"', async () => {
      const { formatRemainingReviews } = await import('../../../../src/lib/auth/limits')
      expect(formatRemainingReviews(-1)).toBe('무제한')
    })

    it('should format remaining count correctly', async () => {
      const { formatRemainingReviews } = await import('../../../../src/lib/auth/limits')
      expect(formatRemainingReviews(5)).toBe('5회 남음')
    })

    it('should format zero correctly', async () => {
      const { formatRemainingReviews } = await import('../../../../src/lib/auth/limits')
      expect(formatRemainingReviews(0)).toBe('0회 남음')
    })
  })
})
