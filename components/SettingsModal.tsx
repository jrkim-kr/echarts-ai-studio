"use client";

import { useState, useEffect } from "react";
import {
  saveFirebaseConfig,
  getFirebaseConfig,
  clearFirebaseConfig,
  saveOpenAIApiKey,
  getOpenAIApiKey,
  clearOpenAIApiKey,
  isSettingsComplete,
  FirebaseConfig,
} from "@/lib/storage";
import GuideModal from "./GuideModal";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChanged?: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  onSettingsChanged,
}: SettingsModalProps) {
  const [firebaseConfig, setFirebaseConfig] = useState<FirebaseConfig>({
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
  });
  const [openAIApiKey, setOpenAIApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // 설정 불러오기
  useEffect(() => {
    if (isOpen) {
      const storedFirebase = getFirebaseConfig();
      const storedOpenAI = getOpenAIApiKey();

      if (storedFirebase) {
        setFirebaseConfig(storedFirebase);
      }
      if (storedOpenAI) {
        setOpenAIApiKey(storedOpenAI);
      }
      setSaved(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    // Firebase 설정 검증
    if (
      !firebaseConfig.apiKey ||
      !firebaseConfig.databaseURL ||
      !firebaseConfig.projectId
    ) {
      alert("Firebase 필수 설정을 모두 입력해주세요.\n(API Key, Database URL, Project ID)");
      return;
    }

    // 저장
    saveFirebaseConfig(firebaseConfig);
    if (openAIApiKey.trim()) {
      saveOpenAIApiKey(openAIApiKey.trim());
    } else {
      clearOpenAIApiKey();
    }

    setSaved(true);
    // 저장 후 즉시 설정 변경 콜백 호출
    if (onSettingsChanged) {
      onSettingsChanged();
    }
    setTimeout(() => {
      setSaved(false);
    }, 1500);
  };

  // 현재 설정 완료 여부 확인
  const currentSettingsComplete = isSettingsComplete();

  const handleClear = () => {
    if (
      confirm(
        "모든 설정을 삭제하시겠습니까?\n\n삭제 후에는 Firebase와 OpenAI 기능을 사용할 수 없습니다."
      )
    ) {
      clearFirebaseConfig();
      clearOpenAIApiKey();
      setFirebaseConfig({
        apiKey: "",
        authDomain: "",
        databaseURL: "",
        projectId: "",
        storageBucket: "",
        messagingSenderId: "",
        appId: "",
      });
      setOpenAIApiKey("");
      if (onSettingsChanged) {
        onSettingsChanged();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={(e) => {
        // 배경 클릭 시 닫기
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col m-4">
        {/* 헤더 */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900">설정</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="px-4 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Guide
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 내용 (스크롤 가능 영역) */}
        <div className="flex-1 overflow-y-auto settings-modal-scrollbar px-6 py-4 space-y-6">
          {/* Firebase 설정 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Firebase 설정
              </h3>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                필수
              </span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={firebaseConfig.apiKey}
                  onChange={(e) =>
                    setFirebaseConfig({ ...firebaseConfig, apiKey: e.target.value })
                  }
                  placeholder="AIza..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Auth Domain
                </label>
                <input
                  type="text"
                  value={firebaseConfig.authDomain}
                  onChange={(e) =>
                    setFirebaseConfig({
                      ...firebaseConfig,
                      authDomain: e.target.value,
                    })
                  }
                  placeholder="project-id.firebaseapp.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Database URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={firebaseConfig.databaseURL}
                  onChange={(e) =>
                    setFirebaseConfig({
                      ...firebaseConfig,
                      databaseURL: e.target.value,
                    })
                  }
                  placeholder="https://project-id-default-rtdb.firebaseio.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={firebaseConfig.projectId}
                  onChange={(e) =>
                    setFirebaseConfig({
                      ...firebaseConfig,
                      projectId: e.target.value,
                    })
                  }
                  placeholder="project-id"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Storage Bucket
                </label>
                <input
                  type="text"
                  value={firebaseConfig.storageBucket}
                  onChange={(e) =>
                    setFirebaseConfig({
                      ...firebaseConfig,
                      storageBucket: e.target.value,
                    })
                  }
                  placeholder="project-id.appspot.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Messaging Sender ID
                </label>
                <input
                  type="text"
                  value={firebaseConfig.messagingSenderId}
                  onChange={(e) =>
                    setFirebaseConfig({
                      ...firebaseConfig,
                      messagingSenderId: e.target.value,
                    })
                  }
                  placeholder="123456789012"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  App ID
                </label>
                <input
                  type="text"
                  value={firebaseConfig.appId}
                  onChange={(e) =>
                    setFirebaseConfig({ ...firebaseConfig, appId: e.target.value })
                  }
                  placeholder="1:123456789012:web:abcdef"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Firebase Console에서 프로젝트 설정 → 일반 → 앱에서 확인할 수
              있습니다.
            </p>
          </div>

          {/* OpenAI 설정 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                OpenAI API 설정
              </h3>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                선택
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={openAIApiKey}
                  onChange={(e) => setOpenAIApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKey ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              OpenAI Platform에서 API 키를 발급받을 수 있습니다. (https://platform.openai.com/api-keys)
            </p>
          </div>
        </div>

        {/* 푸터 */}
        <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between rounded-b-2xl">
          <button
            onClick={handleClear}
            className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            설정 초기화
          </button>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                저장되었습니다
              </span>
            )}
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              저장
            </button>
          </div>
        </div>
      </div>

      {/* 가이드 모달 */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}

