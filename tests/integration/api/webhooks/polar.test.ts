import { describe, it, expect, vi, beforeEach } from 'vitest'

// P0-3: Polar 웹훅 검증 테스트
describe('POST /api/webhooks/polar', () => {
  const originalSecret = process.env.POLAR_WEBHOOK_SECRET

  beforeEach(() => {
    vi.resetModules()
    // 테스트 전에 환경 변수 복원
    if (originalSecret) {
      process.env.POLAR_WEBHOOK_SECRET = originalSecret
    }
  })

  it('should reject webhook when POLAR_WEBHOOK_SECRET is not set', async () => {
    // 환경 변수 삭제
    delete process.env.POLAR_WEBHOOK_SECRET

    // 웹훅 라우트 임포트 시 에러 발생해야 함
    await expect(async () => {
      await import('../../../../src/app/api/webhooks/polar/route')
    }).rejects.toThrow('POLAR_WEBHOOK_SECRET environment variable is required')
  })

  it('should accept webhook when POLAR_WEBHOOK_SECRET is set', async () => {
    // 시크릿 설정
    process.env.POLAR_WEBHOOK_SECRET = 'test-webhook-secret'

    // 모듈 임포트가 성공해야 함
    const module = await import('../../../../src/app/api/webhooks/polar/route')
    expect(module.POST).toBeDefined()
    expect(typeof module.POST).toBe('function')
  })
})
