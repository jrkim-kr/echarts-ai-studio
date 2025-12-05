'use client';

import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import ChartCodeModal from './ChartCodeModal';

interface ChartDisplayProps {
  config: any;
  onSaveImage: (imageDataUrl: string) => void;
}

export default function ChartDisplay({ config, onSaveImage }: ChartDisplayProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartHeight, setChartHeight] = useState(100); // 기본 높이 100% (부모 컨테이너 기준)
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 모달이 열렸는지 감지
  useEffect(() => {
    const checkModalOpen = () => {
      const hasModalOpen = document.body.classList.contains('modal-open');
      setIsModalOpen(hasModalOpen);
    };

    // 초기 확인
    checkModalOpen();

    // MutationObserver로 body 클래스 변경 감지
    const observer = new MutationObserver(checkModalOpen);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current || !config) return;

    let mounted = true;

    // 기존 차트 인스턴스 제거
    if (chartInstance.current) {
      try {
        chartInstance.current.dispose();
      } catch (error) {
        // 이미 dispose된 경우 무시
        console.warn('차트 인스턴스 dispose 오류:', error);
      }
      chartInstance.current = null;
    }

    // DOM이 마운트되어 있는지 확인
    if (!chartRef.current || !mounted) return;

    // 새 차트 인스턴스 생성
    try {
      chartInstance.current = echarts.init(chartRef.current);
    } catch (error) {
      console.error('차트 초기화 오류:', error);
      return;
    }

    // config를 깊은 복사하여 안전하게 사용
    const safeConfig = JSON.parse(JSON.stringify(config));

    // 제목 설정: 가운데 정렬 및 상단 위치
    if (safeConfig.title) {
      // title이 배열인 경우 처리
      if (Array.isArray(safeConfig.title)) {
        safeConfig.title.forEach((title: any) => {
          if (title) {
            title.left = 'center';
            title.top = title.top || 10;
            title.textAlign = 'center';
          }
        });
      } else {
        // title이 객체인 경우
        safeConfig.title.left = 'center';
        safeConfig.title.top = safeConfig.title.top || 10;
        safeConfig.title.textAlign = 'center';
      }
    }

    // 범례 설정: 하단으로 이동
    if (safeConfig.legend) {
      // 범례가 이미 bottom에 있지 않으면 하단으로 이동
      if (safeConfig.legend.bottom === undefined && safeConfig.legend.top === undefined) {
        safeConfig.legend.bottom = 10;
        safeConfig.legend.top = undefined;
      } else if (safeConfig.legend.top !== undefined && safeConfig.legend.bottom === undefined) {
        // top이 설정되어 있으면 bottom으로 변경
        safeConfig.legend.bottom = 10;
        safeConfig.legend.top = undefined;
      }
      // 가운데 정렬
      if (safeConfig.legend.left === undefined && safeConfig.legend.right === undefined) {
        safeConfig.legend.left = 'center';
      }
    }

    // grid 설정: 범례와 제목 공간 확보
    const hasTitle = safeConfig.title && safeConfig.title.text;
    const hasLegend = safeConfig.legend && (
      (Array.isArray(safeConfig.legend.data) && safeConfig.legend.data.length > 0) ||
      safeConfig.legend.data
    );

    if (safeConfig.grid) {
      // y축 라벨 길이를 고려하여 left 여백 확보
      const yAxis = Array.isArray(safeConfig.yAxis) ? safeConfig.yAxis[0] : safeConfig.yAxis;
      if (yAxis && yAxis.axisLabel) {
        // y축 라벨이 긴 경우를 대비해 left 값을 늘림
        const currentLeft = safeConfig.grid.left || 60;
        // y축 name이 있으면 추가 여백 확보
        const hasYAxisName = yAxis.name && yAxis.name.length > 0;
        const nameGap = yAxis.nameGap || 40;
        
        // 라벨 길이를 추정하여 left 값 조정
        const estimatedLabelWidth = 60; // 기본 라벨 너비
        const nameWidth = hasYAxisName ? nameGap + 20 : 0;
        safeConfig.grid.left = Math.max(currentLeft, estimatedLabelWidth + nameWidth + 20);
      } else {
        // 기본값 보장
        safeConfig.grid.left = safeConfig.grid.left || 80;
      }

      // top: 제목이 있으면 공간 확보 (기본 60px)
      if (hasTitle) {
        safeConfig.grid.top = safeConfig.grid.top || 60;
      } else {
        safeConfig.grid.top = safeConfig.grid.top || 40;
      }

      // bottom: 범례가 있으면 공간 확보 (기본 80px)
      if (hasLegend) {
        safeConfig.grid.bottom = safeConfig.grid.bottom || 80;
      } else {
        safeConfig.grid.bottom = safeConfig.grid.bottom || 40;
      }

      // right 여백 보장
      safeConfig.grid.right = safeConfig.grid.right || 60;
    } else {
      // grid가 없는 경우 생성
      const top = hasTitle ? 60 : 40;
      const bottom = hasLegend ? 80 : 40;
      safeConfig.grid = { 
        left: 80, 
        right: 60, 
        top: top, 
        bottom: bottom,
        containLabel: true // 라벨이 잘리지 않도록
      };
    }

    // containLabel이 없으면 추가하여 라벨이 잘리지 않도록
    if (safeConfig.grid && safeConfig.grid.containLabel === undefined) {
      safeConfig.grid.containLabel = true;
    }

    // notMerge: true로 완전히 새로운 옵션으로 설정
    if (chartInstance.current && mounted) {
      try {
        chartInstance.current.setOption(safeConfig, true);
      } catch (error) {
        console.error('차트 옵션 설정 오류:', error);
      }
    }

    // 리사이즈 핸들러
    const handleResize = () => {
      if (chartInstance.current && mounted) {
        try {
          chartInstance.current.resize();
        } catch (error) {
          // dispose된 경우 무시
        }
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      mounted = false;
      window.removeEventListener('resize', handleResize);
      if (chartInstance.current) {
        try {
          chartInstance.current.dispose();
        } catch (error) {
          // 이미 dispose된 경우 무시
        }
        chartInstance.current = null;
      }
    };
  }, [config]);

  const handleDownloadImage = () => {
    if (!chartInstance.current) {
      alert('차트가 아직 준비되지 않았습니다.');
      return;
    }
    
    try {
      const imageDataUrl = chartInstance.current.getDataURL({
        type: 'png',
        pixelRatio: 2,
        backgroundColor: '#fff'
      });
      onSaveImage(imageDataUrl);
    } catch (error) {
      console.error('이미지 저장 실패:', error);
      alert('이미지 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleZoomIn = () => {
    setChartHeight((prev) => Math.min(prev + 10, 200)); // 최대 200% (부모 컨테이너의 2배)
  };

  const handleZoomOut = () => {
    setChartHeight((prev) => Math.max(prev - 10, 50)); // 최소 50% (부모 컨테이너의 절반)
  };

  const handleResetZoom = () => {
    setChartHeight(100); // 기본값으로 리셋 (100%)
  };

  // 높이 변경 시 차트 리사이즈
  useEffect(() => {
    if (chartInstance.current && chartRef.current && containerRef.current) {
      // DOM 업데이트 후 리사이즈 실행
      const resizeChart = () => {
        if (chartInstance.current && chartRef.current) {
          try {
            const width = chartRef.current.offsetWidth;
            const height = chartRef.current.offsetHeight;
            
            // 차트 인스턴스의 너비와 높이를 명시적으로 설정
            chartInstance.current.resize({
              width: width,
              height: height
            });
          } catch (error) {
            // dispose된 경우 무시
            console.warn('차트 리사이즈 오류:', error);
          }
        }
      };
      
      // requestAnimationFrame을 사용하여 DOM 업데이트 후 실행
      requestAnimationFrame(() => {
        setTimeout(resizeChart, 50);
      });
    }
  }, [chartHeight]);

  return (
    <div 
      ref={containerRef} 
      className="space-y-2 h-full flex flex-col"
      style={{ 
        zIndex: isModalOpen ? 1 : 'auto',
        position: isModalOpen ? 'relative' : 'static',
      }}
    >
      <div className="flex items-center justify-between pb-2 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          {config?.version && (
            <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-semibold">
              v{config.version}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* 확대/축소 컨트롤 */}
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={handleZoomOut}
              disabled={chartHeight <= 50}
              className="px-2 py-1.5 bg-white hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed text-gray-700 transition-all text-sm border-r border-gray-200"
              title="축소"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <button
              onClick={handleResetZoom}
              className="px-2 py-1.5 bg-white hover:bg-gray-50 text-gray-700 transition-all text-xs border-r border-gray-200"
              title="리셋"
            >
              {chartHeight}%
            </button>
            <button
              onClick={handleZoomIn}
              disabled={chartHeight >= 200}
              className="px-2 py-1.5 bg-white hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed text-gray-700 transition-all text-sm"
              title="확대"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <button
            onClick={handleDownloadImage}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg font-medium transition-all text-xs border border-gray-200 hover:border-gray-300"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            이미지 저장
          </button>
          <button
            onClick={() => setIsCodeModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg font-medium transition-all text-xs border border-gray-200 hover:border-gray-300"
            title="JSON 코드 보기"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            JSON 코드
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        <div
          ref={chartRef}
          data-chart-container
          className="w-full h-full bg-white rounded-xl border border-gray-100 transition-all duration-300"
          style={{
            height: `${chartHeight}%`,
            minHeight: '300px',
            zIndex: isModalOpen ? 1 : 'auto',
            position: isModalOpen ? 'relative' : 'static',
            overflow: 'visible', // 차트 전체가 보이도록
          }}
        />
      </div>

      {/* JSON 코드 모달 */}
      <ChartCodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        chartConfig={config}
      />
    </div>
  );
}

