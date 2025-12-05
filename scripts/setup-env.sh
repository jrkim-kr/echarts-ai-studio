#!/bin/bash

# .env.local 파일 생성 스크립트

echo "🚀 ECharts Dashboard 환경 변수 설정"
echo ""

# 프로젝트 루트 디렉토리로 이동
cd "$(dirname "$0")/.."

# .env.local 파일이 이미 존재하는지 확인
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local 파일이 이미 존재합니다."
    read -p "덮어쓰시겠습니까? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ 취소되었습니다."
        exit 1
    fi
fi

# .env.local.example을 복사
if [ -f ".env.local.example" ]; then
    cp .env.local.example .env.local
    echo "✅ .env.local 파일이 생성되었습니다."
else
    # .env.local.example이 없으면 새로 생성
    cat > .env.local << 'EOF'
# Firebase 설정
# Firebase Console에서 가져온 실제 값으로 대체하세요

NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890

# LLM API 설정 (선택사항)
# OPENAI_API_KEY=sk-your-openai-api-key-here
EOF
    echo "✅ .env.local 파일이 생성되었습니다."
fi

echo ""
echo "📝 다음 단계:"
echo "1. .env.local 파일을 열어서 Firebase 설정 정보를 입력하세요"
echo "2. Firebase Console: https://console.firebase.google.com/"
echo "3. 상세한 가이드: SETUP_GUIDE.md 파일을 참고하세요"
echo ""
echo "💡 팁: VS Code에서 .env.local 파일을 열어서 편집할 수 있습니다"

