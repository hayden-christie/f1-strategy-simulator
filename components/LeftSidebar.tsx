'use client';

import { useState } from 'react';
import { RaceMode } from '@/lib/types';
import { colors } from '@/lib/designSystem';

interface LeftSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentMode: RaceMode;
  onModeChange: (mode: RaceMode) => void;
  selectedRace: string | null;
  savedPredictions: any[];
}

export default function LeftSidebar({
  isOpen,
  onToggle,
  currentMode,
  onModeChange,
  selectedRace,
  savedPredictions,
}: LeftSidebarProps) {
  return (
    <aside
      className="fixed left-0 top-0 h-full transition-all duration-300 ease-in-out z-40"
      style={{
        width: isOpen ? '280px' : '64px',
        backgroundColor: colors.bg.sidebar,
        borderRight: `1px solid ${colors.border.default}`,
      }}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-6 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
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
      <div className="h-full overflow-y-auto p-4">
        {/* Logo / Title */}
        <div className="mb-6">
          {isOpen ? (
            <h1 className="text-xl font-bold" style={{ color: colors.text.primary }}>
              🏎️ F1 Strategy
            </h1>
          ) : (
            <div className="text-2xl text-center">🏎️</div>
          )}
        </div>

        {/* Race Selection */}
        <div className="mb-6">
          {isOpen ? (
            <>
              <h2 className="text-xs font-semibold uppercase mb-2" style={{ color: colors.text.secondary }}>
                Race
              </h2>
              <div
                className="p-3 rounded-lg cursor-pointer transition-colors"
                style={{
                  backgroundColor: colors.bg.input,
                  border: `1px solid ${colors.border.default}`,
                  color: colors.text.primary,
                }}
              >
                <div className="text-sm font-medium truncate">
                  {selectedRace || 'Select Race'}
                </div>
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

        {/* Mode Tabs */}
        <div className="mb-6">
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
                className="w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200"
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
          <div className="mb-6">
            <h2 className="text-xs font-semibold uppercase mb-2" style={{ color: colors.text.secondary }}>
              Saved Predictions ({savedPredictions.length})
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {savedPredictions.map((prediction, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg cursor-pointer transition-colors hover:opacity-80"
                  style={{
                    backgroundColor: colors.bg.card,
                    border: `1px solid ${colors.border.default}`,
                  }}
                >
                  <div className="text-sm font-medium truncate" style={{ color: colors.text.primary }}>
                    {prediction.raceName}
                  </div>
                  <div className="text-xs mt-1" style={{ color: colors.text.secondary }}>
                    {prediction.strategy.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings / Help */}
        <div className="mt-auto pt-6 border-t" style={{ borderColor: colors.border.default }}>
          <button
            className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors hover:opacity-80"
            style={{
              backgroundColor: 'transparent',
              color: colors.text.secondary,
            }}
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {isOpen && <span className="text-sm font-medium">Settings</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
