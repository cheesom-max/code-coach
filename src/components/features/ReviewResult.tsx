'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import type { ReviewIssue } from '@/types'

interface ReviewResultProps {
  issues: ReviewIssue[]
  summary: {
    totalIssues: number
    byCategory: Record<string, number>
  }
}

const SEVERITY_STYLES = {
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-600',
    badge: 'bg-red-100 text-red-700',
    label: '오류',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: 'text-yellow-600',
    badge: 'bg-yellow-100 text-yellow-700',
    label: '경고',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
    label: '정보',
  },
}

const CATEGORY_LABELS: Record<string, string> = {
  security: '보안',
  performance: '성능',
  style: '스타일',
  logic: '로직',
  'best-practice': '모범 사례',
}

function IssueCard({ issue }: { issue: ReviewIssue }) {
  const styles = SEVERITY_STYLES[issue.severity]

  return (
    <Card variant="bordered" className={`${styles.bg} ${styles.border}`}>
      <CardHeader className="border-b-0 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-lg ${styles.icon}`}>
              {issue.severity === 'error' && '🔴'}
              {issue.severity === 'warning' && '🟡'}
              {issue.severity === 'info' && '🔵'}
            </span>
            <h3 className="font-semibold text-gray-900">{issue.title}</h3>
          </div>
          <div className="flex gap-2">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles.badge}`}>
              {styles.label}
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
              {CATEGORY_LABELS[issue.category] || issue.category}
            </span>
            {issue.line > 0 && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                Line {issue.line}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Problem */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">📍 문제</h4>
          <p className="text-sm text-gray-600">{issue.problem}</p>
        </div>

        {/* Reason - Educational */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">🤔 왜 문제인가요?</h4>
          <p className="text-sm text-gray-600">{issue.reason}</p>
        </div>

        {/* Solution */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">✅ 이렇게 고치세요</h4>
          <p className="text-sm text-gray-600 mb-2">{issue.solution}</p>
          {issue.fixedCode && (
            <pre className="bg-gray-900 text-gray-100 p-3 rounded-md text-sm overflow-x-auto">
              <code>{issue.fixedCode}</code>
            </pre>
          )}
        </div>

        {/* Learn More */}
        {issue.learnMore && issue.learnMore.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">📚 더 알아보기</h4>
            <ul className="space-y-1">
              {issue.learnMore.map((resource, index) => (
                <li key={index}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    → {resource.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tip */}
        {issue.tip && (
          <div className="bg-white/50 rounded-md p-3 border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-1">💡 레벨업 팁</h4>
            <p className="text-sm text-gray-600">{issue.tip}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function ReviewResult({ issues, summary }: ReviewResultProps) {
  if (issues.length === 0) {
    return (
      <Card variant="bordered" className="bg-green-50 border-green-200">
        <CardContent className="text-center py-8">
          <span className="text-4xl mb-4 block">✨</span>
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            완벽해요!
          </h3>
          <p className="text-sm text-green-600">
            발견된 문제가 없습니다. 코드가 잘 작성되었어요!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card variant="bordered">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">
                총 {summary.totalIssues}개 이슈 발견
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {Object.entries(summary.byCategory)
                  .filter(([, count]) => count > 0)
                  .map(([category, count]) => `${CATEGORY_LABELS[category] || category}: ${count}개`)
                  .join(' · ')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues */}
      <div className="space-y-4">
        {issues.map((issue, index) => (
          <IssueCard key={index} issue={issue} />
        ))}
      </div>
    </div>
  )
}
