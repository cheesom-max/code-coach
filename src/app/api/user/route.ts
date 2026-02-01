import { NextResponse } from 'next/server'
import { getSession, getUser, updateUser } from '@/lib/auth/session'
import { checkReviewLimit } from '@/lib/auth/limits'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const limitResult = await checkReviewLimit(user.id)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        github_username: user.github_username,
        avatar_url: user.avatar_url,
        plan: user.plan,
        difficulty_level: user.difficulty_level,
        created_at: user.created_at,
      },
      usage: {
        reviewCount: user.review_count,
        remaining: limitResult.remaining,
        limit: limitResult.limit,
        resetAt: limitResult.resetAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('User GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { difficulty_level } = body

    // Validate difficulty level
    if (
      difficulty_level &&
      !['beginner', 'intermediate', 'advanced'].includes(difficulty_level)
    ) {
      return NextResponse.json(
        { error: 'Invalid difficulty level' },
        { status: 400 }
      )
    }

    const updatedUser = await updateUser(session.user.id, {
      difficulty_level,
    })

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        difficulty_level: updatedUser.difficulty_level,
      },
    })
  } catch (error) {
    console.error('User PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
