'use client';

import { RaceMode } from '@/lib/types';
import { colors } from '@/lib/designSystem';

interface RightSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentMode: RaceMode;
  selectedRace: string | null;
}

export default function RightSidebar({
  isOpen,
  onToggle,
  currentMode,
  selectedRace,
}: RightSidebarProps) {
  // Show reopen button when closed (desktop only)
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="hidden md:flex fixed right-0 top-6 w-8 h-16 rounded-l-lg items-center justify-center transition-all hover:w-10 z-40"
        style={{
          backgroundColor: colors.bg.card,
          border: `1px solid ${colors.border.default}`,
          borderRight: 'none',
          color: colors.text.secondary,
        }}
        title="Open sidebar"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    );
  }

  return (
    <aside
      className="hidden md:block fixed right-0 top-0 h-full transition-all duration-300 ease-in-out z-40 overflow-y-auto"
      style={{
        width: '320px',
        backgroundColor: colors.bg.sidebar,
        borderLeft: `1px solid ${colors.border.default}`,
      }}
    >
      {/* Close Button */}
      <button
        onClick={onToggle}
        className="absolute -left-3 top-6 w-6 h-6 rounded-full flex items-center justify-center transition-colors z-50"
        style={{
          backgroundColor: colors.bg.card,
          border: `1px solid ${colors.border.default}`,
          color: colors.text.secondary,
        }}
        title="Close sidebar"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Content */}
      <div className="p-6">
        {/* Pre-Race Mode Content */}
        {currentMode === 'PRE_RACE' && (
          <>
            <h2 className="text-lg font-bold mb-4" style={{ color: colors.text.primary }}>
              Circuit Info
            </h2>

            {selectedRace ? (
              <div className="space-y-4">
                {/* Circuit Overview */}
                <div
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: colors.bg.card,
                    border: `1px solid ${colors.border.default}`,
                  }}
                >
                  <h3 className="text-sm font-semibold mb-2" style={{ color: colors.text.primary }}>
                    {selectedRace}
                  </h3>
                  <div className="space-y-2 text-xs" style={{ color: colors.text.secondary }}>
                    <div className="flex justify-between">
                      <span>Lap Count:</span>
                      <span style={{ color: colors.text.primary }}>57 laps</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Lap Time:</span>
                      <span style={{ color: colors.text.primary }}>1:30.000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pit Loss:</span>
                      <span style={{ color: colors.text.primary }}>~22.2s</span>
                    </div>
                  </div>
                </div>

                {/* Optimal Suggestions */}
                <div
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: colors.accent.teal + '10',
                    border: `1px solid ${colors.accent.teal}40`,
                  }}
                >
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: colors.accent.teal }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Optimal Strategy
                  </h3>
                  <p className="text-xs mb-3" style={{ color: colors.text.secondary }}>
                    Based on historical data and tire degradation models:
                  </p>
                  <div className="space-y-2">
                    <div
                      className="p-2 rounded text-xs"
                      style={{
                        backgroundColor: colors.bg.sidebar,
                        color: colors.text.primary,
                      }}
                    >
                      <div className="font-medium">1-Stop Strategy</div>
                      <div style={{ color: colors.text.secondary }}>Medium (L1-29) → Hard (L30-57)</div>
                    </div>
                  </div>
                </div>

                {/* Strategy Tips */}
                <div
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: colors.bg.card,
                    border: `1px solid ${colors.border.default}`,
                  }}
                >
                  <h3 className="text-sm font-semibold mb-2" style={{ color: colors.text.primary }}>
                    💡 Strategy Tips
                  </h3>
                  <ul className="space-y-2 text-xs" style={{ color: colors.text.secondary }}>
                    <li>• Medium tires optimal for 25-30 lap stints</li>
                    <li>• Avoid soft tires for stints over 20 laps</li>
                    <li>• Consider track evolution in race simulation</li>
                    <li>• Pit window typically opens around lap 15-20</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🏁</div>
                <p className="text-sm" style={{ color: colors.text.secondary }}>
                  Select a race to view circuit information and optimal strategies
                </p>
              </div>
            )}
          </>
        )}

        {/* Live Mode Content */}
        {currentMode === 'LIVE' && (
          <>
            <h2 className="text-lg font-bold mb-4" style={{ color: colors.text.primary }}>
              Live Data
            </h2>
            <div
              className="p-6 rounded-lg text-center"
              style={{
                backgroundColor: colors.bg.card,
                border: `1px solid ${colors.border.default}`,
              }}
            >
              <div className="text-4xl mb-4">🔴</div>
              <p className="text-sm mb-2" style={{ color: colors.text.primary }}>
                Live mode coming in 2026
              </p>
              <p className="text-xs" style={{ color: colors.text.secondary }}>
                Real-time race data will be available during F1 race weekends
              </p>
            </div>
          </>
        )}

        {/* Post-Race Mode Content */}
        {currentMode === 'POST_RACE' && (
          <>
            <h2 className="text-lg font-bold mb-4" style={{ color: colors.text.primary }}>
              Analysis Tools
            </h2>
            <div className="space-y-4">
              <div
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: colors.bg.card,
                  border: `1px solid ${colors.border.default}`,
                }}
              >
                <h3 className="text-sm font-semibold mb-2" style={{ color: colors.text.primary }}>
                  📊 Available Metrics
                </h3>
                <ul className="space-y-2 text-xs" style={{ color: colors.text.secondary }}>
                  <li>• Pit stop timing accuracy</li>
                  <li>• Tire choice analysis</li>
                  <li>• Race time predictions</li>
                  <li>• Strategy deviation breakdown</li>
                </ul>
              </div>

              <div
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: colors.accent.purple + '10',
                  border: `1px solid ${colors.accent.purple}40`,
                }}
              >
                <div className="text-xs" style={{ color: colors.text.secondary }}>
                  Post-race comparison data will be available after the 2026 season begins with FastF1 integration.
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
