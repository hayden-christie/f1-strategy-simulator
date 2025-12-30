/**
 * Optimal Strategy Generator
 * Generates recommended strategies based on race characteristics
 */

import { Strategy, TireCompound } from './types';

export interface StrategyTemplate {
  name: string;
  description: string;
  pitStops: number;
  compounds: TireCompound[];
}

/**
 * Generate optimal strategy suggestions for a race
 */
export function generateOptimalStrategies(totalLaps: number, raceName: string): Strategy[] {
  const strategies: Strategy[] = [];

  // Determine optimal pit stop windows
  const oneStopWindow = Math.floor(totalLaps / 2);
  const twoStopWindow1 = Math.floor(totalLaps / 3);
  const twoStopWindow2 = Math.floor((totalLaps * 2) / 3);

  // Strategy 1: Conservative One-Stop (Medium → Hard)
  strategies.push({
    name: 'Optimal One-Stop (M-H)',
    startingCompound: 'MEDIUM',
    pitStops: [
      {
        lap: oneStopWindow,
        tireCompound: 'HARD',
      },
    ],
  });

  // Strategy 2: Aggressive One-Stop (Soft → Medium)
  if (totalLaps <= 60) {
    strategies.push({
      name: 'Optimal One-Stop (S-M)',
      startingCompound: 'SOFT',
      pitStops: [
        {
          lap: Math.max(15, oneStopWindow - 10),
          tireCompound: 'MEDIUM',
        },
      ],
    });
  }

  // Strategy 3: Balanced Two-Stop (Soft → Medium → Soft)
  strategies.push({
    name: 'Optimal Two-Stop (S-M-S)',
    startingCompound: 'SOFT',
    pitStops: [
      {
        lap: twoStopWindow1,
        tireCompound: 'MEDIUM',
      },
      {
        lap: twoStopWindow2,
        tireCompound: 'SOFT',
      },
    ],
  });

  // Strategy 4: Alternative Two-Stop for high degradation tracks
  if (isHighDegradationTrack(raceName)) {
    strategies.push({
      name: 'Optimal Two-Stop (M-M-M)',
      startingCompound: 'MEDIUM',
      pitStops: [
        {
          lap: twoStopWindow1,
          tireCompound: 'MEDIUM',
        },
        {
          lap: twoStopWindow2,
          tireCompound: 'MEDIUM',
        },
      ],
    });
  }

  return strategies;
}

/**
 * Determine if a track has high tire degradation
 */
function isHighDegradationTrack(raceName: string): boolean {
  const highDegTracks = [
    'Bahrain Grand Prix',
    'Spanish Grand Prix',
    'British Grand Prix',
    'Hungarian Grand Prix',
    'Singapore Grand Prix',
    'United States Grand Prix',
    'Abu Dhabi Grand Prix',
  ];

  return highDegTracks.some((track) => raceName.includes(track));
}

/**
 * Get recommended starting compound based on grid position
 * (for future enhancement - qualifying position strategy)
 */
export function getRecommendedStartingCompound(
  gridPosition: number
): TireCompound {
  // Front runners can afford softer compounds
  if (gridPosition <= 3) {
    return 'SOFT';
  }
  // Midfield benefits from medium
  if (gridPosition <= 10) {
    return 'MEDIUM';
  }
  // Back markers often benefit from alternative strategies
  return 'HARD';
}

/**
 * Calculate optimal pit window for a compound
 */
export function calculatePitWindow(
  compound: TireCompound,
  totalLaps: number
): [number, number] {
  const optimalStintLength: Record<TireCompound, number> = {
    SOFT: 20,
    MEDIUM: 30,
    HARD: 45,
    INTERMEDIATE: 35,
    WET: 50,
  };

  const ideal = optimalStintLength[compound];

  // Window is ±5 laps from ideal
  const earliest = Math.max(10, ideal - 5);
  const latest = Math.min(totalLaps - 5, ideal + 5);

  return [earliest, latest];
}

/**
 * Validate if a strategy is feasible
 */
export function isStrategyFeasible(
  strategy: Strategy,
  totalLaps: number
): { valid: boolean; reason?: string } {
  // Check if pit stops are in valid range
  for (const stop of strategy.pitStops) {
    if (stop.lap < 1 || stop.lap >= totalLaps) {
      return {
        valid: false,
        reason: `Pit stop on lap ${stop.lap} is outside valid range (1-${totalLaps - 1})`,
      };
    }
  }

  // Check if pit stops are in order
  const sortedStops = [...strategy.pitStops].sort((a, b) => a.lap - b.lap);
  for (let i = 0; i < sortedStops.length - 1; i++) {
    if (sortedStops[i + 1].lap - sortedStops[i].lap < 5) {
      return {
        valid: false,
        reason: `Pit stops must be at least 5 laps apart`,
      };
    }
  }

  // Check stint lengths
  const stintLengths: number[] = [];
  let currentLap = 0;

  for (const stop of sortedStops) {
    stintLengths.push(stop.lap - currentLap);
    currentLap = stop.lap;
  }
  stintLengths.push(totalLaps - currentLap);

  const maxStintLength: Record<TireCompound, number> = {
    SOFT: 30,
    MEDIUM: 45,
    HARD: 60,
    INTERMEDIATE: 50,
    WET: 65,
  };

  // Check if any stint is too long for its compound
  let currentCompound = strategy.startingCompound;
  for (let i = 0; i < stintLengths.length; i++) {
    if (stintLengths[i] > maxStintLength[currentCompound]) {
      return {
        valid: false,
        reason: `Stint ${i + 1} (${stintLengths[i]} laps) exceeds maximum for ${currentCompound} tires (${maxStintLength[currentCompound]} laps)`,
      };
    }

    if (i < sortedStops.length) {
      currentCompound = sortedStops[i].tireCompound;
    }
  }

  return { valid: true };
}
