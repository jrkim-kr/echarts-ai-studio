# Firebase 설정 가이드

이 문서는 ECharts Dashboard 프로젝트에 Firebase Realtime Database를 설정하는 방법을 단계별로 설명합니다.

## 1단계: Firebase 프로젝트 생성

### 1.1 Firebase Console 접속

1. 웹 브라우저에서 [Firebase Console](https://console.firebase.google.com/)에 접속합니다.
2. Google 계정으로 로그인합니다.

### 1.2 새 프로젝트 추가

1. Firebase Console 메인 페이지에서 **"프로젝트 추가"** 또는 **"Add project"** 버튼을 클릭합니다.
2. 프로젝트 이름을 입력합니다 (예: `echarts-dashboard`)
3. **"계속"** 또는 **"Continue"** 버튼을 클릭합니다.

### 1.3 Google Analytics 설정 (선택사항)

1. Google Analytics 사용 여부를 선택합니다.
   - 프로젝트에서 분석이 필요하면 활성화
   - 필요 없으면 비활성화해도 됩니다
2. **"프로젝트 만들기"** 또는 **"Create project"** 버튼을 클릭합니다.
3. 프로젝트 생성이 완료될 때까지 몇 초 기다립니다.
4. **"계속"** 또는 **"Continue"** 버튼을 클릭합니다.

## 2단계: Realtime Database 활성화

### 2.1 Realtime Database 메뉴 접속

1. Firebase Console 왼쪽 메뉴에서 **"빌드"** 또는 **"Build"** 섹션을 확장합니다.
2. **"Realtime Database"**를 클릭합니다.

### 2.2 데이터베이스 생성

1. **"데이터베이스 만들기"** 또는 **"Create Database"** 버튼을 클릭합니다.
2. 보안 규칙 설정을 선택합니다:
   - **"테스트 모드에서 시작"** (개발 중에는 이 옵션 권장)
   - 또는 **"프로덕션 모드에서 시작"** (보안 규칙을 먼저 설정해야 함)
3. 데이터베이스 위치를 선택합니다:
   - 한국 사용자는 **"asia-northeast3 (Seoul)"** 또는 **"asia-northeast1 (Tokyo)"** 권장
   - 또는 가장 가까운 지역 선택
4. **"완료"** 또는 **"Done"** 버튼을 클릭합니다.

### 2.3 보안 규칙 설정 (중요!)

1. Realtime Database 페이지에서 **"규칙"** 또는 **"Rules"** 탭을 클릭합니다.
2. 다음 규칙을 입력합니다 (개발용 - 프로젝트 구조에 맞게 업데이트됨):

```json
{
  "rules": {
    "projects": {
      ".read": true,
      ".write": true,
      "$projectId": {
        ".read": true,
        ".write": true,
        "charts": {
          ".read": true,
          ".write": true
        },
        "prompts": {
          ".read": true,
          ".write": true
        }
      }
    }
  }
}
```

3. **"게시"** 또는 **"Publish"** 버튼을 클릭합니다.

⚠️ **주의**: 위 규칙은 모든 사용자가 읽기/쓰기를 할 수 있습니다. 프로덕션 환경에서는 인증을 추가해야 합니다.

📖 **자세한 보안 규칙 설정 가이드는 `FIREBASE_RULES.md` 파일을 참고하세요.**

## 3단계: 웹 앱 추가 및 설정 정보 가져오기

### 3.1 웹 앱 추가

1. Firebase Console 왼쪽 상단의 **⚙️ 설정 아이콘**을 클릭합니다.
2. **"프로젝트 설정"** 또는 **"Project settings"**를 클릭합니다.
3. 페이지를 아래로 스크롤하여 **"내 앱"** 또는 **"Your apps"** 섹션을 찾습니다.
4. **"</>"** (웹 아이콘) 버튼을 클릭하여 웹 앱을 추가합니다.

### 3.2 앱 등록 정보 입력

1. 앱 닉네임을 입력합니다 (예: `ECharts Dashboard`)
2. **"Firebase Hosting도 설정"** 체크박스는 선택하지 않아도 됩니다.
3. **"앱 등록"** 또는 **"Register app"** 버튼을 클릭합니다.

### 3.3 Firebase SDK 설정 정보 복사

1. 다음 코드 블록이 표시됩니다. 여기서 설정 정보를 확인할 수 있습니다:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
};
```

2. 이 정보를 복사해두세요. 다음 단계에서 사용합니다.

## 4단계: 환경 변수 파일 생성

### 4.1 .env.local 파일 생성

프로젝트 루트 디렉토리(`/Users/jrkim/Projects/dashboard/`)에 `.env.local` 파일을 생성합니다.

### 4.2 환경 변수 입력

`.env.local` 파일에 다음 형식으로 입력합니다:

```env
# Firebase 설정
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# LLM API 설정 (선택사항)
OPENAI_API_KEY=sk-...
```

### 4.3 각 변수 설명

- `NEXT_PUBLIC_FIREBASE_API_KEY`: Firebase API 키
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: 인증 도메인
- `NEXT_PUBLIC_FIREBASE_DATABASE_URL`: Realtime Database URL (중요!)
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: 프로젝트 ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Storage 버킷 (현재는 사용하지 않지만 설정 필요)
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: 메시징 발신자 ID
- `NEXT_PUBLIC_FIREBASE_APP_ID`: 앱 ID

⚠️ **중요**:

- 모든 변수는 `NEXT_PUBLIC_` 접두사가 필요합니다 (Next.js에서 클라이언트에서 사용하기 위해)
- `.env.local` 파일은 절대 Git에 커밋하지 마세요 (이미 `.gitignore`에 포함되어 있음)

## 5단계: 설정 확인

### 5.1 개발 서버 재시작

환경 변수를 변경한 후에는 개발 서버를 재시작해야 합니다:

```bash
# 개발 서버 중지 (Ctrl + C)
# 그 다음 다시 시작
npm run dev
```

### 5.2 Firebase 연결 테스트

1. 브라우저에서 `http://localhost:3000` 접속
2. 프롬프트 입력 후 차트 생성
3. 브라우저 개발자 도구(F12)의 Console 탭에서 오류 확인
4. Firebase Console의 Realtime Database에서 데이터가 저장되는지 확인

