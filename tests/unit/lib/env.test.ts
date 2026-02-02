import { describe, it, expect, afterEach, vi } from 'vitest'
import { validateEnvironment, getRequiredEnvVars } from '../../../src/lib/env'

// P0-4: 환경 변수 검증 테스트
describe('Environment Validation', () => {
  const originalEnv = { ...process.env }

  afterEach(() => {
    // 각 테스트 후 환경 변수 복원
    process.env = { ...originalEnv }
    vi.resetModules()
  })

  describe('validateEnvironment', () => {
    it('should pass when all required variables are set', () => {
      // 모든 필수 변수 설정
      const required = getRequiredEnvVars()
      required.forEach(key => {
        process.env[key] = 'test-value'
      })

      expect(() => validateEnvironment()).not.toThrow()
    })

    it('should throw error when NEXT_PUBLIC_SUPABASE_URL is missing', () => {
      // 모든 변수 설정
      const required = getRequiredEnvVars()
      required.forEach(key => {
        process.env[key] = 'test-value'
      })

      // 하나만 삭제
      delete process.env.NEXT_PUBLIC_SUPABASE_URL

      expect(() => validateEnvironment()).toThrow(
        'Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL'
      )
    })

    it('should throw error when ANTHROPIC_API_KEY is missing', () => {
      // 모든 변수 설정
      const required = getRequiredEnvVars()
      required.forEach(key => {
        process.env[key] = 'test-value'
      })

      // 하나만 삭제
      delete process.env.ANTHROPIC_API_KEY

      expect(() => validateEnvironment()).toThrow(
        'Missing required environment variable: ANTHROPIC_API_KEY'
      )
    })

    it('should throw error when POLAR_WEBHOOK_SECRET is missing', () => {
      // 모든 변수 설정
      const required = getRequiredEnvVars()
      required.forEach(key => {
        process.env[key] = 'test-value'
      })

      // 하나만 삭제
      delete process.env.POLAR_WEBHOOK_SECRET

      expect(() => validateEnvironment()).toThrow(
        'Missing required environment variable: POLAR_WEBHOOK_SECRET'
      )
    })

    it('should return list of all required variables', () => {
      const required = getRequiredEnvVars()

      expect(required).toContain('NEXT_PUBLIC_SUPABASE_URL')
      expect(required).toContain('ANTHROPIC_API_KEY')
      expect(required).toContain('POLAR_WEBHOOK_SECRET')
      expect(required.length).toBeGreaterThan(0)
    })
  })
})
