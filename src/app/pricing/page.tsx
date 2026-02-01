import Link from 'next/link'
import { Button } from '@/components/ui/Button'

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '',
    description: '시작하기에 딱 좋아요',
    features: [
      '월 3회 코드 리뷰',
      '기본 교육형 피드백',
      '초급/중급/고급 설명',
      '한글 지원',
    ],
    cta: '무료로 시작',
    ctaLink: '/login',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$9.9',
    period: '/월',
    description: '진지하게 성장하고 싶다면',
    features: [
      '월 50회 코드 리뷰',
      '상세 교육형 피드백',
      '학습 트래킹',
      '자주 틀리는 패턴 분석',
      '주간 성장 리포트',
      '우선 지원',
    ],
    cta: 'Pro 시작하기',
    ctaLink: '/login?plan=pro',
    popular: true,
  },
  {
    name: 'Team',
    price: '$29',
    period: '/월',
    description: '팀과 함께 성장하세요',
    features: [
      '무제한 코드 리뷰',
      '모든 Pro 기능',
      '팀 대시보드',
      '팀 성장 리포트',
      '커스텀 룰셋',
      '전담 지원',
    ],
    cta: 'Team 시작하기',
    ctaLink: '/login?plan=team',
    popular: false,
  },
]

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">
            code-coach
          </Link>
          <Link href="/login">
            <Button variant="outline" size="sm">
              로그인
            </Button>
          </Link>
        </div>
      </header>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              합리적인 가격, 확실한 성장
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              무료로 시작하고, 성장에 맞춰 업그레이드하세요.
              <br />
              언제든지 취소할 수 있어요.
            </p>
          </div>

          {/* Plans */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-xl p-8 ${
                  plan.popular
                    ? 'ring-2 ring-blue-600 shadow-xl scale-105'
                    : 'border border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="text-center mb-4">
                    <span className="bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                      가장 인기
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                  <p className="text-gray-600 mt-2">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.ctaLink} className="block">
                  <Button
                    variant={plan.popular ? 'primary' : 'outline'}
                    size="lg"
                    className="w-full"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              자주 묻는 질문
            </h2>

            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">
                  무료 플랜으로 뭘 할 수 있나요?
                </h3>
                <p className="text-gray-600">
                  월 3회 코드 리뷰를 받을 수 있어요. 각 리뷰는 교육형 피드백으로
                  문제, 이유, 해결책, 학습자료를 포함합니다. 처음 시작하기에 충분해요!
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">
                  언제든지 취소할 수 있나요?
                </h3>
                <p className="text-gray-600">
                  네, 언제든지 취소할 수 있어요. 취소해도 현재 결제 기간이
                  끝날 때까지 Pro/Team 기능을 계속 사용할 수 있어요.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">
                  어떤 언어를 지원하나요?
                </h3>
                <p className="text-gray-600">
                  TypeScript, JavaScript, Python, Java, Go, Rust, SQL, HTML, CSS 등
                  주요 프로그래밍 언어를 지원해요. 자동 언어 감지도 가능해요.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">
                  팀 플랜은 몇 명까지 사용할 수 있나요?
                </h3>
                <p className="text-gray-600">
                  현재 Team 플랜은 5명까지 지원해요. 더 많은 인원이 필요하시면
                  별도로 문의해주세요.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            지금 바로 시작하세요
          </h2>
          <p className="text-blue-100 mb-6">
            신용카드 없이 무료로 시작할 수 있어요
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              무료로 시작하기
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 code-coach. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
