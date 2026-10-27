import type { SupportedLanguage } from '../engine/TraceTypes';

export interface SharePayload {
  language: SupportedLanguage;
  code: string;
  input: string;
}

/**
 * Encodes code, input, and language into a URL-safe Base64 string
 */
export function encodeSharePayload(payload: SharePayload): string {
  const json = JSON.stringify(payload);
  return btoa(encodeURIComponent(json));
}

/**
 * Decodes a share string back into code, input, and language
 */
export function decodeSharePayload(str: string): SharePayload | null {
  try {
    const json = decodeURIComponent(atob(str));
    const obj = JSON.parse(json);
    if (obj && typeof obj.code === 'string' && typeof obj.language === 'string') {
      return {
        language: obj.language,
        code: obj.code,
        input: typeof obj.input === 'string' ? obj.input : '',
      };
    }
  } catch {
    // Invalid or corrupted payload
  }
  return null;
}

/**
 * Generates the full share URL for the current code state
 */
export function createShareUrl(payload: SharePayload): string {
  const encoded = encodeSharePayload(payload);
  const url = new URL(window.location.href);
  url.searchParams.set('code', encoded);
  return url.toString();
}

/**
 * Reads any shared payload present in the URL query string
 */
export function getSharePayloadFromUrl(): SharePayload | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code') || params.get('share');
    if (codeParam) {
      return decodeSharePayload(codeParam);
    }
  } catch {
    // Failed to parse search params
  }
  return null;
}
