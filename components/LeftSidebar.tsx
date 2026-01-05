'use client';

import { useState } from 'react';
import { RaceMode } from '@/lib/types';
import { colors } from '@/lib/designSystem';
import { F1Race } from '@/types/f1-data';
import { Driver } from '@/lib';

interface LeftSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentMode: RaceMode;
  onModeChange: (mode: RaceMode) => void;
  selectedRace: F1Race | null;
  onRaceSelect: (race: F1Race) => void;
  races: F1Race[];
  selectedDriver: Driver | null;
  onDriverSelect: (driver: Driver | null) => void;
  drivers: Driver[];
  savedPredictions: any[];
}

export default function LeftSidebar({
  isOpen,
  onToggle,
  currentMode,
  onModeChange,
  selectedRace,
  onRaceSelect,
  races,
  selectedDriver,
  onDriverSelect,
  drivers,
  savedPredictions,
}: LeftSidebarProps) {
  const [raceDropdownOpen, setRaceDropdownOpen] = useState(false);
  const [driverDropdownOpen, setDriverDropdownOpen] = useState(false);

  return (
    <aside
      className="fixed left-0 top-0 h-full transition-all duration-300 ease-in-out z-40 overflow-y-auto"
      style={{
        width: isOpen ? '280px' : '64px',
        backgroundColor: colors.bg.sidebar,
        borderRight: `1px solid ${colors.border.default}`,
      }}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-6 w-6 h-6 rounded-full flex items-center justify-center transition-colors z-50"
        style={{
          backgroundColor: colors.bg.card,
          border: `1px solid ${colors.border.default}`,
          color: colors.text.secondary,
        }}
        title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        <svg
          className="w-4 h-4 transition-transform duration-300"
          style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Sidebar Content */}
      <div className="h-full p-4 pb-20">
        {/* Logo / Title */}
        <div className="mb-4">
          {isOpen ? (
            <h1 className="text-lg font-bold" style={{ color: colors.text.primary }}>
              🏎️ F1 Strategy
            </h1>
          ) : (
            <div className="text-2xl text-center">🏎️</div>
          )}
        </div>

        {/* Race Selection */}
        <div className="mb-4">
          {isOpen ? (
            <>
              <h2 className="text-xs font-semibold uppercase mb-2" style={{ color: colors.text.secondary }}>
                Race
              </h2>
              <div className="relative">
                <button
                  onClick={() => setRaceDropdownOpen(!raceDropdownOpen)}
                  className="w-full p-2.5 rounded-lg transition-colors text-left flex items-center justify-between"
                  style={{
                    backgroundColor: colors.bg.input,
                    border: `1px solid ${colors.border.default}`,
                    color: colors.text.primary,
                  }}
                >
                  <span className="text-sm font-medium truncate">
                    {selectedRace?.name || 'Select Race'}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${raceDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {raceDropdownOpen && (
                  <div
                    className="absolute top-full left-0 right-0 mt-1 rounded-lg max-h-64 overflow-y-auto shadow-lg z-50"
                    style={{
                      backgroundColor: colors.bg.card,
                      border: `1px solid ${colors.border.default}`,
                    }}
                  >
                    {races.map((race) => (
                      <button
                        key={race.name}
                        onClick={() => {
                          onRaceSelect(race);
                          setRaceDropdownOpen(false);
                        }}
                        className="w-full p-2.5 text-left hover:opacity-80 transition-opacity"
                        style={{
                          backgroundColor: selectedRace?.name === race.name ? colors.accent.teal + '20' : 'transparent',
                          borderBottom: `1px solid ${colors.border.default}`,
                          color: colors.text.primary,
                        }}
                      >
                        <div className="text-sm font-medium">{race.name}</div>
                        <div className="text-xs" style={{ color: colors.text.secondary }}>{race.date}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div
              className="w-12 h-12 flex items-center justify-center rounded-lg"
              style={{
                backgroundColor: colors.bg.input,
                border: `1px solid ${colors.border.default}`,
              }}
              title="Race"
            >
              <svg className="w-5 h-5" style={{ color: colors.text.secondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
          )}
        </div>

        {/* Driver Selection */}
        <div className="mb-4">
          {isOpen ? (
            <>
              <h2 className="text-xs font-semibold uppercase mb-2" style={{ color: colors.text.secondary }}>
                Driver (Optional)
              </h2>
              <div className="relative">
                <button
                  onClick={() => setDriverDropdownOpen(!driverDropdownOpen)}
                  className="w-full p-2.5 rounded-lg transition-colors text-left flex items-center justify-between"
                  style={{
                    backgroundColor: colors.bg.input,
                    border: `1px solid ${colors.border.default}`,
                    color: colors.text.primary,
                  }}
                >
                  <span className="text-sm font-medium truncate">
                    {selectedDriver?.fullName || 'Select Driver'}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${driverDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {driverDropdownOpen && (
                  <div
                    className="absolute top-full left-0 right-0 mt-1 rounded-lg max-h-64 overflow-y-auto shadow-lg z-50"
                    style={{
                      backgroundColor: colors.bg.card,
                      border: `1px solid ${colors.border.default}`,
                    }}
                  >
                    <button
                      onClick={() => {
                        onDriverSelect(null);
                        setDriverDropdownOpen(false);
                      }}
                      className="w-full p-2.5 text-left hover:opacity-80 transition-opacity"
                      style={{
                        backgroundColor: !selectedDriver ? colors.accent.teal + '20' : 'transparent',
                        borderBottom: `1px solid ${colors.border.default}`,
                        color: colors.text.secondary,
                      }}
                    >
                      <div className="text-sm font-medium">None</div>
                    </button>
                    {drivers.map((driver) => (
                      <button
                        key={driver.id}
                        onClick={() => {
                          onDriverSelect(driver);
                          setDriverDropdownOpen(false);
                        }}
                        className="w-full p-2.5 text-left hover:opacity-80 transition-opacity"
                        style={{
                          backgroundColor: selectedDriver?.id === driver.id ? colors.accent.teal + '20' : 'transparent',
                          borderBottom: `1px solid ${colors.border.default}`,
                          color: colors.text.primary,
                        }}
                      >
                        <div className="text-sm font-medium">{driver.fullName}</div>
                        <div className="text-xs" style={{ color: colors.text.secondary }}>{driver.teamName}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div
              className="w-12 h-12 flex items-center justify-center rounded-lg"
              style={{
                backgroundColor: colors.bg.input,
                border: `1px solid ${colors.border.default}`,
              }}
              title="Driver"
            >
              <svg className="w-5 h-5" style={{ color: colors.text.secondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
        </div>

        {/* Mode Tabs */}
        <div className="mb-4">
          {isOpen && (
            <h2 className="text-xs font-semibold uppercase mb-2" style={{ color: colors.text.secondary }}>
              Mode
            </h2>
          )}
          <div className="space-y-1">
            {[
              { mode: 'PRE_RACE' as RaceMode, label: 'Pre-Race', icon: '📊', color: colors.mode.preRace },
              { mode: 'LIVE' as RaceMode, label: 'Live', icon: '🔴', color: colors.mode.live },
              { mode: 'POST_RACE' as RaceMode, label: 'Post-Race', icon: '📈', color: colors.mode.postRace },
            ].map(({ mode, label, icon, color }) => (
              <button
                key={mode}
                onClick={() => onModeChange(mode)}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: currentMode === mode ? color + '20' : 'transparent',
                  border: `1px solid ${currentMode === mode ? color : 'transparent'}`,
                  color: currentMode === mode ? color : colors.text.secondary,
                }}
                title={label}
              >
                <span className="text-lg">{icon}</span>
                {isOpen && <span className="text-sm font-medium">{label}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Saved Predictions */}
        {isOpen && savedPredictions.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xs font-semibold uppercase mb-2" style={{ color: colors.text.secondary }}>
              Saved ({savedPredictions.length})
            </h2>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {savedPredictions.map((prediction, index) => (
                <div
                  key={index}
                  className="p-2.5 rounded-lg cursor-pointer transition-colors hover:opacity-80"
                  style={{
                    backgroundColor: colors.bg.card,
                    border: `1px solid ${colors.border.default}`,
                  }}
                >
                  <div className="text-xs font-medium truncate" style={{ color: colors.text.primary }}>
                    {prediction.raceName}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: colors.text.secondary }}>
                    {prediction.strategy.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
