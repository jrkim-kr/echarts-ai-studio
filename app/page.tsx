"use client";

import { useState, useEffect } from "react";
import PromptInput from "@/components/PromptInput";
import ChartDisplay from "@/components/ChartDisplay";
import ProjectDetailModal from "@/components/ProjectDetailModal";
import LoadingSpinner from "@/components/LoadingSpinner";
import Toast from "@/components/Toast";
import ProjectSelector from "@/components/ProjectSelector";
import ProjectCard from "@/components/ProjectCard";
import PromptExamplesButton from "@/components/PromptExamplesButton";
import { initializeFirebase } from "@/lib/firebase";
import { useProject } from "@/hooks/useProject";
import { useChart } from "@/hooks/useChart";
import { ChartConfig } from "@/types";

export default function Home() {
  // 커스텀 훅 사용
  const {
    currentProjectId,
    currentProject,
    projects,
    loadProjects,
    saveCurrentProject,
    startNewProject,
    selectProject,
  } = useProject();

  const {
    chartConfig,
    currentPrompt,
    updateChart,
    clearChart,
    setCurrentPrompt,
  } = useChart();

  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Firebase 초기화
  useEffect(() => {
    const initialize = async () => {
      try {
        initializeFirebase();
        setFirebaseInitialized(true);
        await loadProjects();
      } catch (error) {
        console.error("Firebase 초기화 실패:", error);
        setFirebaseInitialized(false);
      }
    };
    initialize();
  }, [loadProjects]);

  const handleOpenProject = async (projectId: string) => {
    try {
      const { getProject } = await import("@/lib/firebase");
      const project = await getProject(projectId);
      if (project) {
        // 상단 프로젝트 선택기도 업데이트
        selectProject(projectId);
        setSelectedProject(project);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("프로젝트 로드 실패:", error);
      alert("프로젝트를 불러오는데 실패했습니다.");
    }
  };

  const handleChartGenerated = async (config: ChartConfig, prompt: string) => {
    // 차트 설정 유효성 검사
    if (!config || !config.series || (Array.isArray(config.series) && config.series.length === 0)) {
      console.error('차트 생성 실패: 유효하지 않은 차트 설정', config);
      setToast({
        message: '차트 생성에 실패했습니다. 프롬프트와 데이터를 확인해주세요.',
        type: 'error',
      });
      return;
    }

    updateChart(config, prompt);

    // 자동으로 현재 프로젝트에 저장
    // JSON 모드로 생성된 차트는 프롬프트가 빈 문자열일 수 있으므로, 차트 설정이 있으면 저장
    if (firebaseInitialized && config) {
      try {
        // 현재 프로젝트의 최신 차트 버전 확인
        let version = 1;
        if (
          currentProject &&
          currentProject.charts &&
          currentProject.charts.length > 0
        ) {
          const latestChart = currentProject.charts[0];
          version = (latestChart.version || currentProject.charts.length) + 1;
        }

        await saveCurrentProject({
          chart: {
            config: {
              ...config,
              version: version,
            },
            prompt: prompt || '', // JSON 모드일 경우 빈 문자열도 허용
            createdAt: new Date().toISOString(),
            autoSaved: true,
            version: version,
          },
          prompt: prompt || '', // 프롬프트가 없어도 저장 (JSON 모드 지원)
        });
      } catch (error: any) {
        console.error("자동 저장 실패:", error);
        handleFirebaseError(error);
      }
    }
  };

  const handleFirebaseError = (error: any) => {
    if (
      error?.code === "PERMISSION_DENIED" ||
      error?.message?.includes("Permission denied")
    ) {
      const hasShownWarning = sessionStorage.getItem(
        "firebase-permission-warning"
      );
      if (!hasShownWarning) {
        alert(
          "Firebase 보안 규칙이 설정되지 않아 자동 저장이 실패했습니다.\n\n" +
            "Firebase Console에서 보안 규칙을 업데이트해주세요:\n" +
            "1. Firebase Console → Realtime Database → 규칙\n" +
            "2. FIREBASE_RULES.md 파일의 규칙을 복사하여 붙여넣기\n" +
            "3. 게시 버튼 클릭\n\n" +
            "자세한 내용은 FIREBASE_RULES.md 파일을 참고하세요."
        );
        sessionStorage.setItem("firebase-permission-warning", "true");
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 상단 헤더 */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">ECharts AI Studio</h1>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <div className="max-w-7xl mx-auto px-6 pt-6 pb-16">
        {/* 상단 헤더 */}
        <div className="mb-4">
          <div className="flex items-center justify-between gap-3">
            <ProjectSelector
              projects={projects}
              currentProjectId={currentProjectId}
              currentProjectName={currentProject?.name || null}
              currentChartVersion={chartConfig?.version || null}
              onSelectProject={async (projectId: string, chartId?: string) => {
                await selectProject(projectId);
                // 프로젝트 선택 후 최신 차트 정보 가져오기
                const { getProject } = await import("@/lib/firebase");
                const project = await getProject(projectId);
                if (project && project.charts && project.charts.length > 0) {
                  // 특정 차트 ID가 있으면 해당 차트, 없으면 최신 차트
                  const targetChart = chartId 
                    ? project.charts.find((c: any) => c.id === chartId)
                    : project.charts[0];
                  
                  if (targetChart) {
                    updateChart(targetChart.config, targetChart.prompt || "");
                    setCurrentPrompt(targetChart.prompt || "");
                  }
                }
              }}
              onNewProject={() => {
                startNewProject();
                clearChart();
                setCurrentPrompt("");
              }}
              onOpenProject={handleOpenProject}
            />
            <PromptExamplesButton />
          </div>
        </div>

        {/* 좌우 분할 레이아웃 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 왼쪽: 프롬프트 입력 영역 */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <div className="mb-3">
                <h2 className="text-lg font-bold text-gray-900">프롬프트</h2>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4" style={{ height: '70vh' }}>
                <PromptInput
                  onChartGenerated={handleChartGenerated}
                  loading={loading}
                  setLoading={setLoading}
                  initialPrompt={currentPrompt}
                  currentProjectId={currentProjectId}
                  currentProjectName={currentProject?.name || null}
                  currentChartConfig={chartConfig}
                  onSelectPrompt={setCurrentPrompt}
                />
              </div>
            </div>
          </div>

          {/* 오른쪽: 차트 표시 영역 */}
          <div className="lg:col-span-2">
            <div className="mb-3">
              <h2 className="text-lg font-bold text-gray-900">차트</h2>
            </div>
            {chartConfig ? (
              <div 
                className="bg-white rounded-xl border border-gray-200 p-4" 
                style={{ 
                  height: '70vh',
                  position: 'relative',
                  zIndex: 1,
                }}
                data-chart-wrapper
              >
                <ChartDisplay
                  config={chartConfig}
                  onSaveImage={(imageDataUrl: string) => {
                    const link = document.createElement("a");
                    link.download = `chart-${new Date().getTime()}.png`;
                    link.href = imageDataUrl;
                    link.click();
                    setToast({
                      message: "차트 이미지가 다운로드되었습니다!",
                      type: "success",
                    });
                  }}
                />
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-4" style={{ height: '70vh' }}>
                <div className="text-center h-full flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-blue-400"
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
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    차트를 생성해보세요
                  </h3>
                  <p className="text-gray-500 text-xs">
                    왼쪽 입력창에 데이터나 요구사항을 입력하면 차트가 생성됩니다.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 프로젝트 목록 영역 */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">프로젝트</h2>
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onOpen={handleOpenProject}
                  onUpdate={loadProjects}
                  onDelete={(deletedProjectId) => {
                    // 삭제된 프로젝트가 현재 프로젝트인 경우 차트와 프롬프트 초기화
                    if (currentProjectId === deletedProjectId) {
                      clearChart();
                      setCurrentPrompt("");
                      startNewProject();
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200">
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-500 text-sm mb-4">아직 생성된 프로젝트가 없습니다.</p>
              <button
                onClick={() => {
                  startNewProject();
                  clearChart();
                  setCurrentPrompt("");
                }}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md flex items-center gap-2 mx-auto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                새 프로젝트 생성
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 프로젝트 상세 모달 */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProject(null);
          }}
          onSelectChart={(chart) => {
            // 차트와 함께 프롬프트도 업데이트
            updateChart(chart.config, chart.prompt || "");
            setCurrentPrompt(chart.prompt || "");
            if (chart.projectId) {
              selectProject(chart.projectId);
            }
          }}
          onProjectUpdate={async () => {
            await loadProjects();
            // 현재 프로젝트가 업데이트된 경우 다시 로드
            if (currentProjectId === selectedProject.id) {
              await selectProject(selectedProject.id);
            }
          }}
          onProjectChange={(updatedProject) => {
            setSelectedProject(updatedProject);
          }}
        />
      )}

      {/* Toast 알림 */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={!!toast}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
