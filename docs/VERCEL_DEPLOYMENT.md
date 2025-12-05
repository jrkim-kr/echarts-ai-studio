# 🚀 Vercel 배포 가이드

이 문서는 ECharts Dashboard 프로젝트를 Vercel에 배포하는 방법을 안내합니다.

## 📋 사전 준비사항

1. **GitHub 계정**: 프로젝트를 GitHub에 푸시해야 합니다
2. **Vercel 계정**: [vercel.com](https://vercel.com)에서 무료 계정 생성
3. **Firebase 프로젝트**: Firebase 설정이 완료되어 있어야 합니다
4. **OpenAI API 키** (선택사항): AI 기능을 사용하려면 필요합니다

## 1단계: GitHub에 프로젝트 푸시

### 1.1 Git 저장소 초기화 (아직 안 했다면)

```bash
cd /Users/jrkim/Projects/dashboard
git init
git add .
git commit -m "Initial commit"
```

### 1.2 GitHub에 새 저장소 생성

1. [GitHub](https://github.com)에 로그인
2. 새 저장소 생성 (예: `echarts-dashboard`)
3. 저장소 URL 복사 (예: `https://github.com/yourusername/echarts-dashboard.git`)

### 1.3 원격 저장소 추가 및 푸시

```bash
git remote add origin https://github.com/yourusername/echarts-dashboard.git
git branch -M main
git push -u origin main
```

## 2단계: Vercel에 프로젝트 연결

### 2.1 Vercel 로그인

1. [vercel.com](https://vercel.com) 접속
2. "Sign Up" 또는 "Log In" 클릭
3. GitHub 계정으로 로그인 권장 (자동 배포 설정 용이)

### 2.2 새 프로젝트 추가

1. Vercel 대시보드에서 "Add New..." → "Project" 클릭
2. GitHub 저장소 목록에서 `echarts-dashboard` 선택
3. "Import" 클릭

### 2.3 프로젝트 설정 확인

Vercel이 자동으로 Next.js 프로젝트를 감지합니다. 다음 설정이 자동으로 적용됩니다:

- **Framework Preset**: Next.js
- **Root Directory**: `./` (기본값)
- **Build Command**: `npm run build` (자동 감지)
- **Output Directory**: `.next` (자동 감지)
- **Install Command**: `npm install` (자동 감지)

⚠️ **중요**: `vercel.json` 파일이 이미 있으므로 추가 설정은 필요 없습니다.

## 3단계: 환경 변수 설정

### 3.1 Vercel 환경 변수 추가

프로젝트 설정 페이지에서 "Environment Variables" 섹션으로 이동하여 다음 변수들을 추가합니다:

#### 필수: Firebase 환경 변수

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

#### 선택사항: OpenAI API 키

```
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### 3.2 환경 변수 추가 방법

1. Vercel 프로젝트 설정 페이지에서 "Environment Variables" 탭 클릭
2. 각 변수에 대해:
   - **Key**: 변수 이름 입력 (예: `NEXT_PUBLIC_FIREBASE_API_KEY`)
   - **Value**: 실제 값 입력
   - **Environment**: 모든 환경 선택 (Production, Preview, Development)
3. "Save" 클릭
4. 모든 변수를 추가할 때까지 반복

### 3.3 환경 변수 확인

모든 필수 환경 변수가 추가되었는지 확인:

- ✅ `NEXT_PUBLIC_FIREBASE_API_KEY`
- ✅ `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- ✅ `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
- ✅ `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- ✅ `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- ✅ `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- ✅ `NEXT_PUBLIC_FIREBASE_APP_ID`
- ⚠️ `OPENAI_API_KEY` (선택사항)

## 4단계: 배포 실행

### 4.1 자동 배포

환경 변수 설정 후 "Deploy" 버튼을 클릭하면 자동으로 배포가 시작됩니다.

### 4.2 배포 진행 상황 확인

배포 로그를 실시간으로 확인할 수 있습니다:

1. "Deployments" 탭에서 진행 상황 확인
2. 빌드 로그에서 오류가 없는지 확인
3. 배포 완료까지 약 2-3분 소요

### 4.3 배포 성공 확인

배포가 완료되면:

1. "Visit" 버튼을 클릭하여 배포된 사이트 확인
2. 사이트가 정상적으로 로드되는지 확인
3. Firebase 연결이 정상인지 확인 (프로젝트 목록이 표시되는지 확인)

## 5단계: 커스텀 도메인 설정 (선택사항)

### 5.1 도메인 추가

1. Vercel 프로젝트 설정에서 "Domains" 탭 클릭
2. 원하는 도메인 입력 (예: `dashboard.yourdomain.com`)
3. DNS 설정 안내에 따라 도메인 DNS 레코드 추가

### 5.2 SSL 인증서

Vercel이 자동으로 SSL 인증서를 발급하고 관리합니다.

## 6단계: 자동 배포 설정 확인

### 6.1 GitHub 연동 확인

Vercel은 기본적으로 GitHub 저장소와 연동되어 있습니다:

- **main 브랜치에 푸시** → Production 환경에 자동 배포
- **다른 브랜치에 푸시** → Preview 환경에 자동 배포
- **Pull Request 생성** → Preview 환경에 자동 배포

### 6.2 배포 알림 설정

1. 프로젝트 설정 → "Notifications" 탭
2. 이메일 알림 활성화 (선택사항)

## 🔧 문제 해결

### 빌드 실패

**증상**: 배포가 실패하고 빌드 로그에 오류가 표시됨

**해결 방법**:
1. 빌드 로그 확인
2. 환경 변수가 모두 설정되었는지 확인
3. 로컬에서 `npm run build` 실행하여 오류 확인
4. `package.json`의 빌드 스크립트 확인

### 환경 변수 오류

**증상**: 사이트는 로드되지만 Firebase 연결 실패

**해결 방법**:
1. Vercel 환경 변수 설정 확인
2. 변수 이름에 오타가 없는지 확인 (`NEXT_PUBLIC_` 접두사 필수)
3. 변수 값이 올바른지 확인
4. 배포를 다시 실행 (환경 변수 변경 후 재배포 필요)

### Firebase 권한 오류

**증상**: "Permission denied" 오류 발생

**해결 방법**:
1. Firebase Console에서 Realtime Database 규칙 확인
2. 배포된 도메인을 허용 목록에 추가
3. Firebase 보안 규칙 문서 참고: `docs/FIREBASE_SETUP.md`

### OpenAI API 오류

**증상**: AI 기능이 작동하지 않음

**해결 방법**:
1. `OPENAI_API_KEY` 환경 변수가 설정되었는지 확인
2. API 키가 유효한지 확인
3. OpenAI 계정의 사용량 한도 확인

## 📝 배포 후 확인사항

배포 완료 후 다음을 확인하세요:

- [ ] 사이트가 정상적으로 로드됨
- [ ] Firebase 연결이 정상 작동함
- [ ] 프로젝트 생성/저장 기능이 작동함
- [ ] 차트 생성 기능이 작동함
- [ ] (선택사항) AI 차트 생성 기능이 작동함
- [ ] 모바일에서도 정상 작동함

## 🔄 업데이트 배포

코드를 수정한 후:

1. 변경사항을 커밋:
   ```bash
   git add .
   git commit -m "Update: 변경사항 설명"
   ```

2. GitHub에 푸시:
   ```bash
   git push origin main
   ```

3. Vercel이 자동으로 새 배포를 시작합니다
4. 배포 완료 후 자동으로 업데이트가 반영됩니다

## 📚 추가 리소스

- [Vercel 공식 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Firebase 설정 가이드](./FIREBASE_SETUP.md)
- [OpenAI API 설정 가이드](./OPENAI_API_SETUP.md)

## 💡 팁

1. **환경 변수 보안**: 환경 변수는 절대 GitHub에 커밋하지 마세요 (`.gitignore`에 이미 포함됨)
2. **빌드 시간**: 첫 배포는 약 3-5분 소요될 수 있습니다
3. **무료 플랜 제한**: Vercel 무료 플랜은 충분히 이 프로젝트를 실행할 수 있습니다
4. **리전 설정**: `vercel.json`에서 `regions: ["icn1"]`로 설정되어 있어 한국 리전(서울)에 배포됩니다

## 🎉 완료!

배포가 완료되면 프로젝트가 전 세계 어디서나 접근 가능한 URL로 제공됩니다!

배포된 URL 형식: `https://your-project-name.vercel.app`

