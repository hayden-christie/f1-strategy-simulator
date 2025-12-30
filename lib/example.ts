/**
 * F1 Strategy Simulator - Example Usage
 *
 * This file demonstrates how to use the simulation engine
 * to analyze different race strategies.
 */

import {
  createDefaultRaceConfig,
  createStrategyTemplates,
  compareStrategies,
  simulateRace,
  formatRaceTime,
  formatTimeDelta,
  type Strategy,
  type RaceConfiguration,
} from './index';

/**
 * Example 1: Compare predefined strategies for a typical race
 */
export function exampleBasicComparison() {
  console.log('=== Example 1: Basic Strategy Comparison ===\n');

  // Create a race configuration (Monaco GP - 78 laps)
  const raceConfig: RaceConfiguration = {
    trackName: 'Monaco',
    baseLapTime: 72.5, // 1:12.500
    totalLaps: 78,
    pitLaneTimeLoss: 15.0, // Monaco has short pit lane
    pitStopStationary: 2.2,
    startingFuelLoad: 110,
    fuelPerLap: 1.4, // Lower consumption on slow track
    fuelEffect: 0.035,
  };

  // Create strategy templates
  const strategies = createStrategyTemplates(raceConfig.totalLaps);

  // Compare all strategies
  const comparison = compareStrategies(strategies, raceConfig);

  // Display results
  console.log('Race Configuration:');
  console.log(`  Track: ${raceConfig.trackName}`);
  console.log(`  Total Laps: ${raceConfig.totalLaps}`);
  console.log(`  Base Lap Time: ${raceConfig.baseLapTime}s\n`);

  console.log('Results (sorted by total time):');
  const sortedResults = [...comparison.strategies].sort(
    (a, b) => a.totalRaceTime - b.totalRaceTime
  );

  sortedResults.forEach((result, index) => {
    const delta = comparison.timeDifferences.get(result.strategy.name) || 0;
    const isWinner = index === 0;

    console.log(`${index + 1}. ${result.strategy.name}`);
    console.log(`   Total Time: ${formatRaceTime(result.totalRaceTime)} ${isWinner ? '🏆' : formatTimeDelta(delta)}`);
    console.log(`   Pit Stops: ${result.pitStops.length}`);
    console.log(`   Average Lap: ${result.averageLapTime.toFixed(3)}s`);
    console.log(`   Fastest Lap: ${result.fastestLap.toFixed(3)}s\n`);
  });

  return comparison;
}

/**
 * Example 2: Analyze a specific strategy in detail
 */
export function exampleDetailedAnalysis() {
  console.log('=== Example 2: Detailed Strategy Analysis ===\n');

  // Create race config for Bahrain GP
  const raceConfig = createDefaultRaceConfig('Bahrain', 57);

  // Define a specific strategy
  const strategy: Strategy = {
    name: 'Two-Stop: Soft → Medium → Soft',
    startingCompound: 'SOFT',
    pitStops: [
      { lap: 18, tireCompound: 'MEDIUM' },
      { lap: 38, tireCompound: 'SOFT' },
    ],
  };

  // Simulate the race
  const result = simulateRace(strategy, raceConfig);

  console.log(`Strategy: ${result.strategy.name}`);
  console.log(`Total Race Time: ${formatRaceTime(result.totalRaceTime)}\n`);

  console.log('Pit Stops:');
  result.pitStops.forEach((stop, index) => {
    console.log(`  Stop ${index + 1}: Lap ${stop.lap}`);
    console.log(`    ${stop.fromCompound} → ${stop.toCompound}`);
    console.log(`    Time Loss: ${stop.duration.toFixed(3)}s\n`);
  });

  console.log('Lap Time Analysis:');
  console.log(`  Average: ${result.averageLapTime.toFixed(3)}s`);
  console.log(`  Fastest: ${result.fastestLap.toFixed(3)}s`);
  console.log(`  Slowest: ${result.slowestLap.toFixed(3)}s\n`);

  // Show tire stint performance
  console.log('Stint Performance:');
  let currentStint = 1;
  let stintStart = 0;

  result.pitStops.forEach((stop) => {
    const stintLaps = result.laps.slice(stintStart, stop.lap);
    const avgStintTime = stintLaps.reduce((sum, lap) => sum + lap.lapTime, 0) / stintLaps.length;

    console.log(`  Stint ${currentStint}: Laps ${stintStart + 1}-${stop.lap}`);
    console.log(`    Compound: ${stintLaps[0]?.tireCompound || 'N/A'}`);
    console.log(`    Average: ${avgStintTime.toFixed(3)}s\n`);

    currentStint++;
    stintStart = stop.lap;
  });

  // Final stint
  const finalStint = result.laps.slice(stintStart);
  const avgFinalStint = finalStint.reduce((sum, lap) => sum + lap.lapTime, 0) / finalStint.length;
  console.log(`  Stint ${currentStint}: Laps ${stintStart + 1}-${raceConfig.totalLaps}`);
  console.log(`    Compound: ${finalStint[0]?.tireCompound || 'N/A'}`);
  console.log(`    Average: ${avgFinalStint.toFixed(3)}s\n`);

  return result;
}

