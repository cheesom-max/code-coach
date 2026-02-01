import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession, getUser } from '@/lib/auth/session'
import { checkReviewLimit, formatRemainingReviews } from '@/lib/auth/limits'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const user = await getUser()
  if (!user) {
    redirect('/login')
  }

  const limitResult = await checkReviewLimit(user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              code-coach
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                대시보드
              </Link>
              <Link
                href="/review"
                className="text-gray-600 hover:text-gray-900"
              >
                코드 리뷰
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Usage Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm">
              <span className="text-gray-600">리뷰:</span>
              <span className="font-medium text-gray-900">
                {formatRemainingReviews(limitResult.remaining)}
              </span>
            </div>

            {/* Plan Badge */}
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                user.plan === 'free'
                  ? 'bg-gray-100 text-gray-700'
                  : user.plan === 'pro'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-purple-100 text-purple-700'
              }`}
            >
              {user.plan.toUpperCase()}
            </div>

            {/* User Avatar */}
            <div className="flex items-center gap-2">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.github_username}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600 text-sm font-medium">
                    {user.github_username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="hidden md:inline text-sm text-gray-700">
                {user.github_username}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  )
}
