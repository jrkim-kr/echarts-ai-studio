"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { generateChart } from "@/lib/llm";
import { getProject } from "@/lib/firebase";
import { ChartConfig } from "@/types";

type InputMode = "prompt" | "json";

interface PromptInputProps {
  onChartGenerated: (config: ChartConfig, prompt: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  initialPrompt?: string;
  currentProjectId?: string | null;
  currentProjectName?: string | null;
  currentChartConfig?: ChartConfig | null;
  onSelectPrompt?: (prompt: string) => void;
}

export default function PromptInput({
  onChartGenerated,
  loading,
  setLoading,
  initialPrompt = "",
  currentProjectId,
  currentProjectName,
  currentChartConfig,
  onSelectPrompt,
}: PromptInputProps) {
  const [mode, setMode] = useState<InputMode>("prompt");
  const [prompt, setPrompt] = useState(initialPrompt);
  const [requirement, setRequirement] = useState(""); // 요구사항
  const [data, setData] = useState(""); // 데이터
  const [jsonCode, setJsonCode] = useState(""); // JSON 코드
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);

  useEffect(() => {
    setPrompt(initialPrompt || "");

    // 프롬프트가 비어있고 차트 설정이 있으면 JSON 모드로 전환
    if (!initialPrompt && currentChartConfig) {
      setMode("json");
      // JSON 코드를 차트 설정에서 불러오기
      try {
        const jsonString = JSON.stringify(currentChartConfig, null, 2);
        setJsonCode(jsonString);
      } catch (error) {
        console.error("JSON 직렬화 실패:", error);
      }
      return;
    }

    // initialPrompt가 변경될 때마다 요구사항과 데이터를 파싱하여 설정
    if (initialPrompt) {
      // 프롬프트 모드로 전환
      setMode("prompt");

      // "요구사항:\n"과 "데이터:\n" 패턴으로 분리 시도
      const requirementSeparator = "요구사항:\n";
      const dataSeparator = "\n\n데이터:\n";

      let reqPart = "";
      let dataPart = "";

      // "요구사항:\n...\n\n데이터:\n..." 형식인지 확인
      const requirementIndex = initialPrompt.indexOf(requirementSeparator);
      const dataIndex = initialPrompt.indexOf(dataSeparator);

      if (requirementIndex !== -1 && dataIndex !== -1) {
        // "요구사항:\n" 패턴이 있는 경우
        reqPart = initialPrompt
          .substring(requirementIndex + requirementSeparator.length, dataIndex)
          .trim();
        dataPart = initialPrompt
          .substring(dataIndex + dataSeparator.length)
          .trim();
      } else if (dataIndex !== -1) {
        // "데이터:\n" 패턴만 있는 경우
        reqPart = initialPrompt.substring(0, dataIndex).trim();
        dataPart = initialPrompt
          .substring(dataIndex + dataSeparator.length)
          .trim();
      } else {
        // 분리 패턴이 없으면 전체를 요구사항으로 설정
        reqPart = initialPrompt.trim();
        dataPart = "";
      }

      setRequirement(reqPart);
      setData(dataPart);
    } else {
      // 프롬프트가 없으면 초기화
      setRequirement("");
      setData("");
    }
  }, [initialPrompt, currentChartConfig]);

