import { NextResponse } from 'next/server'
import { getSession, getUser } from '@/lib/auth/session'
import { checkReviewLimit, incrementReviewCount } from '@/lib/auth/limits'
import { generateCodeReview, detectLanguage } from '@/lib/ai/review'
import { createAdminClient } from '@/lib/db/supabase'
import type { CreateReviewRequest, CreateReviewResponse } from '@/types'

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

    // Check review limit
    const limitResult = await checkReviewLimit(user.id)
    if (!limitResult.canReview) {
      return NextResponse.json(
        {
          error: 'Review limit reached',
          remaining: 0,
          resetAt: limitResult.resetAt.toISOString(),
        },
        { status: 429 }
      )
    }

    // Parse request body
    const body: CreateReviewRequest = await request.json()
    const { code, language, repoFullName, prNumber, filePath } = body

    if (!code || code.trim().length === 0) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      )
    }

    // Detect language if not provided
    const detectedLanguage = language || detectLanguage(code)

    // Generate AI review
    const reviewResult = await generateCodeReview(
      code,
      user.difficulty_level,
      detectedLanguage
    )

    // Save review to database
    const adminClient = createAdminClient()
    const { data: savedReview, error: saveError } = await adminClient
      .from('reviews')
      .insert({
        user_id: user.id,
        repo_full_name: repoFullName,
        pr_number: prNumber,
        file_path: filePath,
        original_code: code,
        review_result: reviewResult,
        difficulty: user.difficulty_level,
        language: detectedLanguage,
        issues_found: reviewResult.issues.length,
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving review:', saveError)
    }

    // Save learning logs for each issue
    if (savedReview && reviewResult.issues.length > 0) {
      const learningLogs = reviewResult.issues.map((issue) => ({
        user_id: user.id,
        review_id: savedReview.id,
        category: issue.category,
        pattern: issue.title,
        description: issue.reason,
        is_resolved: false,
      }))

      await adminClient.from('learning_logs').insert(learningLogs)
    }

    // Increment review count
    await incrementReviewCount(user.id)
    const updatedLimit = await checkReviewLimit(user.id)

    const response: CreateReviewResponse = {
      id: savedReview?.id || '',
      issues: reviewResult.issues,
      summary: reviewResult.summary,
      remainingReviews: updatedLimit.remaining,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Review API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate review' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const adminClient = createAdminClient()
    const { data: reviews, error } = await adminClient
      .from('reviews')
      .select('id, repo_full_name, file_path, language, issues_found, created_at')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching reviews:', error)
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      )
    }

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Reviews GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