## 6단계: Vercel 배포 시 환경 변수 설정

### 6.1 Vercel 프로젝트 설정

1. [Vercel Dashboard](https://vercel.com/dashboard)에 로그인
2. 프로젝트 선택 또는 새 프로젝트 생성
3. **"Settings"** → **"Environment Variables"** 메뉴로 이동

### 6.2 환경 변수 추가

각 환경 변수를 다음 형식으로 추가합니다:

| Key                                        | Value                                              | Environment                      |
| ------------------------------------------ | -------------------------------------------------- | -------------------------------- |
| `NEXT_PUBLIC_FIREBASE_API_KEY`             | `AIzaSy...`                                        | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`         | `your-project.firebaseapp.com`                     | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_DATABASE_URL`        | `https://your-project-default-rtdb.firebaseio.com` | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`          | `your-project`                                     | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`      | `your-project.appspot.com`                         | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `123456789`                                        | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_APP_ID`              | `1:123456789:web:abcdef123456`                     | Production, Preview, Development |

### 6.3 재배포

환경 변수를 추가한 후 프로젝트를 다시 배포합니다.

## 문제 해결

### 문제 1: "Firebase: Error (auth/invalid-api-key)"

- **원인**: API 키가 잘못되었거나 환경 변수가 제대로 로드되지 않음
- **해결**:
  - `.env.local` 파일의 변수명이 정확한지 확인
  - 개발 서버 재시작
  - 브라우저 캐시 클리어

### 문제 2: "Permission denied"

- **원인**: Realtime Database 보안 규칙이 잘못 설정됨
- **해결**: Firebase Console에서 Rules 탭 확인 및 수정

### 문제 3: "Database URL not found"

- **원인**: `NEXT_PUBLIC_FIREBASE_DATABASE_URL`이 설정되지 않음
- **해결**: Firebase Console에서 Realtime Database URL 확인 및 `.env.local`에 추가

### 문제 4: 환경 변수가 undefined로 표시됨

- **원인**: `NEXT_PUBLIC_` 접두사 누락 또는 서버 재시작 안 함
- **해결**:
  - 모든 Firebase 관련 변수에 `NEXT_PUBLIC_` 접두사 확인
  - 개발 서버 완전히 재시작

## 추가 리소스

- [Firebase 공식 문서](https://firebase.google.com/docs)
- [Firebase Realtime Database 가이드](https://firebase.google.com/docs/database)
- [Next.js 환경 변수 문서](https://nextjs.org/docs/basic-features/environment-variables)
