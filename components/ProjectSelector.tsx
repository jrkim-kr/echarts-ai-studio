'use client';

import { useState, useRef, useEffect } from 'react';
import { Project } from '@/types';

interface ProjectSelectorProps {
  projects: Project[];
  currentProjectId: string | null;
  currentProjectName: string | null;
  currentChartVersion?: number | null;
  onSelectProject: (projectId: string, chartId?: string) => void;
  onNewProject: () => void;
  onOpenProject?: (projectId: string) => void;
}

export default function ProjectSelector({
  projects,
  currentProjectId,
  currentProjectName,
  currentChartVersion,
  onSelectProject,
  onNewProject,
  onOpenProject,
}: ProjectSelectorProps) {
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="max-w-[200px] truncate">
          {currentProjectName || '프로젝트 선택'}
          {currentChartVersion && (
            <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-semibold">
              v{currentChartVersion}
            </span>
          )}
        </span>
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
        <div className="absolute top-full mt-2 left-0 w-72 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            <button
              onClick={() => {
                onNewProject();
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left text-gray-900 hover:bg-blue-50 rounded-xl transition-colors flex items-center gap-3 text-sm font-medium"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              새 프로젝트 생성
            </button>
            
            {projects.length > 0 && (
              <>
                <div className="border-t border-gray-100 my-2"></div>
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  기존 프로젝트
                </div>
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className={`w-full rounded-xl transition-colors ${
                      currentProjectId === project.id
                        ? 'bg-blue-50 text-blue-900'
                        : 'text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          // 프로젝트만 선택 (최신 차트 불러오기)
                          onSelectProject(project.id);
                          setIsOpen(false);
                        }}
                        className="flex-1 px-4 py-3 text-left flex items-center justify-between"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{project.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {project.chartCount}개 차트 • {new Date(project.updatedAt).toLocaleDateString('ko-KR', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                        </div>
                        {currentProjectId === project.id && (
                          <svg className="w-5 h-5 flex-shrink-0 ml-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          // 프로젝트 상세 모달 열기 (버전 선택 가능)
                          setIsOpen(false);
                          if (onOpenProject) {
                            onOpenProject(project.id);
                          }
                        }}
                        className="px-3 py-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="버전 선택"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

