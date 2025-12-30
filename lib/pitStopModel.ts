/**
 * F1 Pit Stop Model
 *
 * Realistic pit stop time calculations:
 * - Stationary time: ~2.0-2.5s (tire change)
 * - Pit lane time loss: ~15-25s (depends on track)
 * - Total time loss: ~17-27.5s
 *
 * Times vary by circuit based on:
 * - Pit lane length
 * - Pit lane speed limit (typically 60-80 km/h)
 * - Entry/exit locations
 */

import { TireCompound, PitStop } from './types';

/**
 * Default pit stop configuration
 * Based on average F1 pit stop times
 */
export const DEFAULT_PIT_STOP_CONFIG = {
  // Stationary time for tire change (seconds)
  minStationaryTime: 2.0,
  maxStationaryTime: 2.5,
  averageStationaryTime: 2.2,

  // Pit lane time loss (seconds) - varies by track
  minPitLaneTimeLoss: 15.0,
  maxPitLaneTimeLoss: 25.0,
  averagePitLaneTimeLoss: 20.0,
};

/**
 * Track-specific pit lane time losses (seconds)
 * Data based on real F1 circuits
 */
export const TRACK_PIT_LANE_TIME_LOSS: Record<string, number> = {
  // Short pit lanes
  'Monaco': 15.0,
  'Zandvoort': 16.5,
  'Hungaroring': 17.0,

  // Medium pit lanes
  'Albert Park': 19.0, // Melbourne
  'Silverstone': 20.0,
  'Suzuka': 20.5,
  'Spa-Francorchamps': 21.0,
  'Monza': 21.5,

  // Long pit lanes
  'Bahrain': 22.0,
  'Shanghai': 22.5,
  'Circuit of the Americas': 23.0,
  'Jeddah': 24.0,
  'Yas Marina': 25.0,

  // Default fallback
  'Default': 20.0,
};

/**
 * Calculate total pit stop time loss
 */
export function calculatePitStopTime(
  stationaryTime: number = DEFAULT_PIT_STOP_CONFIG.averageStationaryTime,
  pitLaneTimeLoss: number = DEFAULT_PIT_STOP_CONFIG.averagePitLaneTimeLoss
): number {
  return stationaryTime + pitLaneTimeLoss;
}

/**
 * Get pit lane time loss for a specific track
 */
export function getPitLaneTimeLoss(trackName: string): number {
  return TRACK_PIT_LANE_TIME_LOSS[trackName] || TRACK_PIT_LANE_TIME_LOSS['Default'];
}

/**
 * Generate a random stationary time within realistic bounds
 * Simulates variation in pit crew performance
 */
export function generateStationaryTime(
  min: number = DEFAULT_PIT_STOP_CONFIG.minStationaryTime,
  max: number = DEFAULT_PIT_STOP_CONFIG.maxStationaryTime
): number {
  return min + Math.random() * (max - min);
}

/**
 * Simulate a pit stop with potential for errors
 * Returns actual time taken
 */
export function simulatePitStop(
  targetTime: number = DEFAULT_PIT_STOP_CONFIG.averageStationaryTime,
  errorProbability: number = 0.05 // 5% chance of slow stop
): number {
  const hasError = Math.random() < errorProbability;

  if (hasError) {
    // Slow stop: 3-5 seconds additional time
    const errorTime = 3 + Math.random() * 2;
    return targetTime + errorTime;
  }

  // Normal stop with small variation
  const variation = (Math.random() - 0.5) * 0.5; // +/- 0.25s
  return targetTime + variation;
}

/**
 * Create a pit stop record
 */
export function createPitStop(
  lap: number,
  fromCompound: TireCompound,
  toCompound: TireCompound,
  stationaryTime: number,
  pitLaneTimeLoss: number
): PitStop {
  return {
    lap,
    fromCompound,
    toCompound,
    duration: stationaryTime + pitLaneTimeLoss,
  };
}

/**
 * Calculate optimal pit window based on tire degradation
 * Returns [earliest, latest] lap numbers
 */
export function calculatePitWindow(
  tireCompound: TireCompound,
  stintStart: number
): [number, number] {
  // Optimal stint lengths (laps)
  const optimalStintLength: Record<TireCompound, number> = {
    SOFT: 20,
    MEDIUM: 30,
    HARD: 45,
    INTERMEDIATE: 35,
    WET: 50,
  };

  const idealStintLength = optimalStintLength[tireCompound];

  // Window is +/- 5 laps from ideal
  const earliest = stintStart + idealStintLength - 5;
  const latest = stintStart + idealStintLength + 5;

  return [earliest, latest];
}

/**
 * Determine if a pit stop is necessary based on tire age
 */
export function isPitStopRequired(
  tireAge: number,
  compound: TireCompound,
  lapsRemaining: number
): boolean {
  const maxStintLength: Record<TireCompound, number> = {
    SOFT: 30,   // Absolute maximum before critical degradation
    MEDIUM: 40,
    HARD: 55,
    INTERMEDIATE: 45,
    WET: 60,
  };

  // Must pit if tire is beyond maximum age
  if (tireAge >= maxStintLength[compound]) {
    return true;
  }

  // Must pit if tire can't last until race end
  if (tireAge + lapsRemaining > maxStintLength[compound]) {
    return true;
  }

  return false;
}

/**
 * Calculate time gained/lost from a pit stop strategy
 * Negative value means time gained
 */
export function calculatePitStopCostBenefit(
  currentTireAge: number,
  currentCompound: TireCompound,
  lapsUntilPit: number,
  newCompound: TireCompound,
  baseLapTime: number,
  pitStopTimeLoss: number
): number {
  // Simplified calculation:
  // Cost = pit stop time loss
  // Benefit = tire time savings over stint

  // This is a placeholder for more complex analysis
  // Real implementation would factor in tire deg curves

  return pitStopTimeLoss; // Just the time loss for now
}

/**
 * Get recommended pit stop strategies for a race
 */
export function getRecommendedStrategies(
  totalLaps: number,
  trackName: string = 'Default'
): Array<{
  name: string;
  description: string;
  stops: number;
  compounds: TireCompound[];
}> {
  return [
    {
      name: 'One-Stop: Medium-Hard',
      description: 'Conservative strategy with one stop',
      stops: 1,
      compounds: ['MEDIUM', 'HARD'],
    },
    {
      name: 'One-Stop: Soft-Medium',
      description: 'Aggressive start, conservative finish',
      stops: 1,
      compounds: ['SOFT', 'MEDIUM'],
    },
    {
      name: 'Two-Stop: Soft-Medium-Soft',
      description: 'Aggressive strategy with pace advantage',
      stops: 2,
      compounds: ['SOFT', 'MEDIUM', 'SOFT'],
    },
    {
      name: 'Two-Stop: Medium-Medium-Medium',
      description: 'Balanced two-stop strategy',
      stops: 2,
      compounds: ['MEDIUM', 'MEDIUM', 'MEDIUM'],
    },
    {
      name: 'Three-Stop: Soft-Soft-Soft-Soft',
      description: 'Ultra-aggressive maximum pace strategy',
      stops: 3,
      compounds: ['SOFT', 'SOFT', 'SOFT', 'SOFT'],
    },
  ];
}
