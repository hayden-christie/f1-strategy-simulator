'use client';

import { useState } from 'react';
import { Strategy, TireCompound } from '@/lib/types';
import { colors } from '@/lib/designSystem';

interface TimelineStrategyBuilderProps {
  strategy: Strategy;
  totalLaps: number;
  onUpdateStrategy: (strategy: Strategy) => void;
}

export default function TimelineStrategyBuilder({
  strategy,
  totalLaps,
  onUpdateStrategy,
}: TimelineStrategyBuilderProps) {
  const getTireColor = (compound: TireCompound): string => {
    return colors.tire[compound.toLowerCase() as keyof typeof colors.tire] || colors.tire.medium;
  };

  const getTireLabel = (compound: TireCompound): string => {
    return compound.charAt(0); // S, M, H
  };

  // Calculate stint segments for timeline
  const getStintSegments = () => {
    const segments = [];
    let currentLap = 1;
    let currentCompound = strategy.startingCompound;

    // First stint
    const firstStintEnd = strategy.pitStops.length > 0 ? strategy.pitStops[0].lap - 1 : totalLaps;
    segments.push({
      start: currentLap,
      end: firstStintEnd,
      compound: currentCompound,
      width: ((firstStintEnd - currentLap + 1) / totalLaps) * 100,
    });

    // Remaining stints
    strategy.pitStops.forEach((stop, index) => {
      currentLap = stop.lap + 1;
      currentCompound = stop.tireCompound;
      const nextStop = strategy.pitStops[index + 1];
      const stintEnd = nextStop ? nextStop.lap - 1 : totalLaps;

      segments.push({
        start: currentLap,
        end: stintEnd,
        compound: currentCompound,
        width: ((stintEnd - currentLap + 1) / totalLaps) * 100,
      });
    });

    return segments;
  };

  const segments = getStintSegments();

  // Calculate total laps covered (excluding pit laps)
  const getTotalLapsCovered = () => {
    return segments.reduce((total, segment) => {
      return total + (segment.end - segment.start + 1);
    }, 0);
  };

  const totalLapsCovered = getTotalLapsCovered();
  const pitLapsCount = strategy.pitStops.length;
  const uncoveredLaps = totalLaps - totalLapsCovered - pitLapsCount;

  const addPitStop = () => {
    const lastPitLap = strategy.pitStops.length > 0
      ? Math.max(...strategy.pitStops.map(ps => ps.lap))
      : 0;
    const newLap = Math.min(lastPitLap + 15, totalLaps - 5);

    const newPitStop = {
      lap: newLap,
      tireCompound: 'MEDIUM' as TireCompound,
    };

    onUpdateStrategy({
      ...strategy,
      pitStops: [...strategy.pitStops, newPitStop].sort((a, b) => a.lap - b.lap),
    });
  };

  const removePitStop = (index: number) => {
    onUpdateStrategy({
      ...strategy,
      pitStops: strategy.pitStops.filter((_, i) => i !== index),
    });
  };

  const updatePitStop = (index: number, updates: Partial<typeof strategy.pitStops[0]>) => {
    const newPitStops = [...strategy.pitStops];
    newPitStops[index] = { ...newPitStops[index], ...updates };
    onUpdateStrategy({
      ...strategy,
      pitStops: newPitStops.sort((a, b) => a.lap - b.lap),
    });
  };

  return (
    <div className="space-y-6">
      {/* Timeline View */}
      <div
        className="p-6 rounded-lg"
        style={{
          backgroundColor: colors.bg.card,
          border: `1px solid ${colors.border.default}`,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
        }}
      >
        <h3 className="text-lg font-bold mb-4" style={{ color: colors.text.primary }}>
          Race Timeline
        </h3>

        {/* Timeline Bar */}
        <div className="relative h-24 mb-6">
          {/* Background track */}
          <div
            className="absolute top-0 left-0 right-0 h-12 rounded-lg"
            style={{
              backgroundColor: colors.bg.input,
              border: `1px solid ${colors.border.default}`,
            }}
          >
            {/* Stint segments */}
            <div className="relative h-full flex">
              {segments.map((segment, index) => {
                const stintLength = segment.end - segment.start + 1;
                return (
                  <div
                    key={index}
                    className="relative h-full flex items-center justify-center transition-all duration-200 hover:opacity-90 group"
                    style={{
                      width: `${segment.width}%`,
                      backgroundColor: getTireColor(segment.compound),
                      borderRight: index < segments.length - 1 ? `2px solid ${colors.bg.card}` : 'none',
                    }}
                  >
                    <div className="text-sm font-bold" style={{ color: colors.text.inverse }}>
                      {getTireLabel(segment.compound)}
                    </div>
                    {/* Enhanced Tooltip */}
                    <div
                      className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-xs pointer-events-none z-20"
                      style={{
                        backgroundColor: colors.bg.sidebar,
                        border: `2px solid ${getTireColor(segment.compound)}`,
                        color: colors.text.primary,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.6)',
                      }}
                    >
                      <div className="font-bold mb-1">{segment.compound} Tires</div>
                      <div style={{ color: colors.text.secondary }}>
                        Laps {segment.start} - {segment.end}
                      </div>
                      <div style={{ color: colors.text.secondary }}>
                        Stint Length: {stintLength} laps
                      </div>
                      <div className="mt-1 pt-1 border-t" style={{ borderColor: colors.border.default }}>
                        <div className="text-xs" style={{ color: colors.text.muted }}>
                          Degradation increases over stint
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pit stop markers */}
          {strategy.pitStops.map((stop, index) => {
            const position = (stop.lap / totalLaps) * 100;
            // Determine old tire compound
            const previousCompound = index === 0
              ? strategy.startingCompound
              : strategy.pitStops[index - 1].tireCompound;
            const newCompound = stop.tireCompound;

            return (
              <div
                key={index}
                className="absolute top-0 -translate-x-1/2 cursor-pointer group"
                style={{
                  left: `${position}%`,
                  zIndex: 10,
                }}
              >
                {/* Marker */}
                <div
                  className="w-6 h-12 rounded-sm flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: colors.accent.red,
                    border: `2px solid ${colors.bg.main}`,
                  }}
                >
                  <div className="text-xs font-bold text-white">P</div>
                </div>
                {/* Enhanced Tooltip */}
                <div
                  className="absolute top-14 left-1/2 -translate-x-1/2 px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-xs pointer-events-none z-20"
                  style={{
                    backgroundColor: colors.bg.sidebar,
                    border: `2px solid ${colors.accent.red}`,
                    color: colors.text.primary,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.6)',
                  }}
                >
                  <div className="font-bold mb-1" style={{ color: colors.accent.red }}>
                    Pit Stop {index + 1}
                  </div>
                  <div style={{ color: colors.text.secondary }}>
                    Lap {stop.lap}
                  </div>
                  <div className="mt-1 pt-1 border-t" style={{ borderColor: colors.border.default }}>
                    <div className="flex items-center gap-2">
                      <span style={{ color: getTireColor(previousCompound) }}>{previousCompound}</span>
                      <span style={{ color: colors.text.muted }}>→</span>
                      <span style={{ color: getTireColor(newCompound) }}>{newCompound}</span>
                    </div>
                  </div>
                  <div className="mt-1 text-xs" style={{ color: colors.text.muted }}>
                    ~22-24s time loss
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Lap markers */}
        <div className="relative h-6" style={{ color: colors.text.secondary }}>
          <div className="flex justify-between text-xs">
            <span>Lap 1</span>
            <span>Lap {Math.floor(totalLaps / 2)}</span>
            <span>Lap {totalLaps}</span>
          </div>
        </div>

        {/* Lap coverage indicator */}
        <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t" style={{ borderColor: colors.border.default }}>
          <div style={{ color: colors.text.secondary }}>
            Racing Laps: <span style={{ color: colors.text.primary }}>{totalLapsCovered}</span> / {totalLaps}
            {pitLapsCount > 0 && (
              <span className="ml-2">
                (Pit Laps: <span style={{ color: colors.accent.red }}>{pitLapsCount}</span>)
              </span>
            )}
          </div>
          {uncoveredLaps !== 0 && (
            <div
              className="px-2 py-0.5 rounded text-xs font-medium"
              style={{
                backgroundColor: colors.accent.red + '20',
                color: colors.accent.red,
              }}
            >
              ⚠ {Math.abs(uncoveredLaps)} lap{Math.abs(uncoveredLaps) !== 1 ? 's' : ''} {uncoveredLaps > 0 ? 'missing' : 'over'}
            </div>
          )}
        </div>
      </div>

      {/* List View */}
      <div
        className="p-6 rounded-lg"
        style={{
          backgroundColor: colors.bg.card,
          border: `1px solid ${colors.border.default}`,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold" style={{ color: colors.text.primary }}>
            Pit Stop Configuration
          </h3>
          <button
            onClick={addPitStop}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
            style={{
              backgroundColor: colors.accent.teal,
              color: 'white',
            }}
          >
            + Add Pit Stop
          </button>
        </div>

        {/* Starting Compound */}
        <div
          className="p-4 rounded-lg mb-4"
          style={{
            backgroundColor: colors.bg.input,
            border: `1px solid ${colors.border.default}`,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase mb-1" style={{ color: colors.text.secondary }}>
                Starting Compound
              </div>
              <div className="text-sm font-medium" style={{ color: colors.text.primary }}>
                {strategy.startingCompound}
              </div>
            </div>
            <div className="flex gap-2">
              {(['SOFT', 'MEDIUM', 'HARD'] as TireCompound[]).map((compound) => (
                <button
                  key={compound}
                  onClick={() => onUpdateStrategy({ ...strategy, startingCompound: compound })}
                  className="w-10 h-10 rounded-lg font-bold text-sm transition-all"
                  style={{
                    backgroundColor: strategy.startingCompound === compound
                      ? getTireColor(compound)
                      : colors.bg.sidebar,
                    color: strategy.startingCompound === compound
                      ? colors.text.inverse
                      : colors.text.secondary,
                    border: `2px solid ${strategy.startingCompound === compound
                        ? getTireColor(compound)
                        : colors.border.default}`,
                  }}
                  title={compound}
                >
                  {getTireLabel(compound)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pit Stops */}
        <div className="space-y-3">
          {strategy.pitStops.length === 0 ? (
            <div
              className="p-6 rounded-lg text-center"
              style={{
                backgroundColor: colors.bg.input,
                border: `1px dashed ${colors.border.default}`,
                color: colors.text.secondary,
              }}
            >
              <div className="text-sm">No pit stops configured</div>
              <div className="text-xs mt-1">Click "Add Pit Stop" to create your strategy</div>
            </div>
          ) : (
            strategy.pitStops.map((stop, index) => (
              <div
                key={index}
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: colors.bg.input,
                  border: `1px solid ${colors.border.default}`,
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="text-xs font-semibold uppercase mb-1" style={{ color: colors.text.secondary }}>
                      Pit Stop {index + 1}
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-4">
                    {/* Lap selector */}
                    <div>
                      <label className="text-xs font-medium mb-1 block" style={{ color: colors.text.secondary }}>
                        Lap
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={totalLaps}
                        value={stop.lap}
                        onChange={(e) => updatePitStop(index, { lap: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{
                          backgroundColor: colors.bg.sidebar,
                          border: `1px solid ${colors.border.default}`,
                          color: colors.text.primary,
                        }}
                      />
                    </div>

                    {/* Tire compound selector */}
                    <div>
                      <label className="text-xs font-medium mb-1 block" style={{ color: colors.text.secondary }}>
                        New Tires
                      </label>
                      <div className="flex gap-2">
                        {(['SOFT', 'MEDIUM', 'HARD'] as TireCompound[]).map((compound) => (
                          <button
                            key={compound}
                            onClick={() => updatePitStop(index, { tireCompound: compound })}
                            className="flex-1 py-2 rounded-lg font-bold text-sm transition-all"
                            style={{
                              backgroundColor: stop.tireCompound === compound
                                ? getTireColor(compound)
                                : colors.bg.sidebar,
                              color: stop.tireCompound === compound
                                ? colors.text.inverse
                                : colors.text.secondary,
                              border: `2px solid ${stop.tireCompound === compound
                                  ? getTireColor(compound)
                                  : colors.border.default}`,
                            }}
                            title={compound}
                          >
                            {getTireLabel(compound)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removePitStop(index)}
                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:scale-110"
                    style={{
                      backgroundColor: colors.accent.red + '20',
                      color: colors.accent.red,
                    }}
                    title="Remove pit stop"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
