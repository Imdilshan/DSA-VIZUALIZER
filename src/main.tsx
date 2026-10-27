import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useEditorStore } from './store/editorStore'
import { useTraceStore } from './store/traceStore'

if (typeof window !== 'undefined') {
  (window as unknown as { editorStore: unknown }).editorStore = useEditorStore;
  (window as unknown as { traceStore: unknown }).traceStore = useTraceStore;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
