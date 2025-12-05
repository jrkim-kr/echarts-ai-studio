# OpenAI API 키 설정 가이드

## OpenAI API 키 발급 방법

### 1단계: OpenAI 계정 생성

1. [OpenAI 웹사이트](https://platform.openai.com/)에 접속
2. "Sign up" 버튼을 클릭하여 계정 생성
3. 이메일 인증 완료

### 2단계: API 키 발급

1. 로그인 후 [API Keys 페이지](https://platform.openai.com/api-keys)로 이동
2. 우측 상단의 "Create new secret key" 버튼 클릭
3. 키 이름 입력 (예: "ECharts Dashboard")
4. "Create secret key" 클릭
5. **중요**: 생성된 API 키를 즉시 복사해두세요. 다시 볼 수 없습니다!
   - 형식: `sk-...` (약 51자)

### 3단계: 환경 변수에 추가

프로젝트 루트 디렉토리의 `.env.local` 파일에 추가:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### 4단계: 개발 서버 재시작

환경 변수를 변경한 후에는 반드시 개발 서버를 재시작해야 합니다:

```bash
# 개발 서버 중지 (Ctrl + C)
# 개발 서버 재시작
npm run dev
```

## 예산 설정 (중요!)

⚠️ **OpenAI API를 사용하려면 반드시 예산(Spending Limit)을 설정해야 합니다!**

### 예산 설정 방법

1. **[Billing 페이지](https://platform.openai.com/account/billing) 접속**
2. 좌측 메뉴에서 **"Usage limits"** 또는 **"Spending limits"** 클릭
3. **"Hard limit"** 또는 **"Spending limit"** 섹션에서 원하는 금액 입력
   - 예: `$5`, `$10`, `$20` 등
   - **최소 $5 이상 권장** (테스트용)
4. **"Save"** 또는 **"Update"** 버튼 클릭

### 예산 확인

- 현재 예산이 `$0.00 / $5`로 표시되면 → 예산이 $0으로 설정되어 있어 API 호출 불가
- 예산 설정 후 `$0.00 / $5`로 표시되면 → $5까지 사용 가능

### 예산 초과 시 동작

예산이 초과되거나 $0으로 설정되어 있으면:

- ⚠️ API 호출이 차단됩니다
- 🔄 자동으로 폴백 로직(기본 차트 생성)을 사용합니다
- 💡 콘솔에 예산 설정 안내가 표시됩니다

## API 사용량 및 비용

### 무료 크레딧

- 신규 계정에는 $5 크레딧이 제공됩니다
- 크레딧은 3개월 후 만료됩니다
- **하지만 크레딧이 있어도 예산을 설정하지 않으면 API를 사용할 수 없습니다!**

### 사용량 확인

- [Usage 페이지](https://platform.openai.com/usage)에서 사용량 확인 가능
- [Billing 페이지](https://platform.openai.com/account/billing)에서 결제 정보 및 예산 설정

### 모델별 가격 (2024년 기준)

- **GPT-4o-mini**: $0.15 / 1M 입력 토큰, $0.60 / 1M 출력 토큰
- **GPT-4o**: $2.50 / 1M 입력 토큰, $10.00 / 1M 출력 토큰
- **Vision API (GPT-4o)**: 이미지 분석 시 추가 비용 발생

### 비용 절감 팁

- 텍스트만 사용하는 경우 `gpt-4o-mini` 사용 (기본값)
- 이미지 분석이 필요한 경우에만 `gpt-4o` 사용
- 불필요한 API 호출 방지

## 문제 해결

### API 키가 작동하지 않는 경우

1. `.env.local` 파일에 올바르게 입력되었는지 확인
2. `OPENAI_API_KEY` 변수명이 정확한지 확인 (대소문자 구분)
3. 개발 서버를 재시작했는지 확인
4. API 키 앞뒤에 공백이나 따옴표가 없는지 확인

### "Insufficient quota" 오류

- 계정 크레딧이 부족한 경우 발생
- [Billing 페이지](https://platform.openai.com/account/billing)에서 결제 정보 추가 필요

### "Invalid API key" 오류

- API 키가 잘못되었거나 만료된 경우
- 새로운 API 키를 발급받아 다시 설정

## 보안 주의사항

⚠️ **중요**:

- API 키는 절대 공개 저장소(GitHub 등)에 커밋하지 마세요
- `.env.local` 파일은 이미 `.gitignore`에 포함되어 있습니다
- API 키가 노출되면 즉시 [API Keys 페이지](https://platform.openai.com/api-keys)에서 삭제하고 새로 발급받으세요

## 추가 리소스

- [OpenAI 공식 문서](https://platform.openai.com/docs)
- [API 사용 가이드](https://platform.openai.com/docs/guides/text-generation)
- [Vision API 가이드](https://platform.openai.com/docs/guides/vision)
