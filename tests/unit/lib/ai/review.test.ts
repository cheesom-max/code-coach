import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AIError } from '../../../../src/lib/errors'

// P0-2: AI 응답 파싱 테스트
describe('AI Review', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  describe('generateCodeReview', () => {
    it('should throw AIError when response has no text content', async () => {
      // Mock Anthropic SDK
      vi.doMock('@anthropic-ai/sdk', () => ({
        default: class Anthropic {
          messages = {
            create: vi.fn().mockResolvedValue({
              content: [{ type: 'image', source: {} }], // No text block
            }),
          }
        },
      }))

      const { generateCodeReview } = await import('../../../../src/lib/ai/review')

      await expect(
        generateCodeReview('console.log("test")', 'beginner', 'javascript')
      ).rejects.toThrow('AI 응답 형식이 올바르지 않습니다')
    })

    it('should throw AIError when JSON parsing fails', async () => {
      // Mock Anthropic SDK with invalid JSON
      vi.doMock('@anthropic-ai/sdk', () => ({
        default: class Anthropic {
          messages = {
            create: vi.fn().mockResolvedValue({
              content: [{ type: 'text', text: 'This is not JSON' }],
            }),
          }
        },
      }))

      const { generateCodeReview } = await import('../../../../src/lib/ai/review')

      await expect(
        generateCodeReview('console.log("test")', 'beginner', 'javascript')
      ).rejects.toThrow('AI 응답에서 JSON을 찾을 수 없습니다')
    })

    it('should throw AIError when parsed result has no issues for long code', async () => {
      // Mock Anthropic SDK with empty issues
      vi.doMock('@anthropic-ai/sdk', () => ({
        default: class Anthropic {
          messages = {
            create: vi.fn().mockResolvedValue({
              content: [
                {
                  type: 'text',
                  text: '{"issues": [], "summary": {"totalIssues": 0}}',
                },
              ],
            }),
          }
        },
      }))

      const { generateCodeReview } = await import('../../../../src/lib/ai/review')

      // Long code (>100 chars) should have issues
      const longCode = 'console.log("test");'.repeat(10)

      await expect(
        generateCodeReview(longCode, 'beginner', 'javascript')
      ).rejects.toThrow('리뷰 결과 파싱 실패')
    })

    it('should succeed with valid response', async () => {
      const validResponse = {
        issues: [
          {
            severity: 'warning',
            line: 1,
            title: 'Console statement found',
            problem: 'Console.log in production',
            reason: 'Should not log in production',
            solution: 'Remove console.log',
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
      }

      // Mock Anthropic SDK with valid response
      vi.doMock('@anthropic-ai/sdk', () => ({
        default: class Anthropic {
          messages = {
            create: vi.fn().mockResolvedValue({
              content: [{ type: 'text', text: JSON.stringify(validResponse) }],
            }),
          }
        },
      }))

      const { generateCodeReview } = await import('../../../../src/lib/ai/review')

      const result = await generateCodeReview(
        'console.log("test")',
        'beginner',
        'javascript'
      )

      expect(result.issues).toHaveLength(1)
      expect(result.issues[0].title).toBe('Console statement found')
    })
  })

  describe('detectLanguage', () => {
    it('should detect TypeScript', async () => {
      const { detectLanguage } = await import('../../../../src/lib/ai/review')

      const tsCode = `interface User {
  name: string;
  age: number;
}`

      expect(detectLanguage(tsCode)).toBe('typescript')
    })

    it('should detect Python', async () => {
      const { detectLanguage } = await import('../../../../src/lib/ai/review')

      const pyCode = `def hello():
    print("Hello")
    return None`

      expect(detectLanguage(pyCode)).toBe('python')
    })

    it('should return undefined for unknown language', async () => {
      const { detectLanguage } = await import('../../../../src/lib/ai/review')

      expect(detectLanguage('random text')).toBeUndefined()
    })
  })
})
