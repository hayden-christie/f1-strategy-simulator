'use client';

import { ReactNode, useState } from 'react';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import { RaceMode } from '@/lib/types';
import { colors } from '@/lib/designSystem';
import type { RacePrediction } from '@/lib/types';

interface ResponsiveLayoutProps {
  children: ReactNode;
  raceMode: RaceMode;
  onModeChange: (mode: RaceMode) => void;
  selectedRace: string | null;
  savedPredictions: RacePrediction[];
  breadcrumb?: string;
  quickActions?: ReactNode;
}

export default function ResponsiveLayout({
  children,
  raceMode,
  onModeChange,
  selectedRace,
  savedPredictions,
  breadcrumb,
  quickActions,
}: ResponsiveLayoutProps) {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  // Calculate main content margin based on sidebar states
  const getMainMargin = () => {
    const leftMargin = leftSidebarOpen ? '280px' : '64px';
    const rightMargin = rightSidebarOpen ? '320px' : '0px';
    return { marginLeft: leftMargin, marginRight: rightMargin };
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bg.main }}>
      {/* Left Sidebar */}
      <LeftSidebar
        isOpen={leftSidebarOpen}
        onToggle={() => setLeftSidebarOpen(!leftSidebarOpen)}
        currentMode={raceMode}
        onModeChange={onModeChange}
        selectedRace={selectedRace}
        savedPredictions={savedPredictions}
      />

      {/* Right Sidebar */}
      <RightSidebar
        isOpen={rightSidebarOpen}
        onToggle={() => setRightSidebarOpen(!rightSidebarOpen)}
        currentMode={raceMode}
        selectedRace={selectedRace}
      />

      {/* Main Content */}
      <main
        className="min-h-screen transition-all duration-300 ease-in-out"
        style={getMainMargin()}
      >
        {/* Top Bar - Sticky */}
        <div
          className="sticky top-0 z-30 p-4 border-b transition-all duration-300"
          style={{
            backgroundColor: colors.bg.sidebar,
            borderColor: colors.border.default,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div className="flex items-center justify-between max-w-[900px] mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm" style={{ color: colors.text.secondary }}>
              <span style={{ color: colors.accent.teal }}>🏎️</span>
              {breadcrumb && <span>{breadcrumb}</span>}
            </div>

            {/* Quick Actions */}
            {quickActions && (
              <div className="flex items-center gap-2">
                {quickActions}
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-6 max-w-[900px] mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Overlay - Close sidebars when clicking outside on mobile */}
      <style jsx global>{`
        @media (max-width: 768px) {
          main {
            margin-left: 0 !important;
            margin-right: 0 !important;
          }

          aside {
            transform: ${leftSidebarOpen || rightSidebarOpen ? 'translateX(0)' : 'translateX(-100%)'};
          }
        }
      `}</style>
    </div>
  );
}
