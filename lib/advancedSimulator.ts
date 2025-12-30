/**
 * Advanced F1 Race Simulator
 *
 * Includes:
 * - Weather conditions and tire-weather interactions
 * - Safety car periods with reduced pit time loss
 * - Tire allocation tracking
 * - Traffic and overtaking difficulty
 * - Enhanced fuel effect modeling
 * - Driver/Team performance modifiers
 */

import {
  Strategy,
  RaceConfiguration,
  SimulationResult,
  LapData,
  PitStop,
  WeatherCondition,
  TireCompound,
  AdvancedRaceConfig,
  TireAllocation,
} from './types';
import { createTireState, ageTire, getWeatherTireMultiplier } from './tireModel';
import { calculateRaceLapTime } from './lapTimeCalculator';
import { createPitStop } from './pitStopModel';
import { getDriverById, getTeamById, getTireDegradationModifier, getPerformanceModifier } from './driverTeamData';

/**
 * Get current weather condition for a given lap
 */
function getWeatherAtLap(lap: number, config: AdvancedRaceConfig): WeatherCondition {
  if (!config.enableWeather) return 'DRY';

  // Find the latest weather change before or at this lap
  let currentWeather = config.initialWeather;
  for (const change of config.weatherChanges) {
    if (change.lap <= lap) {
      currentWeather = change.condition;
    } else {
      break;
    }
  }
  return currentWeather;
}

/**
 * Check if lap is under safety car
 */
function isUnderSafetyCar(lap: number, config: AdvancedRaceConfig): boolean {
  if (!config.enableSafetyCar) return false;

  return config.safetyCarPeriods.some(
    (period) => lap >= period.startLap && lap <= period.endLap
  );
}

/**
 * Get safety car lap time delta
 */
function getSafetyCarDelta(lap: number, config: AdvancedRaceConfig): number {
  if (!config.enableSafetyCar) return 0;

  const period = config.safetyCarPeriods.find(
    (p) => lap >= p.startLap && lap <= p.endLap
  );
  return period ? period.lapTimeDelta : 0;
}

/**
 * Calculate traffic effect on lap time
 */
function getTrafficDelay(
  lapNumber: number,
  config: AdvancedRaceConfig,
  totalLaps: number
): number {
  if (!config.enableTraffic) return 0;

  // Traffic is more of an issue in middle stint (tires worn, fuel still heavy)
  // Less traffic at start and end of race
  const raceProgress = lapNumber / totalLaps;

  // Peak traffic effect between 30-70% race distance
  let trafficMultiplier = 0;
  if (raceProgress >= 0.3 && raceProgress <= 0.7) {
    trafficMultiplier = 1.0;
  } else if (raceProgress < 0.3) {
    trafficMultiplier = (raceProgress - 0.1) / 0.2; // Ramp up
  } else {
    trafficMultiplier = (1.0 - raceProgress) / 0.3; // Ramp down
  }

  trafficMultiplier = Math.max(0, Math.min(1, trafficMultiplier));

  // Scale by overtaking difficulty
  const difficultyFactor = config.overtakingDifficulty / 10;

  return config.trafficTimeLossPerLap * trafficMultiplier * difficultyFactor;
}


/**
 * Track tire usage and check allocation limits
 */
class TireUsageTracker {
  private used: Map<TireCompound, number> = new Map();
  private allocation: TireAllocation;

  constructor(allocation: TireAllocation) {
    this.allocation = allocation;
    this.used.set('SOFT', 0);
    this.used.set('MEDIUM', 0);
    this.used.set('HARD', 0);
    this.used.set('INTERMEDIATE', 0);
    this.used.set('WET', 0);
  }

  useTire(compound: TireCompound): boolean {
    const currentUsed = this.used.get(compound) || 0;
    const available = this.allocation[compound.toLowerCase() as keyof TireAllocation];

    if (currentUsed >= available) {
      return false; // No tires of this compound available
    }

    this.used.set(compound, currentUsed + 1);
    return true;
  }

