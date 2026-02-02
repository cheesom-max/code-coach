import Anthropic from '@anthropic-ai/sdk'
import { getSystemPrompt, getUserPrompt } from './prompts'
import type { ReviewIssue } from '@/types'
import { AIError } from '../errors'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface ReviewResult {
  issues: ReviewIssue[]
  summary: {
    totalIssues: number
    byCategory: Record<string, number>
    bySeverity: Record<string, number>
  }
}

export async function generateCodeReview(
  code: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  language?: string
): Promise<ReviewResult> {
  const systemPrompt = getSystemPrompt(difficulty)
  const userPrompt = getUserPrompt(code, language)

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    })

    // Extract text content from response
    const textContent = response.content.find((block) => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new AIError(
        'AI 응답 형식이 올바르지 않습니다',
        { response: response.content }
      )
    }

    // Parse JSON response
    const result = parseReviewResponse(textContent.text, code)

    // Validate result - if long code has no issues, something went wrong
    if (result.issues.length === 0 && code.length > 100) {
      throw new AIError(
        '리뷰 결과 파싱 실패. 다시 시도해주세요',
        { text: textContent.text }
      )
    }

    return result
  } catch (error) {
    // Re-throw AIError as-is
    if (error instanceof AIError) {
      throw error
    }

    // Wrap other errors
    console.error('Error generating code review:', error)
    throw new AIError(
      'AI 리뷰 생성 중 오류가 발생했습니다',
      { originalError: error }
    )
  }
}

export async function* streamCodeReview(
  code: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  language?: string
): AsyncGenerator<string> {
  const systemPrompt = getSystemPrompt(difficulty)
  const userPrompt = getUserPrompt(code, language)

  const stream = anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  })

  for await (const event of stream) {
    if (event.type === 'content_block_delta') {
      const delta = event.delta
      if ('text' in delta) {
        yield delta.text
      }
    }
  }
}

function parseReviewResponse(text: string, originalCode: string): ReviewResult {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new AIError(
        'AI 응답에서 JSON을 찾을 수 없습니다',
        { text: text.substring(0, 200) }
      )
    }

    const parsed = JSON.parse(jsonMatch[0])

    // Validate and normalize the response
    const issues: ReviewIssue[] = (parsed.issues || []).map((issue: Partial<ReviewIssue>) => ({
      severity: issue.severity || 'info',
      line: issue.line || 0,
      title: issue.title || 'Unknown Issue',
      problem: issue.problem || '',
      reason: issue.reason || '',
      solution: issue.solution || '',
      fixedCode: issue.fixedCode || '',
      learnMore: issue.learnMore || [],
      tip: issue.tip || '',
      category: issue.category || 'best-practice',
    }))

    const summary = parsed.summary || {
      totalIssues: issues.length,
      byCategory: {},
      bySeverity: {},
    }

    return { issues, summary }
  } catch (error) {
    if (error instanceof AIError) {
      throw error
    }

    console.error('Error parsing review response:', error)
    throw new AIError(
      'AI 응답 파싱 중 오류가 발생했습니다',
      { originalError: error, text: text.substring(0, 200) }
    )
  }
}

export function detectLanguage(code: string): string | undefined {
  // Simple language detection based on common patterns
  const patterns: Record<string, RegExp[]> = {
    typescript: [/:\s*(string|number|boolean|any)\b/, /interface\s+\w+/, /type\s+\w+\s*=/],
    javascript: [/const\s+\w+\s*=/, /function\s+\w+/, /=>\s*{/],
    python: [/def\s+\w+\(/, /import\s+\w+/, /:\s*$/m],
    java: [/public\s+class/, /private\s+\w+\s+\w+/, /void\s+\w+\(/],
    go: [/func\s+\w+\(/, /package\s+\w+/, /import\s*\(/],
    rust: [/fn\s+\w+\(/, /let\s+mut/, /impl\s+\w+/],
    sql: [/SELECT\s+/i, /INSERT\s+INTO/i, /CREATE\s+TABLE/i],
    html: [/<\w+[^>]*>/, /<\/\w+>/, /<!DOCTYPE/i],
    css: [/\{[\s\S]*?}/, /:\s*[\w-]+;/, /@media\s*\(/],
  }

  for (const [lang, regexes] of Object.entries(patterns)) {
    const matches = regexes.filter((regex) => regex.test(code)).length
    if (matches >= 2) {
      return lang
    }
  }

  return undefined
}
