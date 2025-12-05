'use client';

interface ProjectBadgeProps {
  projectName: string | null;
  hasChart: boolean;
  onNewProject: () => void;
}

export default function ProjectBadge({ projectName, hasChart, onNewProject }: ProjectBadgeProps) {
  if (!projectName) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">{projectName}</span>
              {hasChart && (
                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                  차트 있음
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-0.5">
              {hasChart ? '기존 차트를 기반으로 개선할 수 있습니다' : '새로운 차트를 생성하세요'}
            </p>
          </div>
        </div>
        <button
          onClick={onNewProject}
          className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors"
        >
          새 프로젝트
        </button>
      </div>
    </div>
  );
}

