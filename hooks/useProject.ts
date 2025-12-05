"use client";

import { useState, useEffect, useCallback } from "react";
import { getProject, getProjects, saveProject } from "@/lib/firebase";
import { Project, ProjectDetail, ProjectData } from "@/types";

const CURRENT_PROJECT_KEY = "echarts-ai-studio-current-project";

export function useProject() {
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState<ProjectDetail | null>(
    null
  );
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  // 저장된 프로젝트 ID 복원
  useEffect(() => {
    const savedProjectId = localStorage.getItem(CURRENT_PROJECT_KEY);
    if (savedProjectId) {
      setCurrentProjectId(savedProjectId);
      loadProjectDetail(savedProjectId);
    }
  }, []);

  // 프로젝트 목록 로드
  const loadProjects = useCallback(async () => {
    try {
      const projectsList = await getProjects();
      setProjects(projectsList || []);
    } catch (error: any) {
      console.error("프로젝트 목록 로드 실패:", error);
      setProjects([]);
    }
  }, []);

  // 프로젝트 상세 정보 로드
  const loadProjectDetail = useCallback(async (projectId: string) => {
    try {
      const project = await getProject(projectId);
      if (project) {
        // ProjectDetail 타입에 맞게 변환
        const projectDetail = {
          ...project,
          chartCount: project.charts?.length || 0,
          promptCount: project.prompts?.length || 0,
        };
        setCurrentProject(projectDetail);
      }
    } catch (error) {
      console.error("프로젝트 상세 정보 로드 실패:", error);
    }
  }, []);

  // 프로젝트 저장
  const saveCurrentProject = useCallback(
    async (data: ProjectData) => {
      try {
        const projectId = await saveProject(currentProjectId, data);

        if (!currentProjectId) {
          setCurrentProjectId(projectId);
          localStorage.setItem(CURRENT_PROJECT_KEY, projectId);
          await loadProjectDetail(projectId);
        } else {
          await loadProjectDetail(projectId);
        }

        await loadProjects();
        return projectId;
      } catch (error) {
        console.error("프로젝트 저장 실패:", error);
        throw error;
      }
    },
    [currentProjectId, loadProjects, loadProjectDetail]
  );

  // 새 프로젝트 시작
  const startNewProject = useCallback(() => {
    setCurrentProjectId(null);
    setCurrentProject(null);
    localStorage.removeItem(CURRENT_PROJECT_KEY);
  }, []);

  // 프로젝트 선택
  const selectProject = useCallback(
    async (projectId: string) => {
      setCurrentProjectId(projectId);
      localStorage.setItem(CURRENT_PROJECT_KEY, projectId);
      await loadProjectDetail(projectId);
      // 프로젝트 목록도 새로고침하여 최신 정보 반영
      await loadProjects();
    },
    [loadProjectDetail, loadProjects]
  );

  return {
    currentProjectId,
    currentProject,
    projects,
    loading,
    loadProjects,
    loadProjectDetail,
    saveCurrentProject,
    startNewProject,
    selectProject,
  };
}
