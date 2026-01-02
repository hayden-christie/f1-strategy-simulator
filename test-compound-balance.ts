/**
 * Test to verify tire compound speed differences are realistic
 */

import { simulateRace, createDefaultRaceConfig } from './lib/raceSimulator';
import { Strategy } from './lib/types';

console.log('═══════════════════════════════════════════════════════════');
console.log('  TIRE COMPOUND BALANCE TEST - BAHRAIN GP');
console.log('═══════════════════════════════════════════════════════════\n');

const config = createDefaultRaceConfig('Bahrain Grand Prix', 57);
config.baseLapTime = 90.0;
config.pitLaneTimeLoss = 20.0;
config.pitStopStationary = 2.2;
config.fuelEffect = 0.025;

// Test 1: No-stop strategies on different compounds
console.log('📊 TEST 1: NO-STOP STRATEGIES (Pure Compound Comparison)\n');

const noStopSoft: Strategy = {
  name: 'No-Stop: Soft Only',
  startingCompound: 'SOFT',
  pitStops: [],
};

const noStopMedium: Strategy = {
  name: 'No-Stop: Medium Only',
  startingCompound: 'MEDIUM',
  pitStops: [],
};

const noStopHard: Strategy = {
  name: 'No-Stop: Hard Only',
  startingCompound: 'HARD',
  pitStops: [],
};

const softResult = simulateRace(noStopSoft, config);
const mediumResult = simulateRace(noStopMedium, config);
const hardResult = simulateRace(noStopHard, config);

console.log('No-Stop SOFT:');
console.log(`  Total Time: ${softResult.totalRaceTime.toFixed(3)}s`);
console.log(`  Average Lap: ${softResult.averageLapTime.toFixed(3)}s`);
console.log(`  Fastest Lap: ${softResult.fastestLap.toFixed(3)}s`);
console.log(`  Slowest Lap: ${softResult.slowestLap.toFixed(3)}s`);

console.log('\nNo-Stop MEDIUM:');
console.log(`  Total Time: ${mediumResult.totalRaceTime.toFixed(3)}s`);
console.log(`  Average Lap: ${mediumResult.averageLapTime.toFixed(3)}s`);
console.log(`  Fastest Lap: ${mediumResult.fastestLap.toFixed(3)}s`);
console.log(`  Slowest Lap: ${mediumResult.slowestLap.toFixed(3)}s`);
console.log(`  Delta vs SOFT: +${(mediumResult.totalRaceTime - softResult.totalRaceTime).toFixed(3)}s`);

console.log('\nNo-Stop HARD:');
console.log(`  Total Time: ${hardResult.totalRaceTime.toFixed(3)}s`);
console.log(`  Average Lap: ${hardResult.averageLapTime.toFixed(3)}s`);
console.log(`  Fastest Lap: ${hardResult.fastestLap.toFixed(3)}s`);
console.log(`  Slowest Lap: ${hardResult.slowestLap.toFixed(3)}s`);
console.log(`  Delta vs SOFT: +${(hardResult.totalRaceTime - softResult.totalRaceTime).toFixed(3)}s`);

// Expected realistic differences:
// SOFT fastest but degrades most
// MEDIUM ~10s slower total (0.18s/lap × 57 = ~10s base + degradation)
// HARD ~20s slower total (0.36s/lap × 57 = ~20s base + less degradation)

console.log('\n📈 ANALYSIS:');
console.log('  Expected differences (base compound speed only):');
console.log('    MEDIUM: ~10s slower than SOFT (0.18s × 57 laps)');
console.log('    HARD: ~20s slower than SOFT (0.36s × 57 laps)');
console.log('\n  Actual differences (compound + degradation):');
console.log(`    MEDIUM: ${(mediumResult.totalRaceTime - softResult.totalRaceTime).toFixed(1)}s slower`);
console.log(`    HARD: ${(hardResult.totalRaceTime - softResult.totalRaceTime).toFixed(1)}s slower`);

console.log('\n═══════════════════════════════════════════════════════════\n');
