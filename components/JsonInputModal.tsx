'use client';

import { useState, useEffect } from 'react';

interface JsonInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (jsonCode: any) => void;
}

export default function JsonInputModal({ isOpen, onClose, onApply }: JsonInputModalProps) {
  const [jsonCode, setJsonCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  // 모달이 열릴 때 body에 클래스 추가하여 차트 상호작용 차단
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      // 모달 외부의 차트 컨테이너와 canvas 요소들의 z-index를 낮춤
      const modalContainer = document.querySelector('[data-modal="json-input"]');
      
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

  const handleApply = () => {
    console.log('handleApply 호출됨', { jsonCode: jsonCode.substring(0, 100) });
    
    if (!jsonCode.trim()) {
      setError('JSON 코드를 입력해주세요.');
      return;
    }

    try {
      // 입력값 정리 (앞뒤 공백 제거)
      let cleanedCode = jsonCode.trim();
      
      // JavaScript 객체 리터럴 형식 처리
      // 1. new echarts.graphic.LinearGradient(...) 같은 함수 호출을 객체로 변환
      cleanedCode = cleanedCode.replace(
        /new\s+echarts\.graphic\.LinearGradient\(([^)]*)\)/g,
        (match, args) => {
          // LinearGradient 인자를 파싱하여 객체로 변환
          // 일반적인 형식: 0, 0, 0, 1, [{offset: 0, color: 'rgb(...)'}, {offset: 1, color: 'rgb(...)'}]
          try {
            // 간단한 경우: 그라디언트 정보를 객체로 변환
            // 실제로는 복잡하므로 일단 null로 처리하고 나중에 개선 가능
            return 'null';
          } catch {
            return 'null';
          }
        }
      );
      
      // 2. 키에 따옴표가 없는 경우 처리 (간단한 경우만)
      // 주의: 이 방법은 완벽하지 않지만 일반적인 경우를 처리합니다
      cleanedCode = cleanedCode.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');
      
      // 3. 마지막 세미콜론 제거
      cleanedCode = cleanedCode.replace(/;\s*$/, '');
      
      // JSON 파싱 시도
      let parsed;
      try {
        parsed = JSON.parse(cleanedCode);
      } catch (parseError: any) {
        // JSON 파싱 실패 시 JavaScript 객체 리터럴로 시도
        try {
          // 안전한 방법으로 JavaScript 객체 리터럴 평가
          // Function 생성자를 사용하여 안전하게 평가
          // echarts 객체를 전역에서 가져오거나 모의 객체 생성
          const originalCode = jsonCode.trim().replace(/;\s*$/, '');
          
          // echarts 객체가 없는 경우를 대비하여 모의 객체 생성
          const mockEcharts = {
            graphic: {
              LinearGradient: function(x0: number, y0: number, x1: number, y1: number, colorStops: any[]) {
                // LinearGradient 객체를 반환하는 대신, 그라디언트 정보를 객체로 변환
                return {
                  type: 'linear',
                  x: x0,
                  y: y0,
                  x2: x1,
                  y2: y1,
                  colorStops: colorStops
                };
              }
            }
          };
          
          // Function 생성자를 사용하여 평가 (echarts 객체 주입)
          const func = new Function('echarts', 'return ' + originalCode);
          parsed = func(mockEcharts);
          
          // 함수 객체나 복잡한 객체를 제거하기 위해 JSON 직렬화/역직렬화
          parsed = JSON.parse(JSON.stringify(parsed, (key, value) => {
            // 함수나 undefined 값 제거
            if (typeof value === 'function' || value === undefined) {
              return null;
            }
            // LinearGradient 객체를 일반 객체로 변환
            if (value && typeof value === 'object' && value.type === 'linear') {
              return value;
            }
            return value;
          }));
        } catch (jsError: any) {
          // 더 자세한 에러 메시지 제공
          const errorMessage = parseError.message || 'JSON 파싱 오류';
          const positionMatch = errorMessage.match(/position (\d+)/);
          let detailedMessage = errorMessage;
          
          if (positionMatch) {
            const position = parseInt(positionMatch[1]);
            const lines = cleanedCode.split('\n');
            let currentPos = 0;
            let lineNum = 1;
            let colNum = 1;
            
            for (let i = 0; i < lines.length; i++) {
              const lineLength = lines[i].length + 1; // +1 for newline
              if (currentPos + lineLength > position) {
                lineNum = i + 1;
                colNum = position - currentPos + 1;
                break;
              }
              currentPos += lineLength;
            }
            
            detailedMessage = `JSON 파싱 오류 (${lineNum}번째 줄, ${colNum}번째 문자): ${errorMessage}`;
          }
          
          throw new Error(detailedMessage + '\n\nJavaScript 객체 리터럴 형식도 지원합니다. 함수 호출(new echarts.graphic.LinearGradient 등)은 자동으로 제거됩니다.');
        }
      }
      
      // ECharts 옵션 형식인지 확인
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('유효한 JSON 객체가 아닙니다.');
      }

      // echarts.graphic.LinearGradient 같은 함수는 제거
      const cleaned = JSON.parse(JSON.stringify(parsed));
      
      // series가 있는지 확인 (ECharts 옵션 형식 검증)
      if (!cleaned.series && !cleaned.xAxis && !cleaned.yAxis) {
        throw new Error('유효한 ECharts 옵션 형식이 아닙니다. xAxis, yAxis, series 중 하나 이상이 필요합니다.');
      }
      
      console.log('JSON 파싱 성공, onApply 호출', cleaned);
      setError(null);
      onApply(cleaned);
      setJsonCode('');
      onClose();
    } catch (err: any) {
      console.error('JSON 파싱 오류:', err);
      setError(err.message || 'JSON 파싱 오류가 발생했습니다.');
    }
  };

  const handleClose = () => {
    setJsonCode('');
    setError(null);
    onClose();
  };

  return (
    <div 
      data-modal="json-input"
      className="fixed inset-0 bg-black bg-opacity-50 z-[99999] flex items-center justify-center p-4 pt-20"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
      style={{ zIndex: 99999 }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[calc(100vh-120px)] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
        style={{ zIndex: 100000, pointerEvents: 'auto' }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">ECharts JSON 코드 입력</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 내용 */}
        <div className="flex-1 overflow-auto p-5">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              ECharts 옵션 JSON 코드를 입력하세요
            </label>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">💡 JSON 코드 입력 시 프롬프트는 무시됩니다</p>
                  <p className="text-blue-700">JSON 코드만 사용하여 차트가 생성됩니다. 요구사항 및 데이터 입력 필드는 이 모드에서 사용되지 않습니다.</p>
                </div>
              </div>
            </div>
            <textarea
              value={jsonCode}
              onChange={(e) => {
                setJsonCode(e.target.value);
                setError(null);
              }}
              placeholder={`예시:
{
  "xAxis": {
    "type": "category",
    "data": ["Mon", "Tue", "Wed", "Thu", "Fri"]
  },
  "yAxis": {
    "type": "value"
  },
  "series": [{
    "type": "bar",
    "data": [120, 200, 150, 80, 70]
  }]
}`}
              className="w-full min-h-[400px] px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm leading-relaxed"
            />
            {error && (
              <div className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold">오류 발생</p>
                    <p className="text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 하단 버튼 */}
        <div 
          className="flex items-center justify-end gap-3 p-5 border-t border-gray-200 flex-shrink-0 relative z-50"
          style={{ pointerEvents: 'auto', zIndex: 100001 }}
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClose();
            }}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors relative z-50"
            style={{ pointerEvents: 'auto', zIndex: 100001 }}
          >
            취소
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('적용 버튼 클릭됨');
              handleApply();
            }}
            disabled={!jsonCode.trim()}
            className="px-5 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md disabled:shadow-none relative z-50"
            style={{ pointerEvents: 'auto', zIndex: 100001 }}
          >
            적용
          </button>
        </div>
      </div>
    </div>
  );
}

