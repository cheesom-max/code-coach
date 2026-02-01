import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">
            code-coach
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
              가격
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">
                로그인
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-blue-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
            바이브코더를 위한 코드 리뷰
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            AI로 코드 짜는 시대,
            <br />
            <span className="text-blue-600">이해하며 성장</span>하는 개발자
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            단순히 &quot;고쳐라&quot;가 아닌, &quot;왜&quot;를 알려주는 교육형 코드 리뷰.
            <br />
            바이브코더도 진짜 실력을 키울 수 있어요.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg">무료로 시작하기</Button>
            </Link>
            <Link href="#demo">
              <Button variant="outline" size="lg">
                데모 보기
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            신용카드 필요 없음 · 월 3회 무료 리뷰
          </p>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            기존 도구와 뭐가 다른가요?
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            CodeRabbit, Copilot은 시니어용이에요. code-coach는 바이브코더와 주니어를 위해 만들어졌어요.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Before */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="text-sm font-medium text-gray-500 mb-3">기존 도구</div>
              <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm">
                <span className="text-red-400">❌ Fix SQL injection vulnerability</span>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                뭘 어떻게 고치라는 거지...?
              </p>
            </div>

            {/* After */}
            <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
              <div className="text-sm font-medium text-blue-600 mb-3">code-coach</div>
              <div className="bg-white rounded-lg p-4 text-sm space-y-3 border border-blue-100">
                <div>
                  <span className="text-red-600 font-medium">🔴 SQL 인젝션 위험!</span>
                </div>
                <div className="text-gray-600">
                  <strong>🤔 왜?</strong> 사용자 입력을 직접 SQL에 넣으면 악의적인 사용자가 모든 데이터를 탈취할 수 있어요.
                </div>
                <div className="text-gray-600">
                  <strong>✅ 해결:</strong> Prepared Statement 사용
                </div>
                <div className="text-gray-600">
                  <strong>💡 팁:</strong> 이 패턴 알면 면접에서도 답할 수 있어요!
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            왜 code-coach인가요?
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-3xl mb-4">📚</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                교육형 피드백
              </h3>
              <p className="text-gray-600">
                문제 + 이유 + 해결책 + 학습자료를 한번에 제공. 단순 지적이 아닌 진짜 배움.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                난이도별 설명
              </h3>
              <p className="text-gray-600">
                초급/중급/고급 선택 가능. 내 수준에 맞는 설명으로 효과적인 학습.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-3xl mb-4">📈</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                학습 트래킹
              </h3>
              <p className="text-gray-600">
                자주 틀리는 패턴 분석. 내 약점을 파악하고 집중 개선.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            합리적인 가격
          </h2>
          <p className="text-gray-600 mb-8">
            무료로 시작하고, 필요할 때 업그레이드하세요
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Free</h3>
              <div className="text-3xl font-bold text-gray-900 mb-4">$0</div>
              <p className="text-gray-600">월 3회 리뷰</p>
            </div>

            <div className="bg-blue-600 text-white rounded-xl p-6 shadow-lg transform scale-105">
              <div className="text-xs bg-blue-500 rounded-full px-2 py-0.5 inline-block mb-2">인기</div>
              <h3 className="font-semibold mb-2">Pro</h3>
              <div className="text-3xl font-bold mb-4">$9.9<span className="text-lg font-normal">/월</span></div>
              <p className="text-blue-100">월 50회 리뷰 + 학습 트래킹</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Team</h3>
              <div className="text-3xl font-bold text-gray-900 mb-4">$29<span className="text-lg font-normal">/월</span></div>
              <p className="text-gray-600">무제한 + 팀 대시보드</p>
            </div>
          </div>

          <Link href="/pricing" className="inline-block mt-8">
            <Button variant="outline">자세한 가격 보기 →</Button>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            오늘부터 성장하는 개발자가 되세요
          </h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            AI로 코드를 짜도 괜찮아요. 중요한 건 이해하며 성장하는 거예요.
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              무료로 시작하기
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <span className="text-white font-bold">code-coach</span>
              <span className="ml-2 text-sm">바이브코더를 위한 교육형 AI 코드 리뷰</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/pricing" className="hover:text-white">가격</Link>
              <a href="mailto:support@code-coach.dev" className="hover:text-white">문의</a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">GitHub</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            © 2025 code-coach. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  )
}
