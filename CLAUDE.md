# code-coach 프로젝트 컨텍스트

## 프로젝트 개요

바이브코더를 위한 교육형 AI 코드 리뷰 서비스

- **한줄 설명**: AI로 코드 짜는 바이브코더가 실력도 키울 수 있는 교육형 코드 리뷰
- **타겟 사용자**: 바이브코더, 주니어 개발자, 비전공 개발자
- **핵심 가치**: 코드 리뷰 + 학습 (왜 고쳐야 하는지 이해)

## 기술 스택

| 영역 | 기술 | 버전 |
|------|------|------|
| Framework | Next.js | 14.x (App Router) |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.x |
| Database | Supabase (PostgreSQL) | - |
| Auth | Supabase Auth (GitHub OAuth) | - |
| AI | Claude API (Anthropic) | claude-sonnet-4-20250514 |
| Payment | Polar | - |
| Email | Resend | - |
| Hosting | Vercel | - |

## 코드 규칙

### 파일 구조
```
src/
├── app/           # 페이지 및 API 라우트
│   ├── (auth)/    # 인증 관련 페이지
│   ├── (dashboard)/ # 대시보드 페이지
│   └── api/       # API 엔드포인트
├── components/    # 재사용 컴포넌트
│   ├── ui/        # 공통 UI 컴포넌트
│   └── features/  # 기능별 컴포넌트
├── lib/           # 유틸리티 및 설정
│   ├── db/        # 데이터베이스 관련
│   ├── auth/      # 인증 관련
│   ├── ai/        # AI 리뷰 로직
│   └── payments/  # 결제 관련
└── types/         # TypeScript 타입 정의
```

### 코딩 스타일
- TypeScript strict mode 사용
- 함수형 컴포넌트 + React hooks
- Tailwind CSS 사용 (인라인 스타일 X)
- 에러는 try-catch로 처리
- async/await 사용 (Promise chain X)

### 네이밍 규칙
- 컴포넌트: PascalCase (e.g., `UserCard.tsx`)
- 유틸리티: camelCase (e.g., `formatDate.ts`)
- 상수: UPPER_SNAKE_CASE (e.g., `MAX_REVIEWS`)
- API 라우트: kebab-case (e.g., `create-checkout`)

### 테스트 규칙
- 모든 API 엔드포인트는 테스트 필수
- 핵심 비즈니스 로직은 단위 테스트
- Vitest 사용

## 환경 변수

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# GitHub OAuth (Supabase에서 설정)
# GITHUB_CLIENT_ID= (Supabase 대시보드에서 설정)
# GITHUB_CLIENT_SECRET= (Supabase 대시보드에서 설정)

# Anthropic
ANTHROPIC_API_KEY=

# Polar
POLAR_ACCESS_TOKEN=
POLAR_WEBHOOK_SECRET=
POLAR_PRO_PRODUCT_ID=
POLAR_TEAM_PRODUCT_ID=

# Resend
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 주요 명령어

```bash
npm run dev      # 개발 서버 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버
npm run lint     # ESLint 검사
npm test         # Vitest 테스트
```

## 현재 진행 상황

- [x] Phase 1: 프로젝트 초기화
- [ ] Phase 2: 핵심 기능 (GitHub OAuth, AI 리뷰)
- [ ] Phase 3: 결제 연동 (Polar)
- [ ] Phase 4: UI/UX 완성
- [ ] Phase 5: 테스트 및 배포

## API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | /api/auth/callback | GitHub OAuth 콜백 |
| POST | /api/reviews | 코드 리뷰 생성 |
| GET | /api/reviews/[id] | 리뷰 상세 조회 |
| GET | /api/reviews/history | 리뷰 히스토리 |
| POST | /api/checkout | 결제 세션 생성 |
| POST | /api/webhooks/polar | Polar 웹훅 |
| GET | /api/user | 사용자 정보 |
| PATCH | /api/user | 사용자 설정 변경 |

## 플랜별 제한

| 플랜 | 월 리뷰 횟수 | 가격 |
|------|-------------|------|
| Free | 3회 | $0 |
| Pro | 50회 | $9.9/월 |
| Team | 무제한 | $29/월 |
