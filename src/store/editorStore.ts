import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SupportedLanguage } from '../engine/TraceTypes';
import { getSharePayloadFromUrl } from '../utils/shareLink';
import { detectLanguage } from '../engine/LanguageDetector';
import { inferDefaultInput } from '../engine/ModeDetector';

const sharedPayload = typeof window !== 'undefined' ? getSharePayloadFromUrl() : null;

const PYTHON_SAMPLE = `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr
`;

const JS_SAMPLE = `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}
`;

const CPP_SAMPLE = `class Solution {
public:
    vector<int> bubbleSort(vector<int>& arr) {
        int n = arr.size();
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    swap(arr[j], arr[j + 1]);
                }
            }
        }
        return arr;
    }
};`;

const JAVA_SAMPLE = `class Solution {
    public int[] bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
        return arr;
    }
}`;

const GO_SAMPLE = `func bubbleSort(arr []int) []int {
    n := len(arr)
    for i := 0; i < n; i++ {
        for j := 0; j < n-i-1; j++ {
            if arr[j] > arr[j+1] {
                arr[j], arr[j+1] = arr[j+1], arr[j]
            }
        }
    }
    return arr
}`;

const RUST_SAMPLE = `fn bubble_sort(mut arr: Vec<i32>) -> Vec<i32> {
    let n = arr.len();
    for i in 0..n {
        for j in 0..(n - i - 1) {
            if arr[j] > arr[j + 1] {
                arr.swap(j, j + 1);
            }
        }
    }
    arr
}`;

const DEFAULT_INPUTS: Record<SupportedLanguage, string> = {
  python: '[[64, 34, 25, 12, 22, 11, 90]]',
  javascript: '[[64, 34, 25, 12, 22, 11, 90]]',
  cpp: '[[64, 34, 25, 12, 22, 11, 90]]',
  java: '[[64, 34, 25, 12, 22, 11, 90]]',
  go: '[[64, 34, 25, 12, 22, 11, 90]]',
  rust: '[[64, 34, 25, 12, 22, 11, 90]]',
};

const DEFAULT_CODE: Record<SupportedLanguage, string> = {
  python: PYTHON_SAMPLE,
  javascript: JS_SAMPLE,
  cpp: CPP_SAMPLE,
  java: JAVA_SAMPLE,
  go: GO_SAMPLE,
  rust: RUST_SAMPLE,
};

import { identifyPlatform, type PlatformDetectionResult } from '../engine/PlatformDetector';

interface EditorStore {
  language: SupportedLanguage;
  code: string;
  input: string;
  fontSize: number;
  modeOverride: 'auto' | 'function' | 'full-program';
  autoDetectedLang: SupportedLanguage | null;
  isAutoDetecting: boolean;
  detectedPlatform: PlatformDetectionResult | null;

  setLanguage: (lang: SupportedLanguage) => void;
  setCode: (code: string) => void;
  setInput: (input: string) => void;
  setFontSize: (size: number) => void;
  setModeOverride: (mode: 'auto' | 'function' | 'full-program') => void;
  loadSample: (language: SupportedLanguage) => void;
  setIsAutoDetecting: (b: boolean) => void;
}

export const useEditorStore = create<EditorStore>()(
  persist(
    (set) => ({
      language: sharedPayload?.language ?? 'javascript',
      code: sharedPayload?.code ?? '',
      input: sharedPayload?.input ?? '',
      fontSize: 14,
      modeOverride: 'auto',
      autoDetectedLang: null,
      isAutoDetecting: true,
      detectedPlatform: sharedPayload?.code ? identifyPlatform(sharedPayload.code) : null,

      setLanguage: (lang) =>
        set({ language: lang, isAutoDetecting: false, autoDetectedLang: null }),
      setCode: (code) =>
        set((state) => {
          const updates: Partial<EditorStore> = { code };
          if (code.trim().length > 10) {
            const detected = detectLanguage(code);
            const platformInfo = identifyPlatform(code);
            updates.detectedPlatform = platformInfo;

            const shouldSwitch =
              state.isAutoDetecting
                ? detected.confidence >= 0.35
                : detected.confidence >= 0.5 && detected.language !== state.language;

            if (shouldSwitch) {
              updates.language = detected.language;
              updates.autoDetectedLang = detected.language;
            }

            const inferred = platformInfo.defaultInput ?? inferDefaultInput(code);
            const isNewProblem = Boolean(
              platformInfo.problemName && platformInfo.problemName !== state.detectedPlatform?.problemName,
            );
            if (inferred && (!state.input.trim() || Object.values(DEFAULT_INPUTS).includes(state.input) || isNewProblem)) {
              updates.input = inferred;
            }
          }
          return updates;
        }),
      setInput: (input) => set({ input }),
      setFontSize: (fontSize) => set({ fontSize }),
      setModeOverride: (modeOverride) => set({ modeOverride }),
      loadSample: (language) =>
        set({
          language,
          code: DEFAULT_CODE[language],
          input: DEFAULT_INPUTS[language],
          autoDetectedLang: null,
        }),
      setIsAutoDetecting: (isAutoDetecting) =>
        set((state) => {
          if (isAutoDetecting && state.code.trim().length > 10) {
            const detected = detectLanguage(state.code);
            return {
              isAutoDetecting: true,
              language: detected.language,
              autoDetectedLang: detected.language,
            };
          }
          return { isAutoDetecting, autoDetectedLang: null };
        }),
    }),
    {
      name: 'algolens-editor-v3',
      partialize: (s) => ({
        language: s.language,
        code: s.code,
        input: s.input,
        fontSize: s.fontSize,
        isAutoDetecting: s.isAutoDetecting,
      }),
    },
  ),
);
