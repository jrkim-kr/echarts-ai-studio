# 프로젝트 아키텍처

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

### 데이터베이스 & 스토리지

- **실시간 데이터베이스**: Firebase Realtime Database
- **로컬 스토리지**: localStorage (세션 관리)
- **세션 스토리지**: sessionStorage (임시 상태)

### 배포 & 인프라

- **호스팅**: Vercel
- **빌드 도구**: Next.js Build System
- **패키지 관리**: npm

### 개발 도구

- **린터**: ESLint
- **타입 체크**: TypeScript
- **CSS 처리**: PostCSS, Autoprefixer

## 전체 구조

```
dashboard/
├── app/                          # Next.js App Router
│   ├── api/                      # API 라우트
│   │   └── generate-chart/      # LLM API 엔드포인트
│   │       └── route.ts         # OpenAI API 호출
│   ├── globals.css              # 전역 스타일
│   ├── layout.tsx               # 루트 레이아웃
│   └── page.tsx                 # 메인 페이지
├── components/                   # React 컴포넌트
│   ├── ChartDisplay.tsx         # ECharts 차트 표시 컴포넌트
│   ├── ChartCodeModal.tsx       # 차트 JSON 코드 보기 모달
│   ├── PromptInput.tsx          # 프롬프트 입력 컴포넌트 (요구사항/데이터 분리)
│   ├── JsonInputModal.tsx       # JSON 코드 직접 입력 모달
│   ├── ProjectCard.tsx           # 프로젝트 카드 컴포넌트 (차트 미리보기)
│   ├── ProjectBadge.tsx         # 프로젝트 배지 컴포넌트
│   ├── ProjectSelector.tsx       # 프로젝트 선택 드롭다운
│   ├── ProjectDetailModal.tsx    # 프로젝트 상세 모달
│   ├── PromptExamplesButton.tsx  # 프롬프트 예시 가이드
│   ├── EmptyState.tsx            # 빈 상태 컴포넌트
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

## 아키텍처 패턴

### 1. 컴포넌트 구조

- **프레젠테이션 컴포넌트**: UI만 담당 (ChartDisplay, ProjectCard 등)
- **컨테이너 컴포넌트**: 상태 관리 및 비즈니스 로직 (page.tsx)
- **커스텀 훅**: 재사용 가능한 로직 분리 (useProject, useChart)

### 2. 데이터 흐름

```
사용자 입력 (PromptInput)
    ↓
요구사항 + 데이터 결합
    ↓
LLM API 호출 (/api/generate-chart)
    ↓
ECharts 설정 생성
    ↓
차트 렌더링 (ChartDisplay)
    ↓
자동 저장 (Firebase)
    ↓
