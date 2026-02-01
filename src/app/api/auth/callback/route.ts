import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/db/supabase-server'
import { createOrUpdateUserFromGitHub } from '@/lib/auth/session'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    const supabase = await createServerSupabaseClient()

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth error:', error)
      return NextResponse.redirect(
        new URL('/login?error=auth_failed', requestUrl.origin)
      )
    }

    if (data.session && data.user) {
      // Get GitHub user data from user metadata
      const githubData = {
        id: data.user.user_metadata.provider_id || data.user.id,
        login: data.user.user_metadata.user_name || data.user.user_metadata.preferred_username || 'user',
        email: data.user.email || '',
        avatar_url: data.user.user_metadata.avatar_url,
        access_token: data.session.provider_token || undefined,
      }

      // Create or update user in our database
      await createOrUpdateUserFromGitHub(data.user.id, githubData)
    }
  }

  // Redirect to the specified page
  return NextResponse.redirect(new URL(next, requestUrl.origin))
}