  getAvailable(compound: TireCompound): number {
    const used = this.used.get(compound) || 0;
    const allocated = this.allocation[compound.toLowerCase() as keyof TireAllocation];
    return allocated - used;
  }

  getUsed(compound: TireCompound): number {
    return this.used.get(compound) || 0;
  }
}

/**
 * Simulate race with advanced features
 */
export function simulateAdvancedRace(
  strategy: Strategy,
  config: RaceConfiguration
): SimulationResult {
  const laps: LapData[] = [];
  const pitStops: PitStop[] = [];
  let currentTire = createTireState(strategy.startingCompound, 0);
  let cumulativeTime = 0;

  const advanced = config.advanced;
  const tireTracker = advanced?.enableTireAllocation
    ? new TireUsageTracker(advanced.tireAllocation)
    : null;

  // Get driver and team performance modifiers
  const driver = config.driverId ? getDriverById(config.driverId) : null;
  const team = config.teamId ? getTeamById(config.teamId) : null;
  const tireDegradationModifier = driver ? getTireDegradationModifier(driver.tireManagementSkill) : 1.0;
  const performanceModifier = (driver && team) ? getPerformanceModifier(driver, team) : 0;
  const pitCrewModifier = team?.pitCrewSpeed || 0;

  // Use starting tire (apply degradation modifier from the start)
  if (tireTracker) {
    tireTracker.useTire(strategy.startingCompound);
  }

  // Apply tire degradation modifier to initial tire state
  currentTire = createTireState(strategy.startingCompound, 0, tireDegradationModifier);

  // Simulate each lap
  for (let lapNumber = 1; lapNumber <= config.totalLaps; lapNumber++) {
    // Check if this is a pit lap
    const pitStopThisLap = strategy.pitStops.find((ps) => ps.lap === lapNumber);
    const isPitLap = !!pitStopThisLap;

    // Get current conditions
    const weather = advanced ? getWeatherAtLap(lapNumber, advanced) : 'DRY';
    const underSC = advanced ? isUnderSafetyCar(lapNumber, advanced) : false;
    const scDelta = advanced ? getSafetyCarDelta(lapNumber, advanced) : 0;
    const trafficDelay = advanced
      ? getTrafficDelay(lapNumber, advanced, config.totalLaps)
      : 0;

    // Calculate base lap time
    let lapTime = calculateRaceLapTime(lapNumber, currentTire, config, isPitLap);

    // Apply team/driver performance modifier (car speed)
    lapTime += performanceModifier;

    // Apply weather effect
    if (advanced?.enableWeather) {
      const weatherMultiplier = getWeatherTireMultiplier(currentTire.compound, weather);
      lapTime *= weatherMultiplier;
    }

    // Apply safety car effect
    if (underSC) {
      lapTime += scDelta;
    }

    // Apply traffic effect
    lapTime += trafficDelay;

    // Enhanced fuel effect
    if (advanced?.enhancedFuelEffect) {
      const currentFuel = calculateFuelLoad(lapNumber, config);
      const fuelPenalty = currentFuel * advanced.fuelEffectPerKg;
      lapTime += fuelPenalty;
    }

    // Update cumulative time
    cumulativeTime += lapTime;

    // Record lap data
    const lapData: LapData = {
      lapNumber,
      lapTime,
      tireCompound: currentTire.compound,
      tireAge: currentTire.age,
      fuelLoad: calculateFuelLoad(lapNumber, config),
      isPitLap,
      pitStopDuration: isPitLap
        ? (underSC && advanced ? advanced.safetyCarPitTimeLoss : config.pitLaneTimeLoss) +
          config.pitStopStationary
        : undefined,
      cumulativeTime,
      weather,
      underSafetyCar: underSC,
      trafficDelay,
    };

    laps.push(lapData);

    // Handle pit stop
    if (pitStopThisLap) {
      // Check tire allocation
      if (tireTracker && !tireTracker.useTire(pitStopThisLap.tireCompound)) {
        console.warn(
          `No ${pitStopThisLap.tireCompound} tires available! Using anyway (allocation violation)`
        );
      }

      const pitTimeLoss = underSC && advanced
        ? advanced.safetyCarPitTimeLoss
        : config.pitLaneTimeLoss;

      // Apply pit crew modifier to stationary time
      const adjustedStationaryTime = Math.max(1.8, config.pitStopStationary + pitCrewModifier);

      const pitStop = createPitStop(
        lapNumber,
        currentTire.compound,
        pitStopThisLap.tireCompound,
        adjustedStationaryTime,
        pitTimeLoss
      );
      pitStops.push(pitStop);

      // Change tires (apply degradation modifier to new tires)
      currentTire = createTireState(pitStopThisLap.tireCompound, 0, tireDegradationModifier);
    } else {
      // Age tires (apply degradation modifier)
      currentTire = ageTire(currentTire, tireDegradationModifier);
    }
  }

  // Calculate statistics
  const lapTimes = laps.filter((lap) => !lap.isPitLap).map((lap) => lap.lapTime);
  const averageLapTime = lapTimes.reduce((sum, time) => sum + time, 0) / lapTimes.length;
  const fastestLap = Math.min(...lapTimes);
  const slowestLap = Math.max(...lapTimes);

  return {
    strategy,
    totalRaceTime: cumulativeTime,
    laps,
    pitStops,
    averageLapTime,
    fastestLap,
    slowestLap,
  };
}

