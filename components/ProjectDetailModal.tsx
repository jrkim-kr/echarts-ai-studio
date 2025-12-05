'use client';

import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { updateProjectName, deleteChart, getProject } from '@/lib/firebase';

interface ProjectDetailModalProps {
  project: any;
  isOpen: boolean;
  onClose: () => void;
  onSelectChart: (chart: any) => void;
  onProjectUpdate?: () => void;
  onProjectChange?: (updatedProject: any) => void;
}

export default function ProjectDetailModal({
  project,
  isOpen,
  onClose,
  onSelectChart,
  onProjectUpdate,
  onProjectChange,
}: ProjectDetailModalProps) {
  // 모달이 열릴 때 body에 클래스 추가하여 차트 상호작용 차단
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      // 모달 외부의 차트 컨테이너와 canvas 요소들의 z-index를 낮춤
      const modalContainer = document.querySelector('[data-modal="project-detail"]');
      
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
  const chartRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(project?.name || '');
  const [isSavingName, setIsSavingName] = useState(false);
  const [deletingChartId, setDeletingChartId] = useState<string | null>(null);
  const [expandedPrompts, setExpandedPrompts] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (project) {
      setEditedName(project.name || '');
    }
  }, [project]);

  const handleSaveName = async () => {
    if (!project || !editedName.trim() || editedName === project.name) {
      setIsEditingName(false);
      return;
    }

    setIsSavingName(true);
    try {
      await updateProjectName(project.id, editedName.trim());
      // 프로젝트 정보 즉시 업데이트
      const updatedProject = {
        ...project,
        name: editedName.trim(),
        updatedAt: new Date().toISOString(),
      };
      if (onProjectChange) {
        onProjectChange(updatedProject);
      }
      setIsEditingName(false);
      onProjectUpdate?.();
    } catch (error) {
      console.error('프로젝트 이름 저장 실패:', error);
      alert('프로젝트 이름 저장에 실패했습니다.');
      setEditedName(project.name);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedName(project?.name || '');
    setIsEditingName(false);
  };

  const handleDeleteChart = async (chartId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!project || !confirm('이 차트를 삭제하시겠습니까?')) {
      return;
    }

    setDeletingChartId(chartId);
    try {
      await deleteChart(project.id, chartId);
      // 프로젝트 정보 다시 로드
      const updatedProject = await getProject(project.id);
      if (updatedProject) {
        // 프로젝트 상태 업데이트
        if (onProjectChange) {
          onProjectChange(updatedProject);
        }
        // 프로젝트 목록도 업데이트
        if (onProjectUpdate) {
          onProjectUpdate();
        }
      }
    } catch (error) {
      console.error('차트 삭제 실패:', error);
      alert('차트 삭제에 실패했습니다.');
    } finally {
      setDeletingChartId(null);
    }
  };

  useEffect(() => {
    if (!isOpen || !project) return;

    const chartInstances: { [key: string]: echarts.ECharts } = {};

    // 모든 차트 렌더링
    project.charts?.forEach((chart: any) => {
      const chartRef = chartRefs.current[chart.id];
      if (!chartRef) return;

      const chartInstance = echarts.init(chartRef);
      chartInstance.setOption(chart.config || {}, true);
      chartInstances[chart.id] = chartInstance;
    });

    const handleResize = () => {
      Object.values(chartInstances).forEach(instance => instance.resize());
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      Object.values(chartInstances).forEach(instance => instance.dispose());
    };
  }, [isOpen, project]);

  if (!isOpen || !project) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <div data-modal="project-detail" className="fixed inset-0 z-[99999] overflow-y-auto" style={{ zIndex: 99999 }}>
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* 배경 오버레이 */}
        <div
          className="fixed inset-0 transition-opacity bg-black bg-opacity-50"
          onClick={onClose}
          style={{ zIndex: 99999 }}
        ></div>

        {/* 모달 */}
        <div 
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full relative z-[100000]"
          style={{ zIndex: 100000 }}
        >
          {/* 헤더 */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveName();
                        } else if (e.key === 'Escape') {
                          handleCancelEdit();
                        }
                      }}
                      className="flex-1 px-3 py-1.5 border border-blue-500 rounded-lg text-lg font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={isSavingName || !editedName.trim()}
                      className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      {isSavingName ? '저장 중...' : '저장'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditingName(true);
                      }}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="프로젝트 이름 수정"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  생성일: {formatDate(project.createdAt)} · 
                  수정일: {formatDate(project.updatedAt)} · 
                  차트 {project.charts?.length || 0}개
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 ml-4"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* 내용 */}
          <div className="bg-white px-6 py-4 max-h-[70vh] overflow-y-auto">
            {/* 차트 목록 */}
            {project.charts && project.charts.length > 0 ? (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-4">생성된 차트</h4>
                <div className="space-y-6">
                  {project.charts.map((chart: any) => (
                    <div
                      key={chart.id}
                      className="border border-gray-200 rounded-2xl p-6 hover:border-blue-300 transition-colors bg-white"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 mr-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex-1">
                              <p className={`text-base font-semibold text-gray-900 ${!expandedPrompts[chart.id] && chart.prompt && chart.prompt.length > 100 ? 'line-clamp-2' : ''}`}>
                                {chart.prompt || '프롬프트 없음'}
                              </p>
                              {chart.prompt && chart.prompt.length > 100 && (
                                <button
                                  onClick={() => setExpandedPrompts(prev => ({
                                    ...prev,
                                    [chart.id]: !prev[chart.id]
                                  }))}
                                  className="mt-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                                >
                                  {expandedPrompts[chart.id] ? '닫기' : '전체보기'}
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-500">
                              {formatDate(chart.createdAt)}
                            </p>
                            {chart.version && (
                              <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full font-semibold flex-shrink-0">
                                v{chart.version}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => {
                              onSelectChart(chart);
                              onClose();
                            }}
                            className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
                          >
                            불러오기
                          </button>
                          <button
                            onClick={(e) => handleDeleteChart(chart.id, e)}
                            disabled={deletingChartId === chart.id}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            title="차트 삭제"
                          >
                            {deletingChartId === chart.id ? (
                              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                      <div
                        ref={(el) => {
                          chartRefs.current[chart.id] = el;
                        }}
                        className="w-full h-80 bg-white rounded-xl border border-gray-100"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-sm">아직 생성된 차트가 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

