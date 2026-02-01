import Anthropic from '@anthropic-ai/sdk'
import { getSystemPrompt, getUserPrompt } from './prompts'
import type { ReviewIssue } from '@/types'

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
      throw new Error('No text content in response')
    }

    // Parse JSON response
    const result = parseReviewResponse(textContent.text)
    return result
  } catch (error) {
    console.error('Error generating code review:', error)
    throw error
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

function parseReviewResponse(text: string): ReviewResult {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
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
    console.error('Error parsing review response:', error)
    // Return empty result on parse error
    return {
      issues: [],
      summary: {
        totalIssues: 0,
        byCategory: {},
        bySeverity: {},
      },
    }
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
