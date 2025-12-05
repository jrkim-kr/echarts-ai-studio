'use client';

import { useState, useRef, useEffect } from 'react';

export default function PromptExamplesButton() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl text-gray-700 text-sm font-medium transition-colors shadow-sm"
      >
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Guide</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-[500px] sm:w-[500px] bg-white border border-gray-200 rounded-2xl shadow-lg z-50 overflow-hidden">
          <div className="p-3 sm:p-4">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">프롬프트 작성 예시</h3>
            
            {/* 기본 예시 */}
            <div className="bg-gray-50 rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <div>
                <span className="font-semibold text-gray-700 mb-1 block text-xs sm:text-sm">요구사항:</span>
                <div className="bg-white border border-gray-200 rounded-lg p-2 sm:p-3 text-gray-900 font-mono text-[10px] sm:text-xs break-words">
                  &quot;제조사별 판매량을 바 차트로 만들어줘&quot;
                </div>
              </div>
              <div>
                <span className="font-semibold text-gray-700 mb-1 block text-xs sm:text-sm">데이터:</span>
                <div className="bg-white border border-gray-200 rounded-lg p-2 sm:p-3 text-gray-900 font-mono text-[10px] sm:text-xs break-words">
                  스타벅스: 100, 네스프레소: 200, 카누: 150
                </div>
              </div>
              <div>
                <span className="font-semibold text-gray-700 mb-1 block text-xs sm:text-sm">이미지 (선택):</span>
                <div className="bg-white border border-gray-200 rounded-lg p-2 sm:p-3 text-gray-500 text-[10px] sm:text-xs italic break-words">
                  [차트 스타일 참고용 이미지 업로드]
                </div>
              </div>
            </div>

            {/* 팁 */}
            <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-[10px] sm:text-xs text-blue-700">
                  <p className="font-semibold mb-1">💡 팁</p>
                  <p className="break-words">• 이미지 업로드 시 기본적으로 스타일만 참고합니다</p>
                  <p className="break-words">• &quot;이미지에서 데이터 추출&quot; 등의 키워드를 포함하면 이미지 데이터를 사용합니다</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

