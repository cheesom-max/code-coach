import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock modules
vi.mock('../../../src/lib/auth/session', () => ({
  getSession: vi.fn(),
  getUser: vi.fn(),
}))

vi.mock('../../../src/lib/auth/limits', () => ({
  checkReviewLimit: vi.fn(),
  incrementReviewCount: vi.fn(),
}))

vi.mock('../../../src/lib/ai/review', () => ({
  generateCodeReview: vi.fn(),
  detectLanguage: vi.fn().mockReturnValue('javascript'),
}))

vi.mock('../../../src/lib/db/supabase', () => ({
  createAdminClient: () => ({
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: 'review-123' },
        error: null,
      }),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    }),
  }),
}))

describe('POST /api/reviews', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 when not authenticated', async () => {
    const { getSession } = await import('../../../src/lib/auth/session')
    vi.mocked(getSession).mockResolvedValue(null)

    const { POST } = await import('../../../src/app/api/reviews/route')
    const request = new Request('http://localhost/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ code: 'console.log("test")' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 404 when user not found', async () => {
    const { getSession, getUser } = await import('../../../src/lib/auth/session')
    vi.mocked(getSession).mockResolvedValue({ user: { id: 'user-123' } } as never)
    vi.mocked(getUser).mockResolvedValue(null)

    const { POST } = await import('../../../src/app/api/reviews/route')
    const request = new Request('http://localhost/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ code: 'console.log("test")' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('User not found')
  })

  it('should return 429 when review limit reached', async () => {
    const { getSession, getUser } = await import('../../../src/lib/auth/session')
    const { checkReviewLimit } = await import('../../../src/lib/auth/limits')

    vi.mocked(getSession).mockResolvedValue({ user: { id: 'user-123' } } as never)
    vi.mocked(getUser).mockResolvedValue({
      id: 'user-123',
      plan: 'free',
      difficulty_level: 'beginner',
    } as never)
    vi.mocked(checkReviewLimit).mockResolvedValue({
      canReview: false,
      remaining: 0,
      limit: 3,
      resetAt: new Date('2026-03-01'),
    })

    const { POST } = await import('../../../src/app/api/reviews/route')
    const request = new Request('http://localhost/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ code: 'console.log("test")' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.error).toBe('Review limit reached')
    expect(data.remaining).toBe(0)
  })

  it('should return 400 when code is empty', async () => {
    const { getSession, getUser } = await import('../../../src/lib/auth/session')
    const { checkReviewLimit } = await import('../../../src/lib/auth/limits')

    vi.mocked(getSession).mockResolvedValue({ user: { id: 'user-123' } } as never)
    vi.mocked(getUser).mockResolvedValue({
      id: 'user-123',
      plan: 'free',
      difficulty_level: 'beginner',
    } as never)
    vi.mocked(checkReviewLimit).mockResolvedValue({
      canReview: true,
      remaining: 3,
      limit: 3,
      resetAt: new Date('2026-03-01'),
    })

    const { POST } = await import('../../../src/app/api/reviews/route')
    const request = new Request('http://localhost/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ code: '' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Code is required')
  })

  it('should return review result on success', async () => {
    const { getSession, getUser } = await import('../../../src/lib/auth/session')
    const { checkReviewLimit, incrementReviewCount } = await import('../../../src/lib/auth/limits')
    const { generateCodeReview } = await import('../../../src/lib/ai/review')

    vi.mocked(getSession).mockResolvedValue({ user: { id: 'user-123' } } as never)
    vi.mocked(getUser).mockResolvedValue({
      id: 'user-123',
      plan: 'free',
      difficulty_level: 'beginner',
    } as never)
    vi.mocked(checkReviewLimit).mockResolvedValue({
      canReview: true,
      remaining: 3,
      limit: 3,
      resetAt: new Date('2026-03-01'),
    })
    vi.mocked(incrementReviewCount).mockResolvedValue(1)
    vi.mocked(generateCodeReview).mockResolvedValue({
      issues: [
        {
          severity: 'warning',
          line: 1,
          title: 'Console statement',
          problem: 'Console.log in code',
          reason: 'Should not be in production',
          solution: 'Remove it',
          fixedCode: '// removed',
          learnMore: [],
          tip: 'Use proper logging',
          category: 'best-practice',
        },
      ],
      summary: {
        totalIssues: 1,
        byCategory: { 'best-practice': 1 },
        bySeverity: { warning: 1 },
      },
    })

    const { POST } = await import('../../../src/app/api/reviews/route')
    const request = new Request('http://localhost/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ code: 'console.log("test")' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.issues).toHaveLength(1)
    expect(data.issues[0].title).toBe('Console statement')
    expect(data.summary.totalIssues).toBe(1)
  })
})

describe('GET /api/reviews', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 when not authenticated', async () => {
    const { getSession } = await import('../../../src/lib/auth/session')
    vi.mocked(getSession).mockResolvedValue(null)

    const { GET } = await import('../../../src/app/api/reviews/route')
    const request = new Request('http://localhost/api/reviews')

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return review history', async () => {
    const { getSession } = await import('../../../src/lib/auth/session')
    vi.mocked(getSession).mockResolvedValue({ user: { id: 'user-123' } } as never)

    // Re-mock for this test
    vi.doMock('../../../src/lib/db/supabase', () => ({
      createAdminClient: () => ({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          range: vi.fn().mockResolvedValue({
            data: [
              { id: 'r1', language: 'javascript', issues_found: 2, created_at: '2026-02-01' },
              { id: 'r2', language: 'python', issues_found: 1, created_at: '2026-02-01' },
            ],
            error: null,
          }),
        }),
      }),
    }))

    const { GET } = await import('../../../src/app/api/reviews/route')
    const request = new Request('http://localhost/api/reviews?limit=10&offset=0')

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.reviews).toBeDefined()
  })
})
