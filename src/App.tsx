import React, { useEffect, useRef, useCallback, useState } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { GallerySection } from './components/gallery/GallerySection';
import { ResourcesSection } from './components/resources/ResourcesSection';
import { HeroSection } from './components/landing/HeroSection';
import { useUIStore } from './store/uiStore';
import { Analytics } from "@vercel/analytics/react";

export default function App() {
  const { theme } = useUIStore();
  const [showResources, setShowResources] = useState(false);
  const ideRef = useRef<HTMLDivElement>(null);

  // Apply theme class to <html> on mount and whenever it changes
  useEffect(() => {
    document.documentElement.className = theme === 'light' ? 'light' : '';
  }, [theme]);

  const handleEnterApp = useCallback(() => {
    ideRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  if (showResources) {
    return <ResourcesSection onBack={() => setShowResources(false)} />;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: '#0a0b0c',
      }}
    >
      {/* ── Hero landing (100vh) ── */}
      <HeroSection onEnterApp={handleEnterApp} onOpenResources={() => setShowResources(true)} />

      {/* ── IDE workspace (100vh) ── */}
      <div
        ref={ideRef}
        id="ide-anchor"
        style={{
          height: '100vh',
          flexShrink: 0,
          background: 'var(--bg-primary)',
        }}
      >
        <MainLayout />
      </div>

      {/* ── Algorithm gallery below ── */}
      <div id="gallery-anchor">
        <GallerySection />
      </div>

    </div>
  );
}
