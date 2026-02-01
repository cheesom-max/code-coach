'use client'

import { useState } from 'react'
import { CodeEditor } from '@/components/features/CodeEditor'
import { ReviewResult } from '@/components/features/ReviewResult'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import type { CreateReviewResponse } from '@/types'

export default function ReviewPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<CreateReviewResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (code: string, language?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        if (response.status === 429) {
          setError('이번 달 리뷰 횟수를 모두 사용했어요. 업그레이드하거나 다음 달까지 기다려주세요.')
        } else {
          setError(data.error || '리뷰 생성에 실패했어요. 다시 시도해주세요.')
        }
        return
      }

      const data: CreateReviewResponse = await response.json()
      setResult(data)
    } catch {
      setError('네트워크 오류가 발생했어요. 인터넷 연결을 확인해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setError(null)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">코드 리뷰</h1>
          <p className="text-gray-600 mt-1">
            코드를 붙여넣으면 AI가 교육형 피드백을 제공합니다
          </p>
        </div>

        {/* Code Editor or Result */}
        {!result ? (
          <Card variant="bordered">
            <CardHeader>
              <h2 className="font-semibold text-gray-900">코드 입력</h2>
            </CardHeader>
            <CardContent>
              <CodeEditor
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Actions */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-500">
                  남은 리뷰: {result.remainingReviews === -1 ? '무제한' : `${result.remainingReviews}회`}
                </span>
              </div>
              <button
                onClick={handleReset}
                className="text-sm text-blue-600 hover:underline"
              >
                새 코드 리뷰하기 →
              </button>
            </div>

            {/* Review Result */}
            <ReviewResult
              issues={result.issues}
              summary={result.summary}
            />
          </div>
        )}

        {/* Tips */}
        {!result && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">💡 팁</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 언어를 선택하면 더 정확한 리뷰를 받을 수 있어요</li>
              <li>• 함수 단위로 리뷰하면 더 집중적인 피드백을 받을 수 있어요</li>
              <li>• Ctrl + Enter로 빠르게 제출할 수 있어요</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
