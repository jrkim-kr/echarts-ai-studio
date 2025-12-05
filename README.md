# ECharts AI Studio

LLM을 활용한 프롬프트 기반 데이터 시각화 대시보드입니다. 자연어 프롬프트와 데이터를 입력하면 AI가 자동으로 차트를 생성합니다.

## 주요 기능

### 📝 프롬프트 기반 차트 생성
- **요구사항 입력**: 차트 유형, 스타일, 기능 요구사항 입력
- **데이터 입력**: 엑셀 테이블, CSV 등 구조화된 데이터 입력
- **이미지 업로드**: 참고할 차트 이미지 업로드 (스타일 참고 또는 데이터 추출)
- **AI 기반 생성**: OpenAI GPT-4o를 활용한 지능형 차트 생성
- **JSON 모드**: ECharts JSON 코드를 직접 입력하여 차트 생성
- **실시간 생성**: 프롬프트 입력 즉시 차트 생성

### 📊 차트 시각화
- **ECharts 통합**: 강력한 차트 라이브러리로 다양한 시각화 지원
- **차트 유형**: Bar, Line, Pie, Scatter, Bubble, Slope 등
- **인터랙티브**: 줌, 팬, 툴팁 등 인터랙티브 기능
- **반응형**: 화면 크기에 자동 조정
- **이미지 저장**: 고해상도 PNG로 다운로드
- **코드 보기**: 생성된 차트의 JSON 코드 확인 및 복사

### 🔄 차트 개선
- **자연어 개선**: 기존 차트를 기반으로 자연어로 개선 요청
- **버전 관리**: 자동 버전 번호 할당 및 추적
- **히스토리**: 프로젝트별 차트 생성 히스토리 관리

### 📚 프로젝트 관리
- **프로젝트별 분리**: 프로젝트별 데이터 및 차트 분리 관리
- **자동 저장**: 차트 생성 시 자동으로 Firebase에 저장
- **프로젝트 편집**: 프로젝트 이름 변경, 삭제 기능
- **차트 버전 관리**: 프로젝트 내 차트 버전별 관리 및 삭제

### 🎨 사용자 인터페이스
- **Toss 스타일 디자인**: 깔끔하고 직관적인 UI/UX
- **좌우 분할 레이아웃**: 프롬프트 입력과 차트를 한 화면에 표시
- **프로젝트 선택기**: 상단 프로젝트 선택 드롭다운 (버전 정보 표시)
- **프로젝트 카드**: 최신 차트 미리보기, 빠른 접근
- **프로젝트 상세 모달**: 차트 히스토리, 버전별 불러오기

## 기술 스택

### 프론트엔드
- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript 5.5
- **UI 라이브러리**: React 18.3
- **스타일링**: Tailwind CSS 3.4
- **차트 라이브러리**: Apache ECharts 5.5

### 백엔드 & API
- **API 라우트**: Next.js API Routes
- **LLM API**: OpenAI GPT-4o / GPT-4o-mini
- **Vision API**: OpenAI GPT-4o (이미지 분석)
- **JSON 모드**: ECharts 옵션 직접 입력 지원

### 데이터베이스 & 스토리지
- **실시간 데이터베이스**: Firebase Realtime Database
- **로컬 스토리지**: localStorage (세션 관리)
- **세션 스토리지**: sessionStorage (임시 상태)

### 배포 & 인프라
- **호스팅**: Vercel
- **빌드 도구**: Next.js Build System
- **패키지 관리**: npm

## 시작하기

### 1. 프로젝트 클론 및 설치

