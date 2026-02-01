// User & Auth Types
export interface User {
  id: string
  email: string
  github_id: string
  github_username: string
  github_access_token?: string
  avatar_url?: string
  plan: 'free' | 'pro' | 'team'
  review_count: number
  review_reset_at: Date
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  created_at: Date
  updated_at: Date
}

// Subscription Types
export interface Subscription {
  id: string
  user_id: string
  polar_subscription_id: string
  polar_customer_id: string
  plan: 'pro' | 'team'
  status: 'active' | 'canceled' | 'past_due' | 'incomplete'
  current_period_start: Date
  current_period_end: Date
  created_at: Date
  updated_at: Date
}

// Review Types
export interface ReviewIssue {
  severity: 'error' | 'warning' | 'info'
  line: number
  title: string
  problem: string
  reason: string
  solution: string
  fixedCode: string
  learnMore: { title: string; url: string }[]
  tip: string
  category: 'security' | 'performance' | 'style' | 'logic' | 'best-practice'
}

export interface Review {
  id: string
  user_id: string
  repo_full_name?: string
  pr_number?: number
  file_path?: string
  original_code: string
  review_result: {
    issues: ReviewIssue[]
    summary: {
      totalIssues: number
      byCategory: Record<string, number>
      bySeverity: Record<string, number>
    }
  }
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  language?: string
  created_at: Date
}

// Learning Log Types
export interface LearningLog {
  id: string
  user_id: string
  review_id: string
  category: string
  pattern: string
  description?: string
  is_resolved: boolean
  created_at: Date
}

// API Request/Response Types
export interface CreateReviewRequest {
  code: string
  language?: string
  repoFullName?: string
  prNumber?: number
  filePath?: string
}

export interface CreateReviewResponse {
  id: string
  issues: ReviewIssue[]
  summary: {
    totalIssues: number
    byCategory: Record<string, number>
  }
  remainingReviews: number
}

export interface CheckoutRequest {
  plan: 'pro' | 'team'
  successUrl: string
  cancelUrl: string
}

export interface CheckoutResponse {
  checkoutUrl: string
}

// Plan Limits
export const PLAN_LIMITS = {
  free: 3,
  pro: 50,
  team: Infinity,
} as const
