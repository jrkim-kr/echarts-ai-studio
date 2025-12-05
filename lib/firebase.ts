import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getDatabase,
  ref,
  push,
  get,
  set,
  update,
  remove,
  query,
  orderByKey,
  limitToLast,
  orderByChild,
  Database,
} from "firebase/database";
import { getFirebaseConfig } from "./storage";

let app: FirebaseApp | null = null;
let db: Database | null = null;

export function initializeFirebase() {
  if (app) return app;

  // 로컬 스토리지에서 Firebase 설정 가져오기
  const firebaseConfig = typeof window !== 'undefined' ? getFirebaseConfig() : null;

  // 필수 설정 확인
  if (!firebaseConfig || !firebaseConfig.apiKey || !firebaseConfig.databaseURL) {
    console.warn("Firebase 설정이 설정되지 않았습니다.");
    throw new Error(
      "Firebase 설정이 완료되지 않았습니다. 설정 메뉴에서 Firebase 설정을 입력해주세요."
    );
  }

  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
      db = getDatabase(app);
    } else {
      app = getApps()[0];
      db = getDatabase(app);
    }
    console.log("Firebase 초기화 성공");
    return app;
  } catch (error) {
    console.error("Firebase 초기화 오류:", error);
    throw error;
  }
}

// 함수를 제거하고 직렬화 가능한 데이터만 반환하는 헬퍼 함수
function sanitizeForFirebase(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  
  if (typeof obj === 'function') {
    return null; // 함수는 제거
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForFirebase(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = sanitizeForFirebase(obj[key]);
        // null 값은 제외하지 않음 (명시적으로 null로 저장)
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
  
  return obj;
}

// 프로젝트 생성 또는 업데이트
export async function saveProject(projectId: string | null, projectData: {
  name?: string;
  chart?: any;
  prompt?: string;
}) {
  if (!db) {
    initializeFirebase();
    db = getDatabase();
  }

  try {
    const now = new Date().toISOString();
    let finalProjectId = projectId;

    if (!finalProjectId) {
      // 새 프로젝트 생성
      const projectsRef = ref(db, "projects");
      const newProjectRef = push(projectsRef);
      finalProjectId = newProjectRef.key!;
      
      await set(newProjectRef, {
        name: projectData.name || `프로젝트 ${new Date().toLocaleDateString('ko-KR')}`,
        createdAt: now,
        updatedAt: now,
        charts: {},
        prompts: [],
      });
    }

    const projectRef = ref(db, `projects/${finalProjectId}`);
    const projectSnapshot = await get(projectRef);
    const currentProject = projectSnapshot.exists() ? projectSnapshot.val() : {
      name: projectData.name || `프로젝트 ${new Date().toLocaleDateString('ko-KR')}`,
      createdAt: now,
      charts: {},
      prompts: [],
    };

    const updates: any = {
      updatedAt: now,
    };

    // 차트 추가
    if (projectData.chart) {
      const sanitizedChart = sanitizeForFirebase(projectData.chart);
      const chartId = push(ref(db, `projects/${finalProjectId}/charts`)).key!;
      
      // 버전 정보 추가 (이전 차트가 있으면 버전 증가)
      const existingCharts = currentProject.charts || {};
      const chartCount = Object.keys(existingCharts).length;
      const version = sanitizedChart.version || (chartCount + 1);
      
      updates[`charts/${chartId}`] = {
        ...sanitizedChart,
        version: version,
        createdAt: now,
      };
    }

    // 프롬프트 추가 (중복 제거)
    // JSON 모드로 생성된 차트는 프롬프트가 빈 문자열일 수 있으므로, 빈 문자열이 아닌 경우만 추가
    if (projectData.prompt && projectData.prompt.trim()) {
      const prompts = currentProject.prompts || [];
      const newPrompts = [projectData.prompt, ...prompts.filter((p: string) => p !== projectData.prompt)];
      updates.prompts = newPrompts.slice(0, 20); // 최대 20개만 유지
    }

    // 프로젝트 이름 업데이트
    if (projectData.name) {
      updates.name = projectData.name;
    }

    await update(projectRef, updates);
    return finalProjectId;
  } catch (error: any) {
    console.error('프로젝트 저장 오류:', error);
    
    // Permission denied 오류를 다시 throw하여 상위에서 처리할 수 있도록 함
    if (error?.code === 'PERMISSION_DENIED' || error?.message?.includes('Permission denied')) {
      throw error;
    }
    
    // 다른 오류도 throw
    throw error;
  }
}

// 프로젝트 이름 업데이트
export async function updateProjectName(projectId: string, newName: string) {
  if (!db) {
    initializeFirebase();
    db = getDatabase();
  }

  try {
    const projectRef = ref(db, `projects/${projectId}`);
    await update(projectRef, {
      name: newName,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('프로젝트 이름 업데이트 오류:', error);
    throw error;
  }
}

// 프로젝트 목록 가져오기
export async function getProjects(limit: number = 20) {
  if (!db) {
    initializeFirebase();
    db = getDatabase();
  }

  try {
    const projectsRef = ref(db, "projects");
    // orderByChild 대신 orderByKey 사용 (인덱스 불필요)
    const projectsQuery = query(projectsRef, orderByKey(), limitToLast(limit));
    const snapshot = await get(projectsQuery);

    if (!snapshot.exists()) {
      return [];
    }

    const projects: any[] = [];
    snapshot.forEach((childSnapshot) => {
      const projectData = childSnapshot.val();
      if (projectData) {
        projects.push({
          id: childSnapshot.key,
          name: projectData.name || '이름 없음',
          createdAt: projectData.createdAt || new Date().toISOString(),
          updatedAt: projectData.updatedAt || projectData.createdAt || new Date().toISOString(),
          chartCount: projectData.charts ? Object.keys(projectData.charts).length : 0,
          promptCount: projectData.prompts ? (Array.isArray(projectData.prompts) ? projectData.prompts.length : 0) : 0,
        });
      }
    });

    // updatedAt 기준으로 정렬 (최신순)
    projects.sort((a, b) => {
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      return dateB - dateA;
    });

    return projects.slice(0, limit);
  } catch (error: any) {
    console.error('프로젝트 목록 가져오기 오류:', error);
    
    // Permission denied 오류인 경우 사용자에게 안내
    if (error?.code === 'PERMISSION_DENIED' || error?.message?.includes('Permission denied')) {
      console.error('Firebase 보안 규칙 오류: projects 경로에 대한 읽기 권한이 없습니다.');
      console.error('Firebase Console에서 보안 규칙을 설정해주세요.');
      console.error('자세한 내용은 FIREBASE_RULES.md 파일을 참고하세요.');
    }
    
    // 에러 발생 시 빈 배열 반환
    return [];
  }
}

// 프로젝트 상세 정보 가져오기
export async function getProject(projectId: string) {
  if (!db) {
    initializeFirebase();
    db = getDatabase();
  }

  const projectRef = ref(db, `projects/${projectId}`);
  const snapshot = await get(projectRef);

  if (!snapshot.exists()) {
    return null;
  }

  const projectData = snapshot.val();
  const charts = projectData.charts || {};
  const chartsArray = Object.keys(charts).map(key => ({
    id: key,
    ...charts[key],
  })).sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA; // 최신순
  });

  return {
    id: projectId,
    name: projectData.name,
    createdAt: projectData.createdAt,
    updatedAt: projectData.updatedAt,
    charts: chartsArray,
    prompts: projectData.prompts || [],
  };
}

// 기존 호환성을 위한 함수들 (deprecated)
export async function saveChart(chartData: any) {
  // 기본 프로젝트에 저장
  return await saveProject(null, { chart: chartData });
}

export async function getCharts(limit: number = 20) {
  const projects = await getProjects(limit);
  const allCharts: any[] = [];
  
  for (const project of projects) {
    const projectDetail = await getProject(project.id);
    if (projectDetail?.charts) {
      projectDetail.charts.forEach((chart: any) => {
        allCharts.push({
          ...chart,
          projectId: project.id,
          projectName: project.name,
        });
      });
    }
  }
  
  return allCharts.slice(0, limit);
}

// 차트 삭제
export async function deleteChart(projectId: string, chartId: string) {
  if (!db) {
    initializeFirebase();
    db = getDatabase();
  }

  try {
    // 삭제할 차트의 버전 정보 가져오기
    const projectDetail = await getProject(projectId);
    if (!projectDetail) {
      throw new Error('프로젝트를 찾을 수 없습니다.');
    }

    const chartToDelete = projectDetail.charts?.find((chart: any) => chart.id === chartId);
    if (!chartToDelete) {
      throw new Error('삭제할 차트를 찾을 수 없습니다.');
    }

    const deletedVersion = chartToDelete.version || 0;

    // 차트 삭제
    const chartRef = ref(db, `projects/${projectId}/charts/${chartId}`);
    await remove(chartRef);

    // 삭제된 차트보다 높은 버전 번호를 가진 차트들의 버전 번호를 1씩 감소
    const updates: any = {};
    if (projectDetail.charts) {
      projectDetail.charts.forEach((chart: any) => {
        if (chart.id !== chartId && chart.version && chart.version > deletedVersion) {
          const newVersion = chart.version - 1;
          updates[`charts/${chart.id}/version`] = newVersion;
          // config 내부의 version도 업데이트
          if (chart.config && chart.config.version) {
            updates[`charts/${chart.id}/config/version`] = newVersion;
          }
        }
      });
    }

    // 버전 번호 업데이트가 필요한 경우
    if (Object.keys(updates).length > 0) {
      const projectRef = ref(db, `projects/${projectId}`);
      await update(projectRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } else {
      // 프로젝트의 updatedAt만 업데이트
      const projectRef = ref(db, `projects/${projectId}`);
      await update(projectRef, {
        updatedAt: new Date().toISOString(),
      });
    }

    return true;
  } catch (error: any) {
    console.error('차트 삭제 오류:', error);
    
    if (error?.code === 'PERMISSION_DENIED' || error?.message?.includes('Permission denied')) {
      console.error('Firebase 보안 규칙 오류: 차트 삭제 권한이 없습니다.');
    }
    
    throw error;
  }
}

// 프로젝트 삭제
export async function deleteProject(projectId: string) {
  if (!db) {
    initializeFirebase();
    db = getDatabase();
  }

  try {
    const projectRef = ref(db, `projects/${projectId}`);
    await remove(projectRef);
    return true;
  } catch (error: any) {
    console.error('프로젝트 삭제 오류:', error);
    
    if (error?.code === 'PERMISSION_DENIED' || error?.message?.includes('Permission denied')) {
      console.error('Firebase 보안 규칙 오류: 프로젝트 삭제 권한이 없습니다.');
    }
    
    throw error;
  }
}