```bash
git clone <repository-url>
cd dashboard
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```env
# Firebase 설정
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.asia-southeast1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# OpenAI API (선택사항)
OPENAI_API_KEY=your_openai_api_key
```

**📖 상세한 설정 가이드:**
- Firebase 설정: [`docs/FIREBASE_SETUP.md`](./docs/FIREBASE_SETUP.md)
- OpenAI API 설정: [`docs/OPENAI_API_SETUP.md`](./docs/OPENAI_API_SETUP.md)

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 빠른 시작 가이드

### 1. Firebase 설정

1. [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
2. Realtime Database 활성화 (테스트 모드로 시작)
3. 보안 규칙 설정:
```json
{
  "rules": {
    "projects": {
      ".read": true,
      ".write": true
    }
  }
}
```
4. 웹 앱 추가 후 설정 정보를 `.env.local`에 입력

자세한 내용은 [`FIREBASE_SETUP.md`](./FIREBASE_SETUP.md)를 참고하세요.

### 2. OpenAI API 설정 (선택사항)

AI 기반 차트 생성을 사용하려면:

1. [OpenAI Platform](https://platform.openai.com/)에서 API 키 발급
2. `.env.local`에 `OPENAI_API_KEY` 추가
3. [OpenAI Billing](https://platform.openai.com/account/billing)에서 예산 설정 (최소 $5 권장)

자세한 내용은 [`docs/OPENAI_API_SETUP.md`](./docs/OPENAI_API_SETUP.md)를 참고하세요.

**참고**: OpenAI API 키가 없어도 기본 차트 생성 기능은 사용할 수 있습니다.

## 사용 예시

### 예시 1: 기본 차트 생성

**요구사항:**
```
제조사별 판매량을 바 차트로 만들어줘
```

**데이터:**
```
스타벅스: 100
네스프레소: 200
카누: 150
```

### 예시 2: 데이터 추출 및 시각화

**요구사항:**
```
EA당 일반가와 행사가를 제조사별로 그룹핑해서 slope chart로 시각화해줘
```

**데이터:**
```
스타벅스, 기본 커피 캡슐, 899, 899
네스프레소, 기본 커피 캡슐, 769, 699
카누, 네스프레소 호환, 799, 549
```

### 예시 3: 이미지 스타일 참고

1. 참고할 차트 이미지 업로드
2. 요구사항과 데이터 입력
3. AI가 이미지 스타일을 참고하여 유사한 형태로 차트 생성

### 예시 4: 이미지에서 데이터 추출

**요구사항:**
```
이미지에서 데이터를 추출해서 차트 만들어줘
```

1. 데이터가 포함된 차트 이미지 업로드
2. AI가 이미지에서 데이터를 추출하여 차트 생성

### 예시 5: JSON 코드 직접 입력

1. "JSON 코드 입력" 버튼 클릭
2. ECharts 옵션 JSON 코드 입력:
```json
{
  "xAxis": {
    "type": "category",
    "data": ["Mon", "Tue", "Wed", "Thu", "Fri"]
  },
  "yAxis": {
    "type": "value"
  },
  "series": [{
    "type": "bar",
    "data": [120, 200, 150, 80, 70]
  }]
}
```
3. "적용" 버튼 클릭하여 차트 생성

## 프로젝트 구조

```
dashboard/
├── app/                          # Next.js App Router
│   ├── api/                      # API 라우트
│   │   └── generate-chart/      # LLM API 엔드포인트
│   │       └── route.ts        # OpenAI API 호출
│   ├── globals.css              # 전역 스타일
│   ├── layout.tsx               # 루트 레이아웃
│   └── page.tsx                 # 메인 페이지
├── components/                   # React 컴포넌트
│   ├── ChartDisplay.tsx         # ECharts 차트 표시
│   ├── ChartCodeModal.tsx       # 차트 JSON 코드 보기 모달
│   ├── PromptInput.tsx          # 프롬프트 입력 (요구사항/데이터 분리)
│   ├── JsonInputModal.tsx       # JSON 코드 직접 입력 모달
│   ├── ProjectCard.tsx           # 프로젝트 카드 (차트 미리보기)
│   ├── ProjectBadge.tsx         # 프로젝트 배지 컴포넌트
│   ├── ProjectSelector.tsx      # 프로젝트 선택 드롭다운
│   ├── ProjectDetailModal.tsx   # 프로젝트 상세 모달
│   ├── PromptExamplesButton.tsx # 프롬프트 예시 가이드
│   ├── EmptyState.tsx           # 빈 상태 컴포넌트
│   ├── LoadingSpinner.tsx       # 로딩 스피너
│   └── Toast.tsx                # 토스트 알림
├── hooks/                       # 커스텀 React 훅
│   ├── useProject.ts           # 프로젝트 관리 훅
│   └── useChart.ts             # 차트 상태 관리 훅
├── lib/                         # 라이브러리 및 유틸리티
│   ├── firebase.ts             # Firebase Realtime Database 연동
│   └── llm.ts                  # LLM API 연동 및 폴백 로직
├── types/                       # TypeScript 타입 정의
│   └── index.ts                # 공통 타입 인터페이스
├── scripts/                     # 유틸리티 스크립트
│   └── setup-env.sh           # 환경 변수 설정 스크립트
└── public/                     # 정적 파일
```

자세한 아키텍처는 [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)를 참고하세요.

## 주요 기능 상세

### 프로젝트 관리
- 프로젝트 자동 생성 (차트 생성 시)
- 프로젝트 이름 변경
- 프로젝트 삭제
- 프로젝트별 차트 버전 관리

### 차트 생성
- 자연어 프롬프트 기반 생성
- 요구사항과 데이터 분리 입력
- 이미지 업로드 지원 (스타일 참고 또는 데이터 추출)
- 차트 버전 자동 관리
- 차트 개선 기능 (기존 차트 기반)

### 차트 관리
- 차트 버전별 불러오기
- 차트 버전 삭제 (자동 재인덱싱)
- 차트 이미지 다운로드 (PNG)
- 차트 확대/축소 기능

## Vercel 배포

프로젝트를 Vercel에 배포하는 상세한 가이드는 [`docs/VERCEL_DEPLOYMENT.md`](./docs/VERCEL_DEPLOYMENT.md)를 참고하세요.

**빠른 배포 단계:**
1. GitHub에 프로젝트 푸시
2. [Vercel](https://vercel.com)에 로그인
3. 새 프로젝트 import
4. 환경 변수 설정 (`.env.local`의 모든 변수)
5. 배포 완료!

## 문서

- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) - 프로젝트 아키텍처 상세 설명
- [`docs/FEATURES.md`](./docs/FEATURES.md) - 기능 목록 및 상세 설명
- [`docs/FIREBASE_SETUP.md`](./docs/FIREBASE_SETUP.md) - Firebase 설정 가이드
- [`docs/OPENAI_API_SETUP.md`](./docs/OPENAI_API_SETUP.md) - OpenAI API 설정 가이드
- [`docs/SETUP_GUIDE.md`](./docs/SETUP_GUIDE.md) - 프로젝트 설정 가이드
- [`docs/VERCEL_DEPLOYMENT.md`](./docs/VERCEL_DEPLOYMENT.md) - Vercel 배포 가이드

## 라이선스

MIT