프로젝트 목록 업데이트
```

### 3. 상태 관리 전략

- **전역 상태**: 커스텀 훅 사용 (useProject, useChart)
- **로컬 상태**: React useState
- **영구 저장**: Firebase Realtime Database
- **세션 저장**: localStorage (현재 작업), sessionStorage (임시 상태)

## 주요 기능 모듈

### 1. 프로젝트 관리 시스템 (`hooks/useProject.ts`, `lib/firebase.ts`)

- 프로젝트 생성/수정/삭제
- 프로젝트별 데이터 분리 관리
- 프로젝트 목록 조회 및 필터링
- 프로젝트 이름 편집
- 프로젝트 선택 및 상태 관리

### 2. 차트 생성 시스템 (`lib/llm.ts`, `app/api/generate-chart/route.ts`)

- **LLM API 연동**: OpenAI GPT-4o를 통한 AI 기반 차트 생성
- **Vision API**: 이미지 분석을 통한 차트 생성
- **프롬프트 파싱**: 요구사항과 데이터 섹션 구분 처리
- **폴백 로직**: API 실패 시 프롬프트 파싱 기반 차트 생성
- **차트 개선**: 기존 차트 기반 개선 요청 처리

### 3. 차트 렌더링 (`components/ChartDisplay.tsx`)

- ECharts를 통한 인터랙티브 차트 표시
- 차트 이미지 다운로드 (PNG)
- 반응형 차트 크기 조정 (50% ~ 200%)
- 차트 버전 표시
- y축 라벨 클리핑 방지 (동적 grid.left 조정)

### 4. 데이터 저장 (`lib/firebase.ts`)

- Firebase Realtime Database 연동
- 차트 자동 저장 (차트 생성 시)
- 프로젝트별 차트 버전 관리
- 프롬프트 히스토리 관리
- 차트 버전 삭제 및 재인덱싱
- 프로젝트 삭제

### 5. UI/UX 컴포넌트

- **프롬프트 입력**: 요구사항/데이터 분리 입력, 이미지 업로드, 인라인 전송 버튼, JSON 모드 지원
- **JSON 입력 모달**: ECharts JSON 코드 직접 입력 및 파싱
- **차트 코드 모달**: 생성된 차트의 JSON 코드 확인 및 복사
- **프로젝트 카드**: 최신 차트 미리보기, 이름 편집, 삭제 기능
- **프로젝트 배지**: 현재 프로젝트 정보 표시
- **프로젝트 상세 모달**: 차트 히스토리, 버전별 불러오기, 삭제
- **프로젝트 선택기**: 드롭다운, 버전 정보 표시
- **토스트 알림**: 성공/오류 피드백

## API 구조

### `/api/generate-chart` (POST)

- **입력**:
  ```typescript
  {
    prompt: string;           // "요구사항:\n...\n\n데이터:\n..."
    image?: string;          // base64 이미지 (선택사항)
    previousChartConfig?: object;  // 이전 차트 설정 (개선 시)
  }
  ```
- **출력**:
  ```typescript
  {
    chartConfig: EChartsOption;
    debug?: {
      model: string;
      tokensUsed: number;
      cost: { input: number; output: number; total: number };
      hasImage: boolean;
      extractImageData: boolean;
    }
  }
  ```
- **기능**: OpenAI API를 호출하여 ECharts 설정 생성
- **에러 처리**: API 키 없음 또는 오류 시 폴백 로직 사용

## 데이터 모델

### Project (프로젝트)

```typescript
{
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  chartCount: number;
  promptCount: number;
}
```

### ProjectDetail (프로젝트 상세)

```typescript
{
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  charts: Chart[];
  prompts: string[];
}
```

### Chart (차트)

```typescript
{
  id: string;
  config: ChartConfig;  // ECharts 옵션 (함수 제거됨)
  prompt: string;       // 생성 시 사용된 프롬프트
  createdAt: string;
  version?: number;     // 프로젝트 내 버전 번호
  projectId?: string;
}
```

### ChartConfig (ECharts 설정)

```typescript
{
  backgroundColor: string;
  tooltip: object;
  xAxis?: object;
  yAxis?: object;
  series: Array<{
    type: string;
    data: any[];
    [key: string]: any;
  }>;
  version?: number;
  [key: string]: any;
}
```

## 보안 고려사항

1. **환경 변수**: API 키는 서버 사이드에서만 접근 가능 (`OPENAI_API_KEY`)
2. **Firebase 보안 규칙**: 읽기/쓰기 권한 제어 필요
3. **입력 검증**: 사용자 입력 데이터 검증
4. **에러 처리**: 민감한 정보 노출 방지
5. **함수 제거**: Firebase 저장 전 ECharts 설정에서 함수 제거 (`sanitizeForFirebase`)

## 성능 최적화

- **코드 분할**: Next.js 자동 코드 분할
- **이미지 최적화**: 차트 이미지 lazy loading
- **지연 로딩**: 프로젝트 차트 목록 필요 시 로드
- **메모이제이션**: React.memo, useMemo 활용 (필요 시)
- **차트 인스턴스 관리**: ECharts 인스턴스 생성/정리 최적화
- **리사이즈 최적화**: requestAnimationFrame 사용

## 배포 구조

- **빌드**: `next build` → 정적 파일 및 서버리스 함수 생성
- **배포**: Vercel에 자동 배포
- **환경 변수**: Vercel 대시보드에서 관리
- **도메인**: Vercel 제공 도메인 또는 커스텀 도메인
- **리전**: 한국 리전 (icn1) 설정 (`vercel.json`)

## 주요 개선 사항

### 코드 구조

- 타입 정의 중앙화 (`types/index.ts`)
- 커스텀 훅으로 로직 분리 (`hooks/`)
- 컴포넌트 재사용성 향상
- 에러 처리 개선

### 사용자 경험

- 좌우 분할 레이아웃으로 한 화면에 프롬프트와 차트 표시
- 프로젝트 선택기에 버전 정보 표시
- 차트 확대/축소 기능
- 요구사항과 데이터 분리 입력

### 성능

- 지연 로딩 (프로젝트 차트 목록)
- 컴포넌트 최적화
- 불필요한 리렌더링 방지
- ECharts 인스턴스 최적화
