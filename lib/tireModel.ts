/**
 * F1 Tire Degradation Model
 *
 * Based on realistic F1 tire characteristics:
 * - Soft: Fastest but degrades quickly (~15-25 laps optimal)
 * - Medium: Balanced performance (~25-35 laps optimal)
 * - Hard: Slowest but most durable (~35-50 laps optimal)
 * - Intermediate: For light rain conditions
 * - Wet: For heavy rain conditions
 */

import { TireCompound, TireCompoundData, TireState, WeatherCondition } from './types';

/**
 * Tire compound characteristics
 * Values calibrated to match real F1 performance differences
 */
export const TIRE_COMPOUNDS: Record<TireCompound, TireCompoundData> = {
  SOFT: {
    name: 'SOFT',
    baseGripLevel: 1.0, // Fastest - baseline
    degradationRate: 0.045, // ~4.5% per lap - wears quickly
    optimalLapRange: [0, 20], // Best performance in first 20 laps
    color: '#FF0000', // Red
  },
  MEDIUM: {
    name: 'MEDIUM',
    baseGripLevel: 0.97, // ~0.3s slower per lap than soft
    degradationRate: 0.025, // ~2.5% per lap - moderate wear
    optimalLapRange: [0, 30], // Best performance in first 30 laps
    color: '#FFD700', // Yellow/Gold
  },
  HARD: {
    name: 'HARD',
    baseGripLevel: 0.94, // ~0.6s slower per lap than soft
    degradationRate: 0.015, // ~1.5% per lap - minimal wear
    optimalLapRange: [0, 45], // Best performance in first 45 laps
    color: '#FFFFFF', // White
  },
  INTERMEDIATE: {
    name: 'INTERMEDIATE',
    baseGripLevel: 0.88, // Slower in wet than slicks in dry, but grips in light rain
    degradationRate: 0.02, // ~2% per lap - moderate wear
    optimalLapRange: [0, 35], // Can last a while in wet conditions
    color: '#00FF00', // Green
  },
  WET: {
    name: 'WET',
    baseGripLevel: 0.82, // Slowest but necessary in heavy rain
    degradationRate: 0.01, // ~1% per lap - minimal wear (water cooling)
    optimalLapRange: [0, 50], // Very durable in wet
    color: '#0000FF', // Blue
  },
};

/**
 * Calculate tire performance factor based on age and compound
 * Returns a multiplier for lap time (1.0 = no penalty, >1.0 = slower)
 */
export function calculateTirePerformance(tireState: TireState): number {
  const compound = TIRE_COMPOUNDS[tireState.compound];

  // Base performance from compound
  const basePerformance = compound.baseGripLevel;

  // Calculate degradation effect
  // Degradation accelerates non-linearly (exponential wear)
  const degradationFactor = Math.pow(1 + compound.degradationRate, tireState.age);

  // Cliff effect - performance drops dramatically after optimal range
  const [optimalStart, optimalEnd] = compound.optimalLapRange;
  let cliffMultiplier = 1.0;

  if (tireState.age > optimalEnd) {
    // Beyond optimal range, performance degrades faster
    const lapsOverLimit = tireState.age - optimalEnd;
    cliffMultiplier = 1 + (lapsOverLimit * 0.02); // 2% additional penalty per lap over limit
  }

  // Combine factors: lower grip + degradation + cliff = slower lap times
  // Invert basePerformance since lower grip = slower (higher time multiplier)
  const performanceMultiplier = (1 / basePerformance) * degradationFactor * cliffMultiplier;

  return performanceMultiplier;
}

/**
 * Calculate tire degradation level (0-1 scale)
 */
export function calculateTireDegradation(
  compound: TireCompound,
  age: number,
  degradationMultiplier: number = 1.0
): number {
  const compoundData = TIRE_COMPOUNDS[compound];
  const degradation = Math.min(1.0, age * compoundData.degradationRate * degradationMultiplier);
  return degradation;
}

/**
 * Get tire performance penalty in seconds for a given base lap time
 */