/**
 * Example 3: Create and test a custom strategy
 */
export function exampleCustomStrategy() {
  console.log('=== Example 3: Custom Strategy Testing ===\n');

  const raceConfig = createDefaultRaceConfig('Silverstone', 52);

  // Create three custom strategies to compare
  const strategies: Strategy[] = [
    {
      name: 'Aggressive: Early Stop',
      startingCompound: 'SOFT',
      pitStops: [{ lap: 15, tireCompound: 'HARD' }],
    },
    {
      name: 'Conservative: Late Stop',
      startingCompound: 'MEDIUM',
      pitStops: [{ lap: 35, tireCompound: 'MEDIUM' }],
    },
    {
      name: 'Balanced: Mid-Race Stop',
      startingCompound: 'MEDIUM',
      pitStops: [{ lap: 26, tireCompound: 'HARD' }],
    },
  ];

  const comparison = compareStrategies(strategies, raceConfig);

  console.log(`Track: ${raceConfig.trackName} (${raceConfig.totalLaps} laps)\n`);
  console.log('Strategy Comparison:\n');

  strategies.forEach((strategy) => {
    const result = comparison.strategies.find(
      (r) => r.strategy.name === strategy.name
    );
    if (!result) return;

    const delta = comparison.timeDifferences.get(strategy.name) || 0;
    const isWinner = result === comparison.winner;

    console.log(`${strategy.name}:`);
    console.log(`  Time: ${formatRaceTime(result.totalRaceTime)} ${isWinner ? '🏆 WINNER' : `(${formatTimeDelta(delta)})`}`);
    console.log(`  Pit: Lap ${strategy.pitStops[0].lap} (${strategy.startingCompound} → ${strategy.pitStops[0].tireCompound})`);
    console.log(`  Avg Lap: ${result.averageLapTime.toFixed(3)}s\n`);
  });

  return comparison;
}

/**
 * Example 4: Analyze tire degradation impact
 */
export function exampleTireDegradation() {
  console.log('=== Example 4: Tire Degradation Analysis ===\n');

  const raceConfig = createDefaultRaceConfig('Spa-Francorchamps', 44);

  // Compare same strategy with different compounds
  const strategies: Strategy[] = [
    {
      name: 'All Soft Tires',
      startingCompound: 'SOFT',
      pitStops: [
        { lap: 15, tireCompound: 'SOFT' },
        { lap: 30, tireCompound: 'SOFT' },
      ],
    },
    {
      name: 'All Medium Tires',
      startingCompound: 'MEDIUM',
      pitStops: [
        { lap: 15, tireCompound: 'MEDIUM' },
        { lap: 30, tireCompound: 'MEDIUM' },
      ],
    },
    {
      name: 'All Hard Tires',
      startingCompound: 'HARD',
      pitStops: [{ lap: 22, tireCompound: 'HARD' }],
    },
  ];

  const comparison = compareStrategies(strategies, raceConfig);

  console.log('Compound Performance Comparison:\n');

  comparison.strategies.forEach((result) => {
    const delta = comparison.timeDifferences.get(result.strategy.name) || 0;

    console.log(`${result.strategy.name}:`);
    console.log(`  Total Time: ${formatRaceTime(result.totalRaceTime)} (${formatTimeDelta(delta)})`);
    console.log(`  Pit Stops: ${result.pitStops.length}`);
    console.log(`  Avg Lap: ${result.averageLapTime.toFixed(3)}s`);
    console.log(`  Fastest: ${result.fastestLap.toFixed(3)}s`);
    console.log(`  Slowest: ${result.slowestLap.toFixed(3)}s\n`);
  });

  return comparison;
}

// Run examples if this file is executed directly
if (require.main === module) {
  console.log('\n🏎️  F1 Strategy Simulator - Examples\n');
  console.log('='.repeat(60) + '\n');

  exampleBasicComparison();
  console.log('\n' + '='.repeat(60) + '\n');

  exampleDetailedAnalysis();
  console.log('\n' + '='.repeat(60) + '\n');

  exampleCustomStrategy();
  console.log('\n' + '='.repeat(60) + '\n');

  exampleTireDegradation();
}
