'use client';

import { useState, useRef, useEffect } from 'react';
import * as echarts from 'echarts';
import { updateProjectName, getProject, deleteProject } from '@/lib/firebase';
import { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  onOpen: (projectId: string) => void;
  onUpdate: () => void;
  onDelete?: (projectId: string) => void;
}

export default function ProjectCard({ project, onOpen, onUpdate, onDelete }: ProjectCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(project.name);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [latestChartConfig, setLatestChartConfig] = useState<any>(null);
  const [chartImageUrl, setChartImageUrl] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hiddenChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditedName(project.name);
  }, [project.name]);

  // 최신 차트 정보 가져오기
  useEffect(() => {
    const loadLatestChart = async () => {
      if (project.chartCount > 0) {
        try {
          const projectDetail = await getProject(project.id);
          if (projectDetail?.charts && projectDetail.charts.length > 0) {
            // 최신 차트 (첫 번째 차트가 최신순으로 정렬되어 있음)
            const latestChart = projectDetail.charts[0];
            setLatestChartConfig(latestChart.config);
          }
        } catch (error) {
          console.error('최신 차트 로드 실패:', error);
        }
      }
    };
    loadLatestChart();
  }, [project.id, project.chartCount]);

  // 차트를 이미지로 변환
  useEffect(() => {
    if (!hiddenChartRef.current || !latestChartConfig) {
      setChartImageUrl(null);
      return;
    }

    let chartInstance: echarts.ECharts | null = null;

    const generateChartImage = async () => {
      try {
        // 숨겨진 div에 차트 생성
        chartInstance = echarts.init(hiddenChartRef.current!);
        chartInstance.setOption(latestChartConfig, true);

        // 차트가 렌더링될 때까지 약간의 대기
        await new Promise(resolve => setTimeout(resolve, 100));

        // PNG 이미지로 변환 (고품질)
        const imageUrl = chartInstance.getDataURL({
          type: 'png',
          pixelRatio: 2, // 고해상도
          backgroundColor: '#fff',
        });

        setChartImageUrl(imageUrl);

        // 차트 인스턴스 정리
        chartInstance.dispose();
        chartInstance = null;
      } catch (error) {
        console.error('차트 이미지 생성 실패:', error);
        setChartImageUrl(null);
        if (chartInstance) {
          try {
            chartInstance.dispose();
          } catch (e) {
            // 무시
          }
        }
      }
    };

    generateChartImage();

    return () => {
      if (chartInstance) {
        try {
          chartInstance.dispose();
        } catch (e) {
          // 무시
        }
      }
    };
  }, [latestChartConfig]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingName]);

  const handleSaveName = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!editedName.trim() || editedName === project.name) {
      setIsEditingName(false);
      return;
    }

    setIsSavingName(true);
    try {
      await updateProjectName(project.id, editedName.trim());
      setIsEditingName(false);
      setIsMenuOpen(false);
      // 프로젝트 목록 즉시 업데이트
      onUpdate();
    } catch (error) {
      console.error('프로젝트 이름 저장 실패:', error);
      alert('프로젝트 이름 저장에 실패했습니다.');
      setEditedName(project.name);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedName(project.name);
    setIsEditingName(false);
    setIsMenuOpen(false);
  };

  const handleDeleteProject = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm(`"${project.name}" 프로젝트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    setIsDeleting(true);
    setIsMenuOpen(false);
    
    try {
      await deleteProject(project.id);
      // 삭제 콜백 호출 (현재 프로젝트인지 확인하여 차트/프롬프트 초기화)
      if (onDelete) {
        onDelete(project.id);
      }
      // 프로젝트 목록 즉시 업데이트
      onUpdate();
    } catch (error) {
      console.error('프로젝트 삭제 실패:', error);
      alert('프로젝트 삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 transition-all hover:shadow-md hover:border-gray-300 relative">
      {/* 프로젝트 카드 내용 */}
      <div onClick={() => onOpen(project.id)} className="cursor-pointer">
        <div className="w-full h-32 bg-blue-50 rounded-xl mb-4 flex items-center justify-center overflow-hidden relative">
          {chartImageUrl ? (
            <img
              src={chartImageUrl}
              alt={`${project.name} 차트`}
              className="w-full h-full object-contain"
            />
          ) : latestChartConfig ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <svg
              className="w-10 h-10 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          )}
          {/* 숨겨진 차트 렌더링 영역 */}
          <div
            ref={hiddenChartRef}
            className="absolute opacity-0 pointer-events-none"
            style={{ width: '400px', height: '300px' }}
          />
        </div>
        
        <div className="flex items-center justify-between mb-2">
          {isEditingName ? (
            <form onSubmit={handleSaveName} className="flex-1">
              <input
                ref={inputRef}
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    handleCancelEdit();
                  }
                }}
                className="w-full px-2 py-1 border border-blue-500 rounded-lg text-base font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </form>
          ) : (
            <>
              <h3 className="text-base font-semibold text-gray-900 flex-1">
                {project.name}
              </h3>
              {/* 점점점 메뉴 */}
              <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(!isMenuOpen);
                  }}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>

                {isMenuOpen && (
                  <div className="absolute top-full right-0 mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditingName(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      이름 변경
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleDeleteProject}
                      disabled={isDeleting}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeleting ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          삭제 중...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          프로젝트 삭제
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        
        <p className="text-sm text-gray-500">
          {project.chartCount}개 차트 •{" "}
          {new Date(project.updatedAt).toLocaleDateString("ko-KR", {
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}

