'use client';

import React, { useState } from 'react';
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
  // FIXED: Pit stops happen AT END of a lap, not as separate laps
  // Example: 56 lap race, pit on lap 17 and 35
  // - Stint 1: Laps 1-17 (17 laps, pit at END of lap 17)
  // - Stint 2: Laps 18-35 (18 laps, pit at END of lap 35)
  // - Stint 3: Laps 36-56 (21 laps)
  // Total: 17 + 18 + 21 = 56 laps ✓
  const getStintSegments = () => {
    const segments = [];
    let currentLap = 1;
    let currentCompound = strategy.startingCompound;

    // First stint - ends ON the pit stop lap (not lap before)
    const firstStintEnd = strategy.pitStops.length > 0 ? strategy.pitStops[0].lap : totalLaps;
    segments.push({
      start: currentLap,
      end: firstStintEnd,
      compound: currentCompound,
      width: ((firstStintEnd - currentLap + 1) / totalLaps) * 100,
    });

    // Remaining stints - start AFTER pit stop lap
    strategy.pitStops.forEach((stop, index) => {
      currentLap = stop.lap + 1;
      currentCompound = stop.tireCompound;
      const nextStop = strategy.pitStops[index + 1];
      const stintEnd = nextStop ? nextStop.lap : totalLaps;

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

  // Calculate total laps covered (should equal totalLaps)
  const getTotalLapsCovered = () => {
    return segments.reduce((total, segment) => {
      return total + (segment.end - segment.start + 1);
    }, 0);
  };

  const totalLapsCovered = getTotalLapsCovered();
  const uncoveredLaps = totalLaps - totalLapsCovered;

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
      {/* Timeline View - Simplified */}
      <div
        className="p-6 rounded-xl"
        style={{
          backgroundColor: colors.bg.card,
          border: `1px solid ${colors.border.default}`,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold" style={{ color: colors.text.secondary }}>
            Race Timeline
          </h3>
          <div className="text-xs" style={{ color: colors.text.secondary }}>
            {totalLapsCovered}/{totalLaps} Laps
          </div>
        </div>

        {/* Timeline Bar */}
        <div className="relative mb-2 mt-8">
          {/* Lap markers at strategic points */}
          <div className="absolute -top-6 left-0 right-0 h-5">
            {/* Start marker */}
            <div className="absolute left-0 text-xs font-medium" style={{ color: colors.text.secondary }}>
              L1
            </div>
            {/* Pit stop markers */}
            {strategy.pitStops.map((stop, idx) => (
              <div
                key={idx}
                className="absolute -translate-x-1/2 text-xs font-medium"
                style={{
                  left: `${(stop.lap / totalLaps) * 100}%`,
                  color: colors.text.secondary,
                }}
              >
                L{stop.lap}
              </div>
            ))}
            {/* Finish marker */}
            <div className="absolute right-0 text-xs font-medium" style={{ color: colors.text.secondary }}>
              L{totalLaps}
            </div>
          </div>

          <div
            className="relative"
            style={{
              height: '70px',
              borderRadius: '8px',
              overflow: 'visible',
            }}
          >
            {/* Tire segments with hover tooltips */}
            <div className="relative h-full flex" style={{ overflow: 'hidden', borderRadius: '8px' }}>
              {segments.map((segment, index) => {
                const stintLength = segment.end - segment.start + 1;
                const baseColor = getTireColor(segment.compound);

                // Strategic recommendation logic
                const getRecommendation = () => {
                  const optimalRanges = {
                    SOFT: { min: 10, max: 18, ideal: 14 },
                    MEDIUM: { min: 18, max: 30, ideal: 24 },
                    HARD: { min: 25, max: 45, ideal: 35 },
                  };
                  const range = optimalRanges[segment.compound];

                  if (stintLength >= range.min && stintLength <= range.max) {
                    if (Math.abs(stintLength - range.ideal) <= 3) {
                      return { icon: '✅', text: `Optimal: This stint length maximizes ${segment.compound} tire performance` };
                    }
                    return { icon: '💡', text: `Good: Within optimal ${segment.compound} tire window (${range.min}-${range.max} laps)` };
                  } else if (stintLength < range.min) {
                    return { icon: '⚠️', text: `Short: ${segment.compound} tires could run ${range.min - stintLength} more laps safely` };
                  } else {
                    return { icon: '❌', text: `Risky: ${segment.compound} tires typically degrade after lap ${range.max} - consider earlier pit` };
                  }
                };

                const recommendation = getRecommendation();
                const avgPace = segment.compound === 'SOFT' ? '1:32.5' : segment.compound === 'MEDIUM' ? '1:33.2' : '1:33.8';
                const degradation = segment.compound === 'SOFT' ? '+2.1s' : segment.compound === 'MEDIUM' ? '+1.4s' : '+0.9s';

                return (
                  <div
                    key={index}
                    className="relative h-full flex items-center justify-center group cursor-pointer transition-all duration-200 hover:brightness-110"
                    style={{
                      width: `${segment.width}%`,
                      backgroundColor: baseColor,
                      borderTopLeftRadius: index === 0 ? '8px' : '0',
                      borderBottomLeftRadius: index === 0 ? '8px' : '0',
                      borderTopRightRadius: index === segments.length - 1 ? '8px' : '0',
                      borderBottomRightRadius: index === segments.length - 1 ? '8px' : '0',
                    }}
                  >
                    {/* Tire compound letter */}
                    <div className="text-lg font-bold" style={{
                      color: segment.compound === 'HARD' ? '#1a1f2e' : colors.text.inverse,
                    }}>
                      {getTireLabel(segment.compound)}
                    </div>

                    {/* Advanced hover tooltip */}
                    <div
                      className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 whitespace-nowrap"
                      style={{
                        backgroundColor: 'rgba(26, 31, 46, 0.95)',
                        border: '1px solid #2a3441',
                        maxWidth: '280px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                      }}
                    >
                      <div className="text-xs">
                        {/* Stint details */}
                        <div className="font-bold mb-2" style={{ color: colors.text.primary }}>
                          {segment.compound} Tires: Laps {segment.start}-{segment.end} ({stintLength} laps)
                        </div>

                        {/* Performance info */}
                        <div className="space-y-1 mb-2" style={{ color: colors.text.secondary }}>
                          <div>Average pace: {avgPace}</div>
                          <div>Tire condition: Fresh → {degradation} slower by lap {segment.end}</div>
                        </div>

                        {/* Strategic recommendation */}
                        <div className="pt-2 border-t" style={{ borderColor: '#2a3441' }}>
                          <div className="flex items-start gap-2" style={{ color: colors.text.primary }}>
                            <span>{recommendation.icon}</span>
                            <span>{recommendation.text}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pit stop markers with strategic tooltips */}
            {strategy.pitStops.map((stop, index) => {
              const position = (stop.lap / totalLaps) * 100;
              const previousCompound = index === 0 ? strategy.startingCompound : strategy.pitStops[index - 1].tireCompound;
              const newCompound = stop.tireCompound;

              // Strategic pit window analysis
              const optimalWindows = {
                SOFT: { min: 10, max: 18 },
                MEDIUM: { min: 18, max: 30 },
                HARD: { min: 25, max: 45 },
              };
              const prevWindow = optimalWindows[previousCompound];
              const isOptimalTiming = stop.lap >= prevWindow.min && stop.lap <= prevWindow.max;

              return (
                <div
                  key={index}
                  className="absolute -translate-x-1/2 group cursor-pointer"
                  style={{
                    left: `${position}%`,
                    top: 0,
                    zIndex: 10,
                  }}
                >
                  {/* Pit stop icon - enhanced with flag */}
                  <div
                    className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold whitespace-nowrap"
                    style={{ color: colors.accent.red }}
                  >
                    🏁 L{stop.lap}
                  </div>

                  {/* Thick white vertical line */}
                  <div
                    className="transition-all duration-200 group-hover:w-1.5"
                    style={{
                      height: '70px',
                      width: '4px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      boxShadow: '0 0 4px rgba(255, 255, 255, 0.5)',
                    }}
                  />

                  {/* Strategic hover tooltip for pit stop */}
                  <div
                    className="absolute top-full mt-3 left-1/2 -translate-x-1/2 px-3 py-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20"
                    style={{
                      backgroundColor: 'rgba(26, 31, 46, 0.95)',
                      border: '1px solid #2a3441',
                      minWidth: '260px',
                      maxWidth: '280px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                    }}
                  >
                    <div className="text-xs whitespace-nowrap">
                      {/* Pit stop details */}
                      <div className="font-bold mb-2" style={{ color: colors.accent.red }}>
                        Pit Stop: Lap {stop.lap}
                      </div>

                      {/* Tire change */}
                      <div className="mb-2" style={{ color: colors.text.secondary }}>
                        <div className="flex items-center gap-2">
                          <span style={{ color: getTireColor(previousCompound) }}>{previousCompound}</span>
                          <span>→</span>
                          <span style={{ color: getTireColor(newCompound) }}>{newCompound}</span>
                        </div>
                        <div className="mt-1">Time loss: ~22.2 seconds</div>
                      </div>

                      {/* Strategic context */}
                      <div className="pt-2 border-t space-y-1" style={{ borderColor: '#2a3441', color: colors.text.primary }}>
                        <div>
                          {isOptimalTiming ? '✅' : '⚠️'} Optimal pit window: Laps {prevWindow.min}-{prevWindow.max}
                        </div>
                        <div className="text-xs" style={{ color: colors.text.muted }}>
                          {isOptimalTiming
                            ? 'Good timing - within optimal window'
                            : stop.lap < prevWindow.min
                              ? 'Early stop - tires have more life'
                              : 'Late stop - tires may be degraded'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Simple stint summary below */}
        <div className="text-xs text-center" style={{ color: colors.text.secondary }}>
          {segments.map((segment, index) => {
            const stintLength = segment.end - segment.start + 1;
            return (
              <span key={index}>
                {segment.compound} ({stintLength})
                {index < segments.length - 1 && <span className="mx-2">→</span>}
              </span>
            );
          })}
        </div>

        {/* Error indicator if laps don't match */}
        {uncoveredLaps !== 0 && (
          <div className="mt-3 flex justify-center">
            <div
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: colors.accent.red + '20',
                color: colors.accent.red,
                border: `1px solid ${colors.accent.red}`,
              }}
            >
              ⚠ {Math.abs(uncoveredLaps)} lap{Math.abs(uncoveredLaps) !== 1 ? 's' : ''} {uncoveredLaps > 0 ? 'missing' : 'over'}
            </div>
          </div>
        )}
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
