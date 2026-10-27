import { describe, it, expect } from 'vitest';
import { encodeSharePayload, decodeSharePayload, type SharePayload } from '../shareLink';

describe('shareLink utils', () => {
  it('correctly encodes and decodes share payloads', () => {
    const original: SharePayload = {
      language: 'python',
      code: 'def solve(a, b):\n    return a + b',
      input: '[1, 2]',
    };

    const encoded = encodeSharePayload(original);
    expect(typeof encoded).toBe('string');
    expect(encoded.length).toBeGreaterThan(0);

    const decoded = decodeSharePayload(encoded);
    expect(decoded).toEqual(original);
  });

  it('handles unicode characters gracefully', () => {
    const unicodePayload: SharePayload = {
      language: 'javascript',
      code: '// 🚀 Unicode comment: äöü, 日本語, 🌟\nconst x = "🔥";',
      input: '[]',
    };

    const encoded = encodeSharePayload(unicodePayload);
    const decoded = decodeSharePayload(encoded);
    expect(decoded).toEqual(unicodePayload);
  });

  it('returns null for corrupted or invalid payload strings', () => {
    expect(decodeSharePayload('not-a-valid-base64-payload!@#$')).toBeNull();
    expect(decodeSharePayload('')).toBeNull();
  });
});
