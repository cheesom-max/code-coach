import { createServerSupabaseClient } from '@/lib/db/supabase-server'
import { createAdminClient } from '@/lib/db/supabase'
import type { User } from '@/types'

export async function getSession() {
  const supabase = await createServerSupabaseClient()
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error || !session) {
    return null
  }

  return session
}

export async function getUser(): Promise<User | null> {
  const session = await getSession()

  if (!session) {
    return null
  }

  const supabase = await createServerSupabaseClient()
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (error || !user) {
    return null
  }

  return user as User
}

export async function getUserById(userId: string): Promise<User | null> {
  const adminClient = createAdminClient()
  const { data: user, error } = await adminClient
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !user) {
    return null
  }

  return user as User
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
  const adminClient = createAdminClient()
  const { data: user, error } = await adminClient
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error || !user) {
    return null
  }

  return user as User
}

export async function createOrUpdateUserFromGitHub(
  supabaseUserId: string,
  githubData: {
    id: string
    login: string
    email: string
    avatar_url?: string
    access_token?: string
  }
): Promise<User | null> {
  const adminClient = createAdminClient()

  // Check if user exists
  const { data: existingUser } = await adminClient
    .from('users')
    .select('*')
    .eq('id', supabaseUserId)
    .single()

  if (existingUser) {
    // Update existing user
    const { data: user, error } = await adminClient
      .from('users')
      .update({
        github_username: githubData.login,
        avatar_url: githubData.avatar_url,
        github_access_token: githubData.access_token,
      })
      .eq('id', supabaseUserId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      return null
    }

    return user as User
  }

  // Create new user
  const { data: user, error } = await adminClient
    .from('users')
    .insert({
      id: supabaseUserId,
      email: githubData.email,
      github_id: githubData.id,
      github_username: githubData.login,
      avatar_url: githubData.avatar_url,
      github_access_token: githubData.access_token,
      plan: 'free',
      review_count: 0,
      difficulty_level: 'beginner',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating user:', error)
    return null
  }

  return user as User
}
