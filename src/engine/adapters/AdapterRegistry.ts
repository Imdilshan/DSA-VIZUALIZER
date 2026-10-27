import type { LanguageAdapter, SupportedLanguage } from '../TraceTypes';
import { PythonAdapter } from './PythonAdapter';
import { JavaScriptAdapter } from './JavaScriptAdapter';
import { CppAdapter } from './CppAdapter';
import { JavaAdapter } from './JavaAdapter';
import { GoAdapter } from './GoAdapter';
import { RustAdapter } from './RustAdapter';

const registry = new Map<SupportedLanguage, LanguageAdapter>();

export function getAdapter(language: SupportedLanguage): LanguageAdapter {
  if (!registry.has(language)) {
    switch (language) {
      case 'python':
        registry.set(language, new PythonAdapter());
        break;
      case 'javascript':
        registry.set(language, new JavaScriptAdapter());
        break;
      case 'cpp':
        registry.set(language, new CppAdapter());
        break;
      case 'java':
        registry.set(language, new JavaAdapter());
        break;
      case 'go':
        registry.set(language, new GoAdapter());
        break;
      case 'rust':
        registry.set(language, new RustAdapter());
        break;
      default:
        throw new Error(`Language "${language}" is not supported.`);
    }
  }
  return registry.get(language)!;
}

export function disposeAll() {
  for (const adapter of registry.values()) {
    adapter.dispose();
  }
  registry.clear();
}
