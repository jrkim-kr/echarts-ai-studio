'use client';

import { useState, useEffect } from 'react';

interface ChartCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  chartConfig: any;
}

export default function ChartCodeModal({ isOpen, onClose, chartConfig }: ChartCodeModalProps) {
  const [copied, setCopied] = useState(false);

  // 모달이 열릴 때 body에 클래스 추가하여 차트 상호작용 차단
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      // 모달 외부의 차트 컨테이너와 canvas 요소들의 z-index를 낮춤
      const modalContainer = document.querySelector('[data-modal="chart-code"]');
      
      // 차트 컨테이너 찾기
      const chartContainers = document.querySelectorAll('[data-chart-container], [data-chart-wrapper]');
      chartContainers.forEach((container) => {
        if (!modalContainer?.contains(container)) {
          (container as HTMLElement).style.zIndex = '1';
          (container as HTMLElement).style.position = 'relative';
        }
      });
      
      // canvas 요소들
      const canvases = document.querySelectorAll('canvas');
      canvases.forEach((canvas) => {
        // 모달 내부의 canvas가 아닌 경우에만 pointer-events를 none으로 설정
        if (!modalContainer?.contains(canvas)) {
          (canvas as HTMLElement).style.pointerEvents = 'none';
          (canvas as HTMLElement).style.zIndex = '1';
        }
      });
    } else {
      document.body.classList.remove('modal-open');
      // 차트 컨테이너 스타일 복원
      const chartContainers = document.querySelectorAll('[data-chart-container], [data-chart-wrapper]');
      chartContainers.forEach((container) => {
        (container as HTMLElement).style.zIndex = '';
        (container as HTMLElement).style.position = '';
      });
      // 차트 canvas 요소들의 pointer-events 복원
      const canvases = document.querySelectorAll('canvas');
      canvases.forEach((canvas) => {
        (canvas as HTMLElement).style.pointerEvents = '';
        (canvas as HTMLElement).style.zIndex = '';
      });
    }

    return () => {
      document.body.classList.remove('modal-open');
      const chartContainers = document.querySelectorAll('[data-chart-container], [data-chart-wrapper]');
      chartContainers.forEach((container) => {
        (container as HTMLElement).style.zIndex = '';
        (container as HTMLElement).style.position = '';
      });
      const canvases = document.querySelectorAll('canvas');
      canvases.forEach((canvas) => {
        (canvas as HTMLElement).style.pointerEvents = '';
        (canvas as HTMLElement).style.zIndex = '';
      });
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const codeString = JSON.stringify(chartConfig, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('복사 실패:', error);
      // 폴백: 텍스트 영역 선택 방식
      const textArea = document.createElement('textarea');
      textArea.value = codeString;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div 
      data-modal="chart-code"
      className="fixed inset-0 bg-black bg-opacity-50 z-[99999] flex items-center justify-center p-4 pt-20"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      style={{ zIndex: 99999 }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[calc(100vh-120px)] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
        style={{ zIndex: 100000 }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">ECharts JSON 코드</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>복사됨!</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>복사</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 코드 영역 */}
        <div className="flex-1 overflow-auto p-5">
          <pre className="bg-gray-50 rounded-lg p-4 text-sm font-mono text-gray-800 overflow-x-auto">
            <code className="block whitespace-pre">{codeString}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

