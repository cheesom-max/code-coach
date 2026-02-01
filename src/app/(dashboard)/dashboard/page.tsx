import Link from 'next/link'
import { getUser } from '@/lib/auth/session'
import { checkReviewLimit, formatRemainingReviews } from '@/lib/auth/limits'
import { createAdminClient } from '@/lib/db/supabase'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'

export default async function DashboardPage() {
  const user = await getUser()
  if (!user) return null

  const limitResult = await checkReviewLimit(user.id)

  // Get recent reviews
  const adminClient = createAdminClient()
  const { data: recentReviews } = await adminClient
    .from('reviews')
    .select('id, language, issues_found, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get learning stats
  const { data: learningStats } = await adminClient
    .from('learning_logs')
    .select('category')
    .eq('user_id', user.id)

  const categoryCount: Record<string, number> = {}
  learningStats?.forEach((log) => {
    categoryCount[log.category] = (categoryCount[log.category] || 0) + 1
  })

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          안녕하세요, {user.github_username}님!
        </h1>
        <p className="text-gray-600 mt-1">오늘도 성장하는 하루 되세요.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card variant="bordered" className="bg-blue-50 border-blue-200">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">남은 리뷰</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">
                  {formatRemainingReviews(limitResult.remaining)}
                </p>
              </div>
              <Link href="/review">
                <Button size="sm">리뷰하기</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="py-6">
            <div>
              <p className="text-sm text-gray-600 font-medium">총 리뷰 횟수</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {recentReviews?.length || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="py-6">
            <div>
              <p className="text-sm text-gray-600 font-medium">현재 플랜</p>
              <p className="text-3xl font-bold text-gray-900 mt-1 capitalize">
                {user.plan}
              </p>
              {user.plan === 'free' && (
                <Link href="/pricing" className="text-sm text-blue-600 hover:underline">
                  업그레이드 →
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Reviews */}
        <Card variant="bordered">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">최근 리뷰</h2>
              <Link href="/review" className="text-sm text-blue-600 hover:underline">
                모두 보기
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentReviews && recentReviews.length > 0 ? (
              <ul className="space-y-3">
                {recentReviews.map((review) => (
                  <li
                    key={review.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-700">
                        {review.language || 'Unknown'}
                      </span>
                      <span className="text-sm text-gray-600">
                        {review.issues_found}개 이슈 발견
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(review.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">아직 리뷰 기록이 없어요</p>
                <Link href="/review">
                  <Button size="sm">첫 리뷰 받기</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Learning Stats */}
        <Card variant="bordered">
          <CardHeader>
            <h2 className="font-semibold text-gray-900">학습 통계</h2>
          </CardHeader>
          <CardContent>
            {Object.keys(categoryCount).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(categoryCount).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{category}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${Math.min(100, (count / 10) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">리뷰를 받으면 학습 통계가 표시됩니다</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Difficulty Setting */}
      <Card variant="bordered" className="mt-6">
        <CardHeader>
          <h2 className="font-semibold text-gray-900">설명 난이도</h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
              <button
                key={level}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  user.difficulty_level === level
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {level === 'beginner' && '초급'}
                {level === 'intermediate' && '중급'}
                {level === 'advanced' && '고급'}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-3">
            {user.difficulty_level === 'beginner' && '쉬운 용어와 비유로 설명합니다'}
            {user.difficulty_level === 'intermediate' && '일반적인 기술 용어로 설명합니다'}
            {user.difficulty_level === 'advanced' && '고급 개념과 패턴을 포함합니다'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