  useEffect(() => {
    // 현재 프로젝트의 프롬프트 히스토리 로드
    const loadPromptHistory = async () => {
      if (currentProjectId) {
        try {
          const project = await getProject(currentProjectId);
          setPromptHistory(project?.prompts || []);
        } catch (error) {
          console.error("프롬프트 히스토리 로드 실패:", error);
        }
      } else {
        // 새 프로젝트 생성 시 모든 입력 초기화
        setPromptHistory([]);
        setJsonCode("");
        setJsonError(null);
        setRequirement("");
        setData("");
        setMode("prompt");
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    loadPromptHistory();
  }, [currentProjectId]);

  // 차트 설정이 변경될 때 JSON 모드면 JSON 코드 업데이트
  // 단, 프롬프트로 생성된 차트(initialPrompt가 있는 경우)는 제외
  useEffect(() => {
    if (mode === "json" && currentChartConfig && !initialPrompt) {
      // 프롬프트가 없는 경우에만 JSON 코드 자동 표시 (JSON 모드로 생성된 차트)
      try {
        const jsonString = JSON.stringify(currentChartConfig, null, 2);
        setJsonCode(jsonString);
      } catch (error) {
        console.error("JSON 직렬화 실패:", error);
      }
    } else if (mode === "json" && initialPrompt) {
      // 프롬프트가 있는 경우 JSON 모드로 전환해도 JSON 코드를 표시하지 않음
      setJsonCode("");
    }
  }, [currentChartConfig, mode, initialPrompt]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleJsonApply = () => {
    if (!jsonCode.trim()) {
      setJsonError("JSON 코드를 입력해주세요.");
      return;
    }

    try {
      // 입력값 정리
      let cleanedCode = jsonCode.trim();

      // JavaScript 객체 리터럴 형식 처리
      cleanedCode = cleanedCode.replace(
        /new\s+echarts\.graphic\.LinearGradient\(([^)]*)\)/g,
        "null"
      );
      cleanedCode = cleanedCode.replace(
        /([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g,
        '$1"$2":'
      );
      cleanedCode = cleanedCode.replace(/;\s*$/, "");

      let parsed;
      try {
        parsed = JSON.parse(cleanedCode);
      } catch (parseError: any) {
        // JavaScript 객체 리터럴로 시도
        try {
          const mockEcharts = {
            graphic: {
              LinearGradient: function (
                x0: number,
                y0: number,
                x1: number,
                y1: number,
                colorStops: any[]
              ) {
                return {
                  type: "linear",
                  x: x0,
                  y: y0,
                  x2: x1,
                  y2: y1,
                  colorStops: colorStops,
                };
              },
            },
          };
          const originalCode = jsonCode.trim().replace(/;\s*$/, "");
          const func = new Function("echarts", "return " + originalCode);
          parsed = func(mockEcharts);
          parsed = JSON.parse(
            JSON.stringify(parsed, (key, value) => {
              if (typeof value === "function" || value === undefined) {
                return null;
              }
              return value;
            })
          );
        } catch (jsError: any) {
          throw new Error(
            parseError.message || "JSON 파싱 오류가 발생했습니다."
          );
        }
      }

      if (typeof parsed !== "object" || parsed === null) {
        throw new Error("유효한 JSON 객체가 아닙니다.");
      }

      if (!parsed.series && !parsed.xAxis && !parsed.yAxis) {
        throw new Error("유효한 ECharts 옵션 형식이 아닙니다.");
      }

      // JSON 모드로 생성된 차트는 빈 프롬프트로 저장
      const prompt = "";
      setJsonError(null);
      onChartGenerated(parsed, prompt);
    } catch (err: any) {
      console.error("JSON 적용 실패:", err);
      setJsonError(err.message || "JSON 파싱 오류가 발생했습니다.");
    }
  };

  const handleSubmit = async () => {
    // 요구사항과 데이터를 명확하게 구분하여 프롬프트 생성
    let combinedPrompt = "";

    if (requirement.trim() && data.trim()) {
      // 요구사항과 데이터가 모두 있는 경우
      combinedPrompt = `요구사항:\n${requirement.trim()}\n\n데이터:\n${data.trim()}`;
    } else if (requirement.trim()) {
      // 요구사항만 있는 경우
      combinedPrompt = requirement.trim();
    } else if (data.trim()) {
      // 데이터만 있는 경우
      combinedPrompt = `데이터:\n${data.trim()}`;
    }

    if (!combinedPrompt.trim() && !imageFile) {
      alert("요구사항 또는 데이터를 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      // 현재 프로젝트에 차트가 있고, 프롬프트가 개선 요청인 경우 이전 차트를 기반으로 생성
      const isImprovementRequest =
        currentChartConfig &&
        (requirement.includes("추가") ||
          requirement.includes("개선") ||
          requirement.includes("수정") ||
          requirement.includes("변경") ||
          requirement.includes("버튼") ||
          requirement.includes("기능"));

      const config = await generateChart(
        combinedPrompt,
        imageFile,
        isImprovementRequest ? currentChartConfig : null
      );

      // 차트 설정이 제대로 생성되었는지 확인
      if (!config || !config.series) {
        throw new Error(
          "차트 생성에 실패했습니다. 프롬프트와 데이터를 확인해주세요."
        );
      }

      onChartGenerated(config, combinedPrompt);
      // 이미지만 초기화 (프롬프트는 유지)
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.error("차트 생성 실패:", error);
      const errorMessage = error?.message || "차트 생성에 실패했습니다.";

      // OpenAI API 오류 메시지 개선
      if (
        errorMessage.includes("quota") ||
        errorMessage.includes("billing") ||
        errorMessage.includes("budget")
      ) {
        alert(
          "⚠️ OpenAI API 예산/쿼터 초과\n\n" +
            "현재 폴백 로직으로 차트를 생성하고 있습니다.\n\n" +
            "AI 기능을 사용하려면 예산을 설정해주세요:\n" +
            "1. https://platform.openai.com/account/billing 접속\n" +
            "2. 'Usage limits' 또는 'Spending limits' 메뉴에서 예산 설정\n" +
            "3. Hard limit을 $5 이상으로 설정 (또는 원하는 금액)\n\n" +
            "예산 설정 전까지는 기본 차트 생성 로직을 사용합니다."
        );
      } else if (
        errorMessage.includes("OPENAI_API_KEY") ||
        errorMessage.includes("API 키")
      ) {
        alert(
          "⚠️ OpenAI API 키 오류\n\n" +
            "설정 메뉴에서 OpenAI API 키를 입력해주세요.\n" +
            "상단 헤더의 설정 버튼을 클릭하여 API 키를 설정할 수 있습니다."
        );
      } else {
        alert(`차트 생성 실패: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-full flex flex-col">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
        id="image-upload"
      />

      {/* 모드 선택 탭 */}
      <div className="flex items-center gap-1 mb-3 border-b border-gray-200">
        <button
          onClick={() => setMode("prompt")}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            mode === "prompt"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          프롬프트 모드
        </button>
        <button
          onClick={() => setMode("json")}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            mode === "json"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          JSON 모드
        </button>
      </div>

      {mode === "prompt" ? (
        <div className="space-y-2 flex-1 flex flex-col">
          {/* 요구사항 입력란 */}
          <div className="flex-1 flex flex-col">
            <label className="block text-xs font-medium text-gray-500 mb-0.5">
              요구사항
            </label>
            <textarea
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              placeholder="차트 유형과 요구사항을 입력하세요"
              className="w-full flex-1 px-3 py-2 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 resize-none overflow-y-auto text-sm leading-relaxed transition-all"
              style={{
                scrollbarGutter: "stable",
              }}
            />
          </div>

          {/* 데이터 입력란 */}
          <div className="flex-1 flex flex-col">
            <label className="block text-xs font-medium text-gray-500 mb-0.5">
              데이터
            </label>
            <textarea
              value={data}
              onChange={(e) => setData(e.target.value)}
              placeholder="데이터를 입력하세요 (예: 스타벅스: 100, 네스프레소: 200)"
              className="w-full flex-1 px-3 py-2 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 resize-none overflow-y-auto text-sm leading-relaxed transition-all"
              style={{
                scrollbarGutter: "stable",
              }}
            />
          </div>

          {/* 하단 액션 버튼 */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              title="이미지 업로드"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </button>

            <button
              onClick={handleSubmit}
              disabled={
                loading || (!requirement.trim() && !data.trim() && !imageFile)
              }
              className="flex items-center justify-center w-8 h-8 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-sm hover:shadow-md disabled:shadow-none"
            >
              {loading ? (
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 19V5M5 12l7-7 7 7"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2 flex-1 flex flex-col">
          <div className="flex-1 flex flex-col">
            <label className="block text-xs font-medium text-gray-500 mb-0.5">
              ECharts JSON 코드
            </label>
            <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-xs text-blue-800">
                  JavaScript 객체 리터럴 형식도 지원합니다. 함수 호출(new
                  echarts.graphic.LinearGradient 등)은 자동으로 처리됩니다.
                </p>
              </div>
            </div>
            <textarea
              value={jsonCode}
              onChange={(e) => {
                setJsonCode(e.target.value);
                setJsonError(null);
              }}
              placeholder={`예시:
{
  "xAxis": {
    "type": "category",
    "data": ["Mon", "Tue", "Wed"]
  },
  "yAxis": {
    "type": "value"
  },
  "series": [{
    "type": "bar",
    "data": [120, 200, 150]
  }]
}`}
              className="w-full flex-1 px-3 py-2 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 resize-none overflow-y-auto text-sm leading-relaxed transition-all font-mono"
              style={{
                scrollbarGutter: "stable",
              }}
            />
            {jsonError && (
              <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p>{jsonError}</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={handleJsonApply}
              disabled={loading || !jsonCode.trim()}
              className="flex items-center justify-center w-8 h-8 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-sm hover:shadow-md disabled:shadow-none"
            >
              {loading ? (
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 19V5M5 12l7-7 7 7"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}

      {imagePreview && (
        <div className="mt-3 flex items-center gap-3">
          <div className="relative group">
            <Image
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-xl border border-gray-200 shadow-sm"
              width={80}
              height={80}
              unoptimized
            />
            <button
              onClick={() => {
                setImageFile(null);
                setImagePreview(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors opacity-0 group-hover:opacity-100"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          {imageFile && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {imageFile.name}
              </p>
              <p className="text-xs text-gray-500">이미지가 업로드되었습니다</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
