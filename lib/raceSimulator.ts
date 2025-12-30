/**
 * F1 Race Strategy Simulator
 *
 * Simulates a complete race with different pit stop strategies
 * and compares the results to find optimal strategy.
 */

import {
  Strategy,
  RaceConfiguration,
  SimulationResult,
  LapData,
  TireCompound,
  ComparisonResult,
  PitStop,
} from './types';
import { createTireState, ageTire } from './tireModel';
import { calculateRaceLapTime } from './lapTimeCalculator';
import { createPitStop, getPitLaneTimeLoss } from './pitStopModel';
import { getDriverById, getTeamById, getTireDegradationModifier, getPerformanceModifier } from './driverTeamData';

/**
 * Simulate a complete race with a given strategy
 */
export function simulateRace(
  strategy: Strategy,
  config: RaceConfiguration
): SimulationResult {
  const laps: LapData[] = [];
  const pitStops: PitStop[] = [];

  // Get driver and team performance modifiers
  const driver = config.driverId ? getDriverById(config.driverId) : null;
  const team = config.teamId ? getTeamById(config.teamId) : null;
  const tireDegradationModifier = driver ? getTireDegradationModifier(driver.tireManagementSkill) : 1.0;
  const performanceModifier = (driver && team) ? getPerformanceModifier(driver, team) : 0;
  const pitCrewModifier = team?.pitCrewSpeed || 0;

  let currentTire = createTireState(strategy.startingCompound, 0, tireDegradationModifier);
  let cumulativeTime = 0;

  // Simulate each lap
  for (let lapNumber = 1; lapNumber <= config.totalLaps; lapNumber++) {
    // Check if this is a pit lap
    const pitStopThisLap = strategy.pitStops.find((ps) => ps.lap === lapNumber);
    const isPitLap = !!pitStopThisLap;

    // Calculate lap time
    let lapTime = calculateRaceLapTime(
      lapNumber,
      currentTire,
      config,
      isPitLap
    );

    // Apply team/driver performance modifier
    lapTime += performanceModifier;

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
        ? config.pitLaneTimeLoss + config.pitStopStationary
        : undefined,
      cumulativeTime,
    };

    laps.push(lapData);

    // Handle pit stop
    if (pitStopThisLap) {
      // Apply pit crew modifier to stationary time
      const adjustedStationaryTime = Math.max(1.8, config.pitStopStationary + pitCrewModifier);

      const pitStop = createPitStop(
        lapNumber,
        currentTire.compound,
        pitStopThisLap.tireCompound,
        adjustedStationaryTime,
        config.pitLaneTimeLoss
      );
      pitStops.push(pitStop);

      // Change tires (apply degradation modifier)
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
 * Compare multiple strategies and find the optimal one
 */
export function compareStrategies(
  strategies: Strategy[],
  config: RaceConfiguration
): ComparisonResult {
  // Simulate all strategies
  const results = strategies.map((strategy) => simulateRace(strategy, config));

  // Find winner (fastest total time)
  const winner = results.reduce((fastest, current) =>
    current.totalRaceTime < fastest.totalRaceTime ? current : fastest
  );

  // Calculate time differences
  const timeDifferences = new Map<string, number>();
  results.forEach((result) => {
    const delta = result.totalRaceTime - winner.totalRaceTime;
    timeDifferences.set(result.strategy.name, delta);
  });

  return {
    strategies: results,
    winner,
    timeDifferences,
  };
}

/**
 * Create a default race configuration
 */
export function createDefaultRaceConfig(
  trackName: string = 'Default',
  totalLaps: number = 58
): RaceConfiguration {
  return {
    trackName,
    baseLapTime: 90.0, // 1:30.000 - typical F1 lap time
    totalLaps,
    pitLaneTimeLoss: getPitLaneTimeLoss(trackName),
    pitStopStationary: 2.2, // average pit stop
    startingFuelLoad: 110, // kg - full tank
    fuelPerLap: 1.9, // kg - typical consumption
    fuelEffect: 0.035, // seconds per kg
  };
}

/**
 * Create predefined strategy templates
 */
export function createStrategyTemplates(totalLaps: number): Strategy[] {
  const oneStopLap = Math.floor(totalLaps / 2);
  const twoStopLap1 = Math.floor(totalLaps / 3);
  const twoStopLap2 = Math.floor((totalLaps * 2) / 3);
  const threeStopLap1 = Math.floor(totalLaps / 4);
  const threeStopLap2 = Math.floor(totalLaps / 2);
  const threeStopLap3 = Math.floor((totalLaps * 3) / 4);

  return [
    // One-stop strategies
    {
      name: 'One-Stop: Medium → Hard',
      pitStops: [{ lap: oneStopLap, tireCompound: 'HARD' }],
      startingCompound: 'MEDIUM',
    },
    {
      name: 'One-Stop: Soft → Medium',
      pitStops: [{ lap: oneStopLap - 5, tireCompound: 'MEDIUM' }],
      startingCompound: 'SOFT',
    },
    {
      name: 'One-Stop: Soft → Hard',
      pitStops: [{ lap: oneStopLap - 5, tireCompound: 'HARD' }],
      startingCompound: 'SOFT',
    },

    // Two-stop strategies
    {
      name: 'Two-Stop: Soft → Medium → Soft',
      pitStops: [
        { lap: twoStopLap1, tireCompound: 'MEDIUM' },
        { lap: twoStopLap2, tireCompound: 'SOFT' },
      ],
      startingCompound: 'SOFT',
    },
    {
      name: 'Two-Stop: Medium → Medium → Medium',
      pitStops: [
        { lap: twoStopLap1, tireCompound: 'MEDIUM' },
        { lap: twoStopLap2, tireCompound: 'MEDIUM' },
      ],
      startingCompound: 'MEDIUM',
    },
    {
      name: 'Two-Stop: Soft → Soft → Medium',
      pitStops: [
        { lap: twoStopLap1 - 5, tireCompound: 'SOFT' },
        { lap: twoStopLap2 - 5, tireCompound: 'MEDIUM' },
      ],
      startingCompound: 'SOFT',
    },

    // Three-stop strategy (aggressive)
    {
      name: 'Three-Stop: Soft → Soft → Soft → Soft',
      pitStops: [
        { lap: threeStopLap1, tireCompound: 'SOFT' },
        { lap: threeStopLap2, tireCompound: 'SOFT' },
        { lap: threeStopLap3, tireCompound: 'SOFT' },
      ],
      startingCompound: 'SOFT',
    },
  ];
}

/**
 * Helper: Calculate current fuel load
 */
function calculateFuelLoad(lapNumber: number, config: RaceConfiguration): number {
  const fuelUsed = (lapNumber - 1) * config.fuelPerLap;
  return Math.max(0, config.startingFuelLoad - fuelUsed);
}

/**
 * Optimize strategy by testing different pit stop lap combinations
 */
export function optimizeStrategy(
  baseStrategy: Strategy,
  config: RaceConfiguration,
  searchRange: number = 5
): Strategy {
  let bestStrategy = baseStrategy;
  let bestTime = simulateRace(baseStrategy, config).totalRaceTime;

  // Try variations of pit stop laps
  const variations = generateStrategyVariations(baseStrategy, searchRange);

  for (const variation of variations) {
    const result = simulateRace(variation, config);
    if (result.totalRaceTime < bestTime) {
      bestTime = result.totalRaceTime;
      bestStrategy = variation;
    }
  }

  return bestStrategy;
}

/**
 * Generate strategy variations by adjusting pit stop laps
 */
function generateStrategyVariations(
  strategy: Strategy,
  range: number
): Strategy[] {
  const variations: Strategy[] = [];

  // Single pit stop: vary by +/- range laps
  if (strategy.pitStops.length === 1) {
    for (let offset = -range; offset <= range; offset++) {
      if (offset === 0) continue;
      const newLap = strategy.pitStops[0].lap + offset;
      if (newLap < 5 || newLap > 100) continue;

      variations.push({
        ...strategy,
        name: `${strategy.name} (Lap ${newLap})`,
        pitStops: [{ ...strategy.pitStops[0], lap: newLap }],
      });
    }
  }

  // Two stops: vary each independently
  if (strategy.pitStops.length === 2) {
    for (let offset1 = -range; offset1 <= range; offset1++) {
      for (let offset2 = -range; offset2 <= range; offset2++) {
        if (offset1 === 0 && offset2 === 0) continue;

        const newLap1 = strategy.pitStops[0].lap + offset1;
        const newLap2 = strategy.pitStops[1].lap + offset2;

        if (newLap1 < 5 || newLap2 < newLap1 + 5 || newLap2 > 100) continue;

        variations.push({
          ...strategy,
          name: `${strategy.name} (Laps ${newLap1}, ${newLap2})`,
          pitStops: [
            { ...strategy.pitStops[0], lap: newLap1 },
            { ...strategy.pitStops[1], lap: newLap2 },
          ],
        });
      }
    }
  }

  return variations;
}

/**
 * Get a quick summary of simulation results
 */
export function getSimulationSummary(result: SimulationResult): string {
  const minutes = Math.floor(result.totalRaceTime / 60);
  const seconds = (result.totalRaceTime % 60).toFixed(3);

  return `
Strategy: ${result.strategy.name}
Total Race Time: ${minutes}:${seconds.padStart(6, '0')}
Pit Stops: ${result.pitStops.length}
Average Lap: ${result.averageLapTime.toFixed(3)}s
Fastest Lap: ${result.fastestLap.toFixed(3)}s
Slowest Lap: ${result.slowestLap.toFixed(3)}s
  `.trim();
}

/**
 * Export simulation results to JSON
 */
export function exportSimulationResults(results: ComparisonResult): string {
  return JSON.stringify(
    {
      winner: results.winner.strategy.name,
      winningTime: results.winner.totalRaceTime,
      strategies: results.strategies.map((result) => ({
        name: result.strategy.name,
        totalTime: result.totalRaceTime,
        delta: results.timeDifferences.get(result.strategy.name),
        pitStops: result.pitStops.length,
        averageLap: result.averageLapTime,
      })),
    },
    null,
    2
  );
}
