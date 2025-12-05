# 🚀 프로젝트 설정 가이드

이 가이드는 ECharts Dashboard 프로젝트를 처음 설정하는 방법을 단계별로 설명합니다.

## 📋 목차

1. [환경 변수 파일 생성](#1-환경-변수-파일-생성)
2. [Firebase 프로젝트 생성](#2-firebase-프로젝트-생성)
3. [Firebase 설정 정보 가져오기](#3-firebase-설정-정보-가져오기)
4. [환경 변수 입력](#4-환경-변수-입력)
5. [설정 확인](#5-설정-확인)

---

## 1. 환경 변수 파일 생성

### 방법 1: 터미널 사용 (Mac/Linux)

```bash
cd /Users/jrkim/Projects/dashboard
touch .env.local
```

### 방법 2: VS Code 사용

1. VS Code에서 `dashboard` 폴더를 엽니다
2. 파일 탐색기에서 우클릭 → **"New File"** 클릭
3. 파일 이름을 `.env.local`로 입력합니다
4. Enter 키를 눌러 파일을 생성합니다

### 방법 3: Finder 사용 (Mac)

1. Finder에서 `/Users/jrkim/Projects/dashboard` 폴더를 엽니다
2. `Cmd + Shift + .` (점)을 눌러 숨김 파일을 표시합니다
3. 빈 공간에서 우클릭 → **"새 문서 만들기"** → **"텍스트 문서"**
4. 파일 이름을 `.env.local`로 변경합니다

⚠️ **주의**: 파일 이름이 정확히 `.env.local`이어야 합니다 (앞에 점이 있어야 함)

---

## 2. Firebase 프로젝트 생성

### 2.1 Firebase Console 접속

1. 웹 브라우저를 열고 [https://console.firebase.google.com/](https://console.firebase.google.com/) 접속
2. Google 계정으로 로그인

### 2.2 새 프로젝트 만들기

1. **"프로젝트 추가"** 또는 **"Add project"** 버튼 클릭
2. 프로젝트 이름 입력 (예: `echarts-dashboard`)
3. **"계속"** 클릭
4. Google Analytics 설정 (선택사항)
   - 필요하면 활성화, 아니면 비활성화
5. **"프로젝트 만들기"** 클릭
6. 프로젝트 생성 완료까지 대기 (약 30초)
7. **"계속"** 클릭

### 2.3 Realtime Database 활성화

1. 왼쪽 메뉴에서 **"빌드"** → **"Realtime Database"** 클릭
2. **"데이터베이스 만들기"** 클릭
3. 보안 규칙 선택:
   - **"테스트 모드에서 시작"** 선택 (개발용)
   - ⚠️ 프로덕션에서는 보안 규칙을 반드시 설정해야 합니다
4. 위치 선택:
   - 한국: **"asia-northeast3 (Seoul)"** 권장
   - 또는 가장 가까운 지역 선택
5. **"완료"** 클릭

### 2.4 보안 규칙 설정

1. Realtime Database 페이지에서 **"규칙"** 탭 클릭
2. 다음 규칙 입력:

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

3. **"게시"** 버튼 클릭

---

## 3. Firebase 설정 정보 가져오기

### 3.1 웹 앱 추가

1. Firebase Console 왼쪽 상단의 **⚙️ 설정 아이콘** 클릭
2. **"프로젝트 설정"** 클릭
3. 페이지를 아래로 스크롤하여 **"내 앱"** 섹션 찾기
4. **"</>"** (웹 아이콘) 버튼 클릭

### 3.2 앱 등록

1. 앱 닉네임 입력 (예: `ECharts Dashboard`)
2. **"Firebase Hosting도 설정"** 체크박스는 선택하지 않음
3. **"앱 등록"** 클릭

### 3.3 설정 정보 확인

다음과 같은 코드 블록이 표시됩니다:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "echarts-dashboard.firebaseapp.com",
  databaseURL: "https://echarts-dashboard-default-rtdb.firebaseio.com",
  projectId: "echarts-dashboard",
  storageBucket: "echarts-dashboard.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
};
```

이 정보를 복사해두세요!

---

## 4. 환경 변수 입력

### 4.1 .env.local 파일 열기

생성한 `.env.local` 파일을 텍스트 에디터로 엽니다.

### 4.2 환경 변수 입력

다음 형식으로 입력합니다 (위에서 복사한 실제 값으로 대체):

```env
# Firebase 설정
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=echarts-dashboard.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://echarts-dashboard-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=echarts-dashboard
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=echarts-dashboard.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890

# LLM API 설정 (선택사항 - 나중에 추가 가능)
# OPENAI_API_KEY=sk-...
```

### 4.3 각 변수 매핑

Firebase 설정 코드에서 `.env.local`로 변환하는 방법:

| Firebase 코드       | .env.local 변수명                          | 예시 값                                                 |
| ------------------- | ------------------------------------------ | ------------------------------------------------------- |
| `apiKey`            | `NEXT_PUBLIC_FIREBASE_API_KEY`             | `AIzaSy...`                                             |
| `authDomain`        | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`         | `echarts-dashboard.firebaseapp.com`                     |
| `databaseURL`       | `NEXT_PUBLIC_FIREBASE_DATABASE_URL`        | `https://echarts-dashboard-default-rtdb.firebaseio.com` |
| `projectId`         | `NEXT_PUBLIC_FIREBASE_PROJECT_ID`          | `echarts-dashboard`                                     |
| `storageBucket`     | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`      | `echarts-dashboard.appspot.com`                         |
| `messagingSenderId` | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `123456789012`                                          |
| `appId`             | `NEXT_PUBLIC_FIREBASE_APP_ID`              | `1:123456789012:web:abcdef...`                          |

### 4.4 파일 저장

파일을 저장합니다 (`Cmd + S` 또는 `Ctrl + S`)

---

## 5. 설정 확인

### 5.1 개발 서버 재시작

환경 변수를 변경한 후에는 반드시 개발 서버를 재시작해야 합니다:

```bash
# 터미널에서 개발 서버 중지 (Ctrl + C)
# 그 다음 다시 시작
cd /Users/jrkim/Projects/dashboard
npm run dev
```

### 5.2 브라우저에서 확인

1. 브라우저에서 [http://localhost:3000](http://localhost:3000) 접속
2. 페이지가 정상적으로 로드되는지 확인
3. 브라우저 개발자 도구 열기 (`F12` 또는 `Cmd + Option + I`)
4. **Console** 탭에서 오류가 없는지 확인

### 5.3 Firebase 연결 테스트

1. 프롬프트 입력창에 아무 텍스트나 입력 (예: "테스트 차트")
2. **"차트 생성하기"** 버튼 클릭
3. 차트가 생성되는지 확인
4. Firebase Console에서 Realtime Database를 확인:
   - Firebase Console → Realtime Database → **"데이터"** 탭
   - `charts` 폴더에 데이터가 저장되었는지 확인

---

## 🔧 문제 해결

### 문제: 환경 변수가 undefined로 표시됨

**원인**:

- `NEXT_PUBLIC_` 접두사 누락
- 개발 서버를 재시작하지 않음
- 파일 이름이 잘못됨 (`.env.local`이어야 함)

**해결**:

1. 모든 Firebase 변수에 `NEXT_PUBLIC_` 접두사 확인
2. 개발 서버 완전히 종료 후 재시작
3. 파일 이름이 정확히 `.env.local`인지 확인

### 문제: Firebase 연결 오류

**원인**:

- API 키가 잘못됨
- Database URL이 잘못됨
- 보안 규칙이 잘못 설정됨

**해결**:

1. Firebase Console에서 설정 정보 다시 확인
2. `.env.local` 파일의 값이 정확한지 확인
3. Realtime Database 보안 규칙 확인

### 문제: Permission denied 오류

**원인**:

- 보안 규칙이 너무 엄격함
- 데이터베이스 경로가 잘못됨

**해결**:

1. Firebase Console → Realtime Database → **"규칙"** 탭 확인
2. 위에서 제공한 보안 규칙 적용
3. **"게시"** 버튼 클릭

---

## 📝 체크리스트

설정이 완료되었는지 확인하세요:

- [ ] `.env.local` 파일 생성 완료
- [ ] Firebase 프로젝트 생성 완료
- [ ] Realtime Database 활성화 완료
- [ ] 보안 규칙 설정 완료
- [ ] 웹 앱 추가 완료
- [ ] 모든 환경 변수 입력 완료
- [ ] 개발 서버 재시작 완료
- [ ] 브라우저에서 테스트 완료
- [ ] Firebase에 데이터 저장 확인 완료

---

## 🚀 다음 단계

설정이 완료되면:

1. **차트 생성 테스트**: 프롬프트를 입력하여 차트가 생성되는지 확인
2. **히스토리 확인**: 생성된 차트가 Firebase에 저장되고 히스토리에 표시되는지 확인
3. **차트 유형 변경**: 다양한 차트 유형으로 변환해보기
4. **Vercel 배포**: 프로젝트를 Vercel에 배포하기 (환경 변수도 Vercel에 설정 필요)

---

## 📚 추가 리소스

- [Firebase 공식 문서](https://firebase.google.com/docs)
- [Next.js 환경 변수 가이드](https://nextjs.org/docs/basic-features/environment-variables)
- [Firebase Realtime Database 가이드](https://firebase.google.com/docs/database)
