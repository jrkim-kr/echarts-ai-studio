// 로컬 스토리지 유틸리티 함수

const STORAGE_KEYS = {
  FIREBASE_CONFIG: 'firebase_config',
  OPENAI_API_KEY: 'openai_api_key',
} as const;

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Firebase 설정 저장
export function saveFirebaseConfig(config: FirebaseConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.FIREBASE_CONFIG, JSON.stringify(config));
  } catch (error) {
    console.error('Firebase 설정 저장 실패:', error);
  }
}

// Firebase 설정 불러오기
export function getFirebaseConfig(): FirebaseConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.FIREBASE_CONFIG);
    if (!stored) return null;
    return JSON.parse(stored) as FirebaseConfig;
  } catch (error) {
    console.error('Firebase 설정 불러오기 실패:', error);
    return null;
  }
}

// Firebase 설정 삭제
export function clearFirebaseConfig(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEYS.FIREBASE_CONFIG);
  } catch (error) {
    console.error('Firebase 설정 삭제 실패:', error);
  }
}

// OpenAI API 키 저장
export function saveOpenAIApiKey(apiKey: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.OPENAI_API_KEY, apiKey);
  } catch (error) {
    console.error('OpenAI API 키 저장 실패:', error);
  }
}

// OpenAI API 키 불러오기
export function getOpenAIApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEYS.OPENAI_API_KEY);
  } catch (error) {
    console.error('OpenAI API 키 불러오기 실패:', error);
    return null;
  }
}

// OpenAI API 키 삭제
export function clearOpenAIApiKey(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEYS.OPENAI_API_KEY);
  } catch (error) {
    console.error('OpenAI API 키 삭제 실패:', error);
  }
}

// 모든 설정 삭제
export function clearAllSettings(): void {
  clearFirebaseConfig();
  clearOpenAIApiKey();
}

// 필수 설정이 완료되었는지 확인 (Firebase는 필수, OpenAI는 선택)
export function isSettingsComplete(): boolean {
  if (typeof window === 'undefined') return false;
  const firebaseConfig = getFirebaseConfig();
  // Firebase 필수 설정만 확인 (OpenAI는 선택사항)
  return !!(
    firebaseConfig &&
    firebaseConfig.apiKey &&
    firebaseConfig.databaseURL &&
    firebaseConfig.projectId
  );
}