/**
 * Helper: Calculate current fuel load
 */
function calculateFuelLoad(lapNumber: number, config: RaceConfiguration): number {
  const fuelUsed = (lapNumber - 1) * config.fuelPerLap;
  return Math.max(0, config.startingFuelLoad - fuelUsed);
}

/**
 * Create default advanced configuration
 */
export function createDefaultAdvancedConfig(): AdvancedRaceConfig {
  return {
    // Weather
    enableWeather: false,
    initialWeather: 'DRY',
    weatherChanges: [],

    // Safety Car
    enableSafetyCar: false,
    safetyCarPeriods: [],
    safetyCarPitTimeLoss: 10, // Reduced from normal ~20s

    // Tire Allocation
    enableTireAllocation: false,
    tireAllocation: {
      soft: 8,
      medium: 8,
      hard: 8,
      intermediate: 4,
      wet: 4,
    },

    // Traffic
    enableTraffic: false,
    overtakingDifficulty: 5, // 0-10 scale
    trafficTimeLossPerLap: 0.5, // Base half second per lap

    // Enhanced Fuel Effect
    enhancedFuelEffect: false,
    fuelEffectPerKg: 0.04, // 40ms per kg
  };
}

/**
 * Generate random safety car period
 */
export function generateRandomSafetyCarPeriod(totalLaps: number) {
  const startLap = Math.floor(Math.random() * (totalLaps - 10)) + 5;
  const duration = Math.floor(Math.random() * 4) + 3; // 3-6 laps
  const endLap = Math.min(startLap + duration, totalLaps - 2);

  return {
    startLap,
    endLap,
    lapTimeDelta: 30 + Math.random() * 10, // 30-40s slower under SC
  };
}

/**
 * Generate random weather changes
 */
export function generateRandomWeatherChanges(totalLaps: number) {
  const changes: Array<{ lap: number; condition: WeatherCondition }> = [];

  // Chance of rain during race
  if (Math.random() < 0.3) { // 30% chance of rain
    const rainStartLap = Math.floor(Math.random() * (totalLaps - 20)) + 10;
    const rainEndLap = rainStartLap + Math.floor(Math.random() * 15) + 5;

    changes.push({
      lap: rainStartLap,
      condition: Math.random() < 0.5 ? 'LIGHT_RAIN' : 'HEAVY_RAIN',
    });

    if (rainEndLap < totalLaps - 5) {
      changes.push({
        lap: rainEndLap,
        condition: 'MIXED',
      });

      if (rainEndLap + 10 < totalLaps) {
        changes.push({
          lap: rainEndLap + 10,
          condition: 'DRY',
        });
      }
    }
  }

  return changes;
}
