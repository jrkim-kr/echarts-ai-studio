"use client";

import { useState, useEffect, useCallback } from "react";
import { ChartConfig } from "@/types";

const STORAGE_KEY = "echarts-ai-studio-current-work";

export function useChart() {
  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string>("");

  // 현재 작업을 localStorage에 저장
  useEffect(() => {
    if (chartConfig || currentPrompt) {
      const workData = {
        chartConfig,
        prompt: currentPrompt,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workData));
    }
  }, [chartConfig, currentPrompt]);

  // 저장된 작업 복원
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const workData = JSON.parse(saved);
        const savedAt = new Date(workData.savedAt);
        const now = new Date();
        const hoursDiff =
          (now.getTime() - savedAt.getTime()) / (1000 * 60 * 60);

        if (hoursDiff < 24 && workData.chartConfig) {
          setChartConfig(workData.chartConfig);
          setCurrentPrompt(workData.prompt || "");
        }
      }
    } catch (error) {
      console.error("작업 복원 실패:", error);
    }
  }, []);

  const updateChart = useCallback((config: ChartConfig, prompt: string) => {
    setChartConfig(config);
    setCurrentPrompt(prompt);
  }, []);

  const clearChart = useCallback(() => {
    setChartConfig(null);
    setCurrentPrompt("");
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    chartConfig,
    currentPrompt,
    updateChart,
    clearChart,
    setCurrentPrompt,
  };
}
