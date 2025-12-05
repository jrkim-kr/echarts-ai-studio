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
import SettingsModal from "@/components/SettingsModal";
import { initializeFirebase } from "@/lib/firebase";
import { isSettingsComplete } from "@/lib/storage";
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsComplete, setSettingsComplete] = useState(false);

  // 설정 완료 여부 확인
  useEffect(() => {
    const checkSettings = () => {
      const complete = isSettingsComplete();
      setSettingsComplete(complete);
      // 처음 방문 시에만 설정 모달 자동으로 열기 (한 번만)
      if (!complete && !sessionStorage.getItem("settings-modal-shown")) {
        setIsSettingsOpen(true);
        sessionStorage.setItem("settings-modal-shown", "true");
      }
    };

    checkSettings();

    // storage 이벤트 리스너 추가 (다른 탭에서 설정 변경 시 감지)
    const handleStorageChange = () => {
      checkSettings();
    };
    window.addEventListener("storage", handleStorageChange);

    // 주기적으로 확인 (같은 탭에서 설정 변경 시 감지)
    const interval = setInterval(checkSettings, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Firebase 초기화
  useEffect(() => {
    if (!settingsComplete) return; // 설정이 완료되지 않으면 초기화하지 않음

    const initialize = async () => {
      try {
        initializeFirebase();
        setFirebaseInitialized(true);
        await loadProjects();
      } catch (error: any) {
        console.error("Firebase 초기화 실패:", error);
        setFirebaseInitialized(false);
        setToast({
          message: "Firebase 설정을 확인해주세요.",
          type: "error",
        });
      }
    };
    initialize();
  }, [loadProjects, settingsComplete]);

  const handleOpenProject = async (projectId: string) => {
    if (!settingsComplete) {
      setToast({
        message:
          "프로젝트를 보려면 Firebase 설정이 필요합니다. 설정 메뉴를 열어주세요.",
        type: "info",
      });
      setIsSettingsOpen(true);
      return;
    }

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
    if (
      !config ||
      !config.series ||
      (Array.isArray(config.series) && config.series.length === 0)
    ) {
      console.error("차트 생성 실패: 유효하지 않은 차트 설정", config);
      setToast({
        message: "차트 생성에 실패했습니다. 프롬프트와 데이터를 확인해주세요.",
        type: "error",
      });
      return;
    }

    updateChart(config, prompt);

    // 자동으로 현재 프로젝트에 저장
    // JSON 모드로 생성된 차트는 프롬프트가 빈 문자열일 수 있으므로, 차트 설정이 있으면 저장
    if (settingsComplete && firebaseInitialized && config) {
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
            prompt: prompt || "", // JSON 모드일 경우 빈 문자열도 허용
            createdAt: new Date().toISOString(),
            autoSaved: true,
            version: version,
          },
          prompt: prompt || "", // 프롬프트가 없어도 저장 (JSON 모드 지원)
        });
      } catch (error: any) {
        console.error("자동 저장 실패:", error);
        handleFirebaseError(error);
      }
    } else if (!settingsComplete && config) {
      // 설정이 없으면 저장 불가 안내
      setToast({
        message: "차트는 생성되었지만 저장하려면 Firebase 설정이 필요합니다.",
        type: "info",
      });
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
    <div className="min-h-screen bg-white relative">
      {/* 메인 콘텐츠 */}
      <div>
        {/* 상단 헤더 */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <button
              onClick={() => {
                startNewProject();
                clearChart();
                setCurrentPrompt("");
              }}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
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
              <h1 className="text-xl font-bold text-gray-900">
                ECharts AI Studio
              </h1>
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="설정"
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
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
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
                onSelectProject={async (
                  projectId: string,
                  chartId?: string
                ) => {
                  if (!settingsComplete) {
                    setToast({
                      message:
                        "프로젝트를 불러오려면 Firebase 설정이 필요합니다. 설정 메뉴를 열어주세요.",
                      type: "info",
                    });
                    setIsSettingsOpen(true);
                    return;
                  }

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
                <div
                  className="bg-white rounded-xl border border-gray-200 p-4"
                  style={{ height: "70vh" }}
                >
                  <PromptInput
                    key={currentProjectId || "new-project"}
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
                    height: "70vh",
                    position: "relative",
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
                <div
                  className="bg-white rounded-xl border border-gray-200 p-4"
                  style={{ height: "70vh" }}
                >
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
                      왼쪽 입력창에 데이터나 요구사항을 입력하면 차트가
                      생성됩니다.
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
                <p className="text-gray-500 text-sm mb-4">
                  아직 생성된 프로젝트가 없습니다.
                </p>
                <button
                  onClick={() => {
                    startNewProject();
                    clearChart();
                    setCurrentPrompt("");
                  }}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md flex items-center gap-2 mx-auto"
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
                      d="M12 4v16m8-8H4"
                    />
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

      {/* 설정 모달 */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
        }}
        onSettingsChanged={async () => {
          // 설정 변경 시 Firebase 재초기화
          const complete = isSettingsComplete();
          setSettingsComplete(complete);

          if (complete) {
            try {
              initializeFirebase();
              setFirebaseInitialized(true);
              await loadProjects();
              setToast({
                message: "설정이 저장되었습니다.",
                type: "success",
              });
              // 설정이 완료되면 모달 닫기
              setIsSettingsOpen(false);
            } catch (error) {
              console.error("Firebase 재초기화 실패:", error);
              setFirebaseInitialized(false);
              setToast({
                message: "Firebase 설정을 확인해주세요.",
                type: "error",
              });
            }
          } else {
            setToast({
              message: "Firebase 필수 설정을 모두 입력해주세요.",
              type: "error",
            });
          }
        }}
      />
    </div>
  );
}
