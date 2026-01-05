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
        <div className="relative mb-2">
          <div
            className="relative"
            style={{
              height: '70px',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            {/* Simple tire segments */}
            <div className="relative h-full flex">
              {segments.map((segment, index) => {
                const stintLength = segment.end - segment.start + 1;
                const baseColor = getTireColor(segment.compound);

                return (
                  <div
                    key={index}
                    className="relative h-full flex items-center justify-center"
                    style={{
                      width: `${segment.width}%`,
                      backgroundColor: baseColor,
                      borderTopLeftRadius: index === 0 ? '8px' : '0',
                      borderBottomLeftRadius: index === 0 ? '8px' : '0',
                      borderTopRightRadius: index === segments.length - 1 ? '8px' : '0',
                      borderBottomRightRadius: index === segments.length - 1 ? '8px' : '0',
                    }}
                  >
                    {/* Tire compound letter inside segment */}
                    <div className="text-lg font-bold" style={{
                      color: segment.compound === 'HARD' ? '#1a1f2e' : colors.text.inverse,
                    }}>
                      {getTireLabel(segment.compound)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* OBVIOUS pit stop markers - thick lines with icons and lap numbers */}
            {strategy.pitStops.map((stop, index) => {
              const position = (stop.lap / totalLaps) * 100;

              return (
                <div
                  key={index}
                  className="absolute -translate-x-1/2"
                  style={{
                    left: `${position}%`,
                    top: 0,
                    zIndex: 10,
                  }}
                >
                  {/* Pit stop icon above the line */}
                  <div
                    className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold whitespace-nowrap"
                    style={{ color: colors.accent.red }}
                  >
                    🏁 L{stop.lap}
                  </div>
                  {/* Thick white vertical line */}
                  <div
                    style={{
                      height: '70px',
                      width: '4px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      boxShadow: '0 0 4px rgba(255, 255, 255, 0.5)',
                    }}
                  />
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