export function getTireTimePenalty(
  baseLapTime: number,
  tireState: TireState
): number {
  const performanceMultiplier = calculateTirePerformance(tireState);
  const penaltySeconds = baseLapTime * (performanceMultiplier - 1);
  return penaltySeconds;
}

/**
 * Create a new tire state
 */
export function createTireState(
  compound: TireCompound,
  age: number = 0,
  degradationMultiplier: number = 1.0
): TireState {
  return {
    compound,
    age,
    degradation: calculateTireDegradation(compound, age, degradationMultiplier),
  };
}

/**
 * Age tire by one lap
 */
export function ageTire(tireState: TireState, degradationMultiplier: number = 1.0): TireState {
  const newAge = tireState.age + 1;
  return {
    ...tireState,
    age: newAge,
    degradation: calculateTireDegradation(tireState.compound, newAge, degradationMultiplier),
  };
}

/**
 * Get recommended stint length for a compound (laps)
 */
export function getRecommendedStintLength(compound: TireCompound): number {
  const [, optimalEnd] = TIRE_COMPOUNDS[compound].optimalLapRange;
  return optimalEnd;
}

/**
 * Compare two tire compounds - returns expected time difference per lap
 * Positive value means compound1 is slower
 */
export function compareTireCompounds(
  compound1: TireCompound,
  compound2: TireCompound,
  baseLapTime: number,
  age: number = 0
): number {
  const tire1 = createTireState(compound1, age);
  const tire2 = createTireState(compound2, age);

  const penalty1 = getTireTimePenalty(baseLapTime, tire1);
  const penalty2 = getTireTimePenalty(baseLapTime, tire2);

  return penalty1 - penalty2;
}

/**
 * Get weather-specific tire performance multiplier
 * Returns time penalty multiplier based on tire-weather mismatch
 */
export function getWeatherTireMultiplier(
  compound: TireCompound,
  weather: WeatherCondition
): number {
  // Dry weather
  if (weather === 'DRY') {
    if (compound === 'INTERMEDIATE') return 1.15; // Inters 15% slower in dry
    if (compound === 'WET') return 1.25; // Wets 25% slower in dry
    return 1.0; // Slicks optimal in dry
  }

  // Light rain
  if (weather === 'LIGHT_RAIN') {
    if (compound === 'SOFT' || compound === 'MEDIUM' || compound === 'HARD') {
      return 1.3; // Slicks 30% slower in light rain (dangerous)
    }
    if (compound === 'INTERMEDIATE') return 1.0; // Inters optimal in light rain
    if (compound === 'WET') return 1.08; // Wets 8% slower than inters in light rain
    return 1.0;
  }

  // Heavy rain
  if (weather === 'HEAVY_RAIN') {
    if (compound === 'SOFT' || compound === 'MEDIUM' || compound === 'HARD') {
      return 1.5; // Slicks 50% slower in heavy rain (very dangerous)
    }
    if (compound === 'INTERMEDIATE') return 1.12; // Inters 12% slower in heavy rain
    if (compound === 'WET') return 1.0; // Wets optimal in heavy rain
    return 1.0;
  }

  // Mixed conditions
  if (weather === 'MIXED') {
    if (compound === 'SOFT' || compound === 'MEDIUM' || compound === 'HARD') {
      return 1.2; // Slicks 20% slower in mixed
    }
    if (compound === 'INTERMEDIATE') return 1.05; // Inters good in mixed
    if (compound === 'WET') return 1.1; // Wets 10% slower in mixed
    return 1.0;
  }

  return 1.0;
}

/**
 * Check if tire compound is suitable for weather conditions
 */
export function isTireSuitableForWeather(
  compound: TireCompound,
  weather: WeatherCondition
): boolean {
  if (weather === 'DRY') {
    return compound === 'SOFT' || compound === 'MEDIUM' || compound === 'HARD';
  }
  if (weather === 'LIGHT_RAIN' || weather === 'MIXED') {
    return compound === 'INTERMEDIATE' || compound === 'WET';
  }
  if (weather === 'HEAVY_RAIN') {
    return compound === 'WET' || compound === 'INTERMEDIATE';
  }
  return true;
}
