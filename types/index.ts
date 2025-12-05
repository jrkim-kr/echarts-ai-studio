// 타입 정의

export interface ChartConfig {
  version?: number;
  backgroundColor?: string;
  tooltip?: any;
  legend?: any;
  grid?: any;
  xAxis?: any;
  yAxis?: any;
  series?: any[];
  graphic?: any[];
  [key: string]: any;
}

export interface Chart {
  id: string;
  config: ChartConfig;
  prompt: string;
  createdAt: string;
  version?: number;
  autoSaved?: boolean;
  projectId?: string;
  projectName?: string;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  chartCount: number;
  promptCount: number;
}

export interface ProjectDetail extends Project {
  charts: Chart[];
  prompts: string[];
}

export interface ProjectData {
  name?: string;
  chart?: {
    config: ChartConfig;
    prompt: string;
    createdAt: string;
    version?: number;
    autoSaved?: boolean;
  };
  prompt?: string;
}

