'use client';

import { RaceMode } from '@/lib/types';
import { colors } from '@/lib/designSystem';
import { getCircuitInfo, formatLapTime, getWeatherEmoji, getCircuitTypeEmoji } from '@/lib/circuitData';

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
  // Show reopen button when closed
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed right-0 top-6 w-8 h-16 rounded-l-lg flex items-center justify-center transition-all hover:w-10 z-40"
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
      className="fixed right-0 top-0 h-full transition-all duration-300 ease-in-out z-40 overflow-y-auto"
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

            {selectedRace ? (() => {
              const circuitInfo = getCircuitInfo(selectedRace);

              if (!circuitInfo) {
                return (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">🏁</div>
                    <p className="text-sm" style={{ color: colors.text.secondary }}>
                      Circuit information not available
                    </p>
                  </div>
                );
              }

              const avgLapTime = formatLapTime(circuitInfo.baseLapTime);
              const totalPitLoss = (circuitInfo.pitLaneTimeLoss + 2.2).toFixed(1); // pitlane + stationary
              const weatherEmoji = getWeatherEmoji(circuitInfo.weather);
              const circuitTypeEmoji = getCircuitTypeEmoji(circuitInfo.circuitType);

              return (
                <div className="space-y-4">
                  {/* Circuit Overview */}
                  <div
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: colors.bg.card,
                      border: `1px solid ${colors.border.default}`,
                    }}
                  >
                    <h3 className="text-sm font-bold mb-3" style={{ color: colors.text.primary }}>
                      📍 {circuitInfo.fullName}
                    </h3>
                    <div className="space-y-2 text-xs" style={{ color: colors.text.secondary }}>
                      <div className="flex justify-between">
                        <span>🏁 Laps:</span>
                        <span className="font-semibold" style={{ color: colors.text.primary }}>{circuitInfo.lapCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>⏱️ Avg Lap:</span>
                        <span className="font-semibold" style={{ color: colors.text.primary }}>~{avgLapTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>🏎️ Pit Loss:</span>
                        <span className="font-semibold" style={{ color: colors.text.primary }}>~{totalPitLoss}s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{weatherEmoji} Weather:</span>
                        <span className="font-semibold" style={{ color: colors.text.primary }}>{circuitInfo.weather}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>🌡️ Temp:</span>
                        <span className="font-semibold" style={{ color: colors.text.primary }}>{circuitInfo.temperature}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{circuitTypeEmoji} Type:</span>
                        <span className="font-semibold" style={{ color: colors.text.primary }}>{circuitInfo.circuitType}</span>
                      </div>
                    </div>
                  </div>

                  {/* Circuit Characteristics */}
                  <div
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: colors.accent.purple + '10',
                      border: `1px solid ${colors.accent.purple}40`,
                    }}
                  >
                    <h3 className="text-sm font-semibold mb-2" style={{ color: colors.accent.purple }}>
                      ⚡ Circuit Characteristics
                    </h3>
                    <div className="space-y-1.5">
                      {circuitInfo.characteristics.map((char, index) => (
                        <div
                          key={index}
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            backgroundColor: colors.bg.sidebar,
                            color: colors.text.primary,
                          }}
                        >
                          • {char}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tire & Difficulty Info */}
                  <div
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: colors.accent.teal + '10',
                      border: `1px solid ${colors.accent.teal}40`,
                    }}
                  >
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: colors.accent.teal }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Track Insights
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span style={{ color: colors.text.secondary }}>Tire Wear:</span>
                        <span
                          className="font-semibold px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: circuitInfo.tireWear === 'High'
                              ? colors.accent.red + '30'
                              : circuitInfo.tireWear === 'Medium'
                              ? colors.accent.yellow + '30'
                              : colors.accent.teal + '30',
                            color: circuitInfo.tireWear === 'High'
                              ? colors.accent.red
                              : circuitInfo.tireWear === 'Medium'
                              ? colors.accent.yellow
                              : colors.accent.teal,
                          }}
                        >
                          {circuitInfo.tireWear}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: colors.text.secondary }}>Difficulty:</span>
                        <span
                          className="font-semibold px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: circuitInfo.difficulty === 'Very Hard' || circuitInfo.difficulty === 'Hard'
                              ? colors.accent.red + '30'
                              : circuitInfo.difficulty === 'Medium'
                              ? colors.accent.yellow + '30'
                              : colors.accent.teal + '30',
                            color: circuitInfo.difficulty === 'Very Hard' || circuitInfo.difficulty === 'Hard'
                              ? colors.accent.red
                              : circuitInfo.difficulty === 'Medium'
                              ? colors.accent.yellow
                              : colors.accent.teal,
                          }}
                        >
                          {circuitInfo.difficulty}
                        </span>
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
                      <li>• Soft: Optimal for 10-18 lap stints (ideal: 14 laps)</li>
                      <li>• Medium: Optimal for 18-30 lap stints (ideal: 24 laps)</li>
                      <li>• Hard: Optimal for 25-45 lap stints (ideal: 35 laps)</li>
                      <li>• {circuitInfo.tireWear === 'High' ? 'High tire wear - shorter stints recommended' : circuitInfo.tireWear === 'Low' ? 'Low tire wear - longer stints possible' : 'Medium tire wear - standard strategy works'}</li>
                    </ul>
                  </div>
                </div>
              );
            })() : (
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
