# ECharts AI Studio

LLM을 활용한 프롬프트 기반 데이터 시각화 대시보드입니다. 자연어 프롬프트와 데이터를 입력하면 AI가 자동으로 차트를 생성합니다.

🌐 **배포된 웹사이트**: [https://echarts-ai-studio.vercel.app/](https://echarts-ai-studio.vercel.app/)

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
- **모든 ECharts 차트 유형 지원**: Bar, Line, Pie, Scatter, Bubble, Slope, Radar, Sankey, Funnel, Gauge, Treemap, Sunburst, Heatmap, Candlestick, Boxplot, Graph, Parallel, Tree, Theme River, Map, 3D Charts 등
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
- **설정 모달**: 웹사이트에서 직접 Firebase 및 OpenAI 설정
- **가이드 모달**: 설정 가이드를 웹사이트에서 바로 확인

## 기술 스택

### 프론트엔드

- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript 5.5
- **UI 라이브러리**: React 18.3
- **스타일링**: Tailwind CSS 3.4
- **차트 라이브러리**: Apache ECharts 5.5
- **마크다운**: react-markdown, remark-gfm

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
cd echarts-ai-studio
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 3. 웹사이트에서 설정하기

웹사이트가 실행되면 상단 헤더의 **⚙️ 설정 버튼**을 클릭하여 설정 모달을 엽니다.

#### Firebase 설정 (필수)

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

4. 웹 앱 추가 후 설정 정보를 웹사이트 설정 모달에 입력
   - 설정 모달의 **Guide** 버튼을 클릭하면 상세 가이드를 확인할 수 있습니다

**📖 상세한 설정 가이드:**

- 설정 값 가져오기: [`docs/02-환경변수-설정-가이드.md`](./docs/02-환경변수-설정-가이드.md)
- Firebase 설정: [`docs/03-Firebase-설정-가이드.md`](./docs/03-Firebase-설정-가이드.md)

#### OpenAI API 설정 (선택사항)

AI 기반 차트 생성을 사용하려면:

1. [OpenAI Platform](https://platform.openai.com/)에서 API 키 발급
2. 웹사이트 설정 모달에 `OPENAI_API_KEY` 입력
3. [OpenAI Billing](https://platform.openai.com/account/billing)에서 예산 설정 (최소 $5 권장)

**📖 상세한 설정 가이드:**

- 설정 값 가져오기: [`docs/02-환경변수-설정-가이드.md`](./docs/02-환경변수-설정-가이드.md)
- OpenAI API 설정: [`docs/04-OpenAI-API-설정-가이드.md`](./docs/04-OpenAI-API-설정-가이드.md)

**참고**: OpenAI API 키가 없어도 기본 차트 생성 기능은 사용할 수 있습니다.

## 빠른 시작 가이드

더 자세한 빠른 시작 가이드는 [`docs/01-빠른-시작.md`](./docs/01-빠른-시작.md)를 참고하세요.

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
  "series": [
    {
      "type": "bar",
      "data": [120, 200, 150, 80, 70]
    }
  ]
}
```

3. "적용" 버튼 클릭하여 차트 생성

### 예시 6: 다양한 차트 유형

**레이더 차트:**

```
요구사항: 다차원 데이터를 레이더 차트로 보여줘
데이터: ...
```

**히트맵:**

```
요구사항: 행렬 데이터를 히트맵으로 시각화해줘
데이터: ...
```

**네트워크 차트:**

```
요구사항: 관계를 그래프 차트로 만들어줘
데이터: ...
```

모든 ECharts 차트 유형을 지원합니다!

## 프로젝트 구조

```
echarts-ai-studio/
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
│   ├── ProjectSelector.tsx       # 프로젝트 선택 드롭다운
│   ├── ProjectDetailModal.tsx    # 프로젝트 상세 모달
│   ├── PromptExamplesButton.tsx # 프롬프트 예시 가이드
│   ├── SettingsModal.tsx        # 설정 모달 (Firebase/OpenAI 설정)
│   ├── GuideModal.tsx           # 가이드 모달 (설정 가이드 표시)
│   ├── EmptyState.tsx           # 빈 상태 컴포넌트
│   ├── LoadingSpinner.tsx       # 로딩 스피너
│   └── Toast.tsx                # 토스트 알림
├── hooks/                       # 커스텀 React 훅
│   ├── useProject.ts           # 프로젝트 관리 훅
│   └── useChart.ts             # 차트 상태 관리 훅
├── lib/                         # 라이브러리 및 유틸리티
│   ├── firebase.ts             # Firebase Realtime Database 연동
│   ├── llm.ts                  # LLM API 연동 및 폴백 로직
│   └── storage.ts              # 로컬 스토리지 관리
├── types/                       # TypeScript 타입 정의
│   └── index.ts                # 공통 타입 인터페이스
├── docs/                        # 프로젝트 문서
│   ├── 00-문서-목록.md         # 문서 인덱스
│   ├── 01-빠른-시작.md         # 빠른 시작 가이드
│   ├── 02-환경변수-설정-가이드.md # 설정 값 가져오기 가이드
│   ├── 03-Firebase-설정-가이드.md # Firebase 설정 가이드
│   ├── 04-OpenAI-API-설정-가이드.md # OpenAI API 설정 가이드
│   ├── 05-기능-설명.md         # 기능 상세 설명
│   ├── 06-아키텍처.md         # 프로젝트 아키텍처
│   └── 07-Vercel-배포-가이드.md # Vercel 배포 가이드
└── public/                     # 정적 파일
    └── docs/                    # 문서 파일 (웹사이트에서 접근 가능)
```

자세한 아키텍처는 [`docs/06-아키텍처.md`](./docs/06-아키텍처.md)를 참고하세요.

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
- **모든 ECharts 차트 유형 지원**

### 차트 관리

- 차트 버전별 불러오기
- 차트 버전 삭제 (자동 재인덱싱)
- 차트 이미지 다운로드 (PNG)
- 차트 확대/축소 기능

### 설정 관리

- 웹사이트에서 직접 Firebase 설정
- 웹사이트에서 직접 OpenAI API 키 설정
- 설정 가이드 모달 제공
- 설정 저장 및 초기화 기능

## Vercel 배포

**🌐 배포된 웹사이트**: [https://echarts-ai-studio.vercel.app/](https://echarts-ai-studio.vercel.app/)

프로젝트를 Vercel에 배포하는 상세한 가이드는 [`docs/07-Vercel-배포-가이드.md`](./docs/07-Vercel-배포-가이드.md)를 참고하세요.

**빠른 배포 단계:**

1. GitHub에 프로젝트 푸시
2. [Vercel](https://vercel.com)에 로그인
3. 새 프로젝트 import
4. 환경 변수 설정 (Firebase 및 OpenAI 설정)
5. 배포 완료!

## 문서

프로젝트의 모든 문서는 [`docs/00-문서-목록.md`](./docs/00-문서-목록.md)에서 확인할 수 있습니다.

### 주요 문서

- [`docs/01-빠른-시작.md`](./docs/01-빠른-시작.md) - 빠른 시작 가이드
- [`docs/02-환경변수-설정-가이드.md`](./docs/02-환경변수-설정-가이드.md) - 설정 값 가져오기 가이드 (웹사이트 설정 모달 사용)
- [`docs/03-Firebase-설정-가이드.md`](./docs/03-Firebase-설정-가이드.md) - Firebase 설정 가이드
- [`docs/04-OpenAI-API-설정-가이드.md`](./docs/04-OpenAI-API-설정-가이드.md) - OpenAI API 설정 가이드
- [`docs/05-기능-설명.md`](./docs/05-기능-설명.md) - 기능 목록 및 상세 설명
- [`docs/06-아키텍처.md`](./docs/06-아키텍처.md) - 프로젝트 아키텍처 상세 설명
- [`docs/07-Vercel-배포-가이드.md`](./docs/07-Vercel-배포-가이드.md) - Vercel 배포 가이드

## 라이선스

MIT
