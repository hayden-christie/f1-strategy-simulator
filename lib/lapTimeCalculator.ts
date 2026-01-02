/**
 * F1 Lap Time Calculator
 *
 * Calculates realistic lap times based on:
 * - Base lap time (clean air, new tires, light fuel)
 * - Tire compound and age
 * - Fuel load effect
 * - Track conditions
 */

import { TireState, RaceConfiguration } from './types';
import { getTireTimePenalty } from './tireModel';

/**
 * Calculate fuel load effect on lap time
 *
 * Rule of thumb in F1: ~0.03-0.035s per kg of fuel
 * A full fuel load is ~110kg, giving ~3.3-3.85s penalty at race start
 */
export function calculateFuelEffect(
  fuelLoad: number,
  fuelEffectPerKg: number = 0.035
): number {
  return fuelLoad * fuelEffectPerKg;
}

/**
 * Calculate the current fuel load based on lap number
 */
export function getCurrentFuelLoad(
  lapNumber: number,
  startingFuel: number,
  fuelPerLap: number
): number {
  const fuelUsed = (lapNumber - 1) * fuelPerLap;
  const currentFuel = Math.max(0, startingFuel - fuelUsed);
  return currentFuel;
}

/**
 * Calculate complete lap time including all factors
 */
export function calculateLapTime(
  baseLapTime: number,
  tireState: TireState,
  fuelLoad: number,
  config: Pick<RaceConfiguration, 'fuelEffect'>
): number {
  // Start with base lap time
  let lapTime = baseLapTime;

  // Add tire degradation penalty
  const tirePenalty = getTireTimePenalty(baseLapTime, tireState);
  lapTime += tirePenalty;

  // Add fuel load effect
  const fuelPenalty = calculateFuelEffect(fuelLoad, config.fuelEffect);
  lapTime += fuelPenalty;

  return lapTime;
}

/**
 * Calculate lap time for a specific lap in the race
 */
export function calculateRaceLapTime(
  lapNumber: number,
  tireState: TireState,
  config: RaceConfiguration,
  isPitLap: boolean = false
): number {
  // Calculate current fuel load
  const fuelLoad = getCurrentFuelLoad(
    lapNumber,
    config.startingFuelLoad,
    config.fuelPerLap
  );

  // Calculate normal lap time
  const lapTime = calculateLapTime(
    config.baseLapTime,
    tireState,
    fuelLoad,
    config
  );

  // Add pit stop time loss if this is a pit lap
  if (isPitLap) {
    return lapTime + config.pitLaneTimeLoss + config.pitStopStationary;
  }

  return lapTime;
}

/**
 * Estimate lap time delta between two tire compounds at a given age
 */
export function estimateTireCompoundDelta(
  baseLapTime: number,
  tire1: TireState,
  tire2: TireState,
  fuelLoad: number,
  config: Pick<RaceConfiguration, 'fuelEffect'>
): number {
  const time1 = calculateLapTime(baseLapTime, tire1, fuelLoad, config);
  const time2 = calculateLapTime(baseLapTime, tire2, fuelLoad, config);
  return time1 - time2;
}

/**
 * Calculate time lost in pit stops
 * Includes both stationary time and pit lane time loss
 */
export function calculatePitStopTimeLoss(
  pitLaneTimeLoss: number,
  stationaryTime: number
): number {
  return pitLaneTimeLoss + stationaryTime;
}

/**
 * Format lap time in F1 standard format: M:SS.sss or SS.sss
 * - For times >= 1 minute: M:SS.sss (e.g., "1:28.432")
 * - For times < 1 minute: SS.sss (e.g., "54.231")
 */
export function formatLapTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (minutes > 0) {
    return `${minutes}:${secs.toFixed(3).padStart(6, '0')}`;
  }
  // For times under 1 minute, show just seconds
  return secs.toFixed(3);
}

/**
 * Format total race time in F1 standard format: H:MM:SS.sss
 * - Always shows 3 decimal places for milliseconds
 * - Example: "2:01:20.532" for a 2-hour race
 */
export function formatRaceTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toFixed(3).padStart(6, '0')}`;
  }
  // For times under 1 hour, show minutes:seconds
  return `${minutes}:${secs.toFixed(3).padStart(6, '0')}`;
}

/**
 * Convert seconds to F1 delta format with sign (e.g., "+1.234s" or "-0.500s")
 * - Negative means faster (better)
 * - Positive means slower (worse)
 */
export function formatTimeDelta(seconds: number): string {
  const sign = seconds >= 0 ? '+' : '';
  return `${sign}${seconds.toFixed(3)}s`;
}

/**
 * Get color class for time delta (green for faster, red for slower)
 * - Negative delta (faster): green
 * - Positive delta (slower): red
 * - Zero: neutral
 */
export function getTimeDeltaColor(delta: number): string {
  if (delta < 0) return 'text-[#10b981]'; // Green (faster/better)
  if (delta > 0) return 'text-[#ef4444]'; // Red (slower/worse)
  return 'text-[#999999]'; // Neutral gray
}

/**
 * Calculate average lap time from a set of lap times
 */
export function calculateAverageLapTime(lapTimes: number[]): number {
  if (lapTimes.length === 0) return 0;
  const sum = lapTimes.reduce((acc, time) => acc + time, 0);
  return sum / lapTimes.length;
}

/**
 * Find fastest lap from a set of lap times
 */
export function findFastestLap(lapTimes: number[]): number {
  if (lapTimes.length === 0) return 0;
  return Math.min(...lapTimes);
}

/**
 * Find slowest lap from a set of lap times
 */
export function findSlowestLap(lapTimes: number[]): number {
  if (lapTimes.length === 0) return 0;
  return Math.max(...lapTimes);
}
