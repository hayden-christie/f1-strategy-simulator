/**
 * Debug script to analyze pit stop time differences
 * Comparing 1-stop vs 3-stop strategies at Bahrain
 */

import { simulateRace, createDefaultRaceConfig } from './lib/raceSimulator';
import { Strategy } from './lib/types';

console.log('═══════════════════════════════════════════════════════════');
console.log('  PIT STOP TIME ANALYSIS - BAHRAIN GP (57 LAPS)');
console.log('═══════════════════════════════════════════════════════════\n');

// Bahrain configuration
const config = createDefaultRaceConfig('Bahrain Grand Prix', 57);
config.baseLapTime = 90.0;
config.pitLaneTimeLoss = 20.0;
config.pitStopStationary = 2.2;
config.fuelEffect = 0.025; // Reduced from 0.035

console.log('📋 RACE CONFIGURATION:');
console.log(`  Base Lap Time: ${config.baseLapTime}s`);
console.log(`  Total Laps: ${config.totalLaps}`);
console.log(`  Pit Lane Time Loss: ${config.pitLaneTimeLoss}s`);
console.log(`  Pit Stop Stationary: ${config.pitStopStationary}s`);
console.log(`  TOTAL PIT STOP COST: ${config.pitLaneTimeLoss + config.pitStopStationary}s per stop\n`);

// Strategy 1: One-stop
const oneStop: Strategy = {
  name: 'One-Stop: Medium → Hard',
  startingCompound: 'MEDIUM',
  pitStops: [{ lap: 29, tireCompound: 'HARD' }],
};

// Strategy 2: Three-stop
const threeStop: Strategy = {
  name: 'Three-Stop: Soft → Soft → Soft → Soft',
  startingCompound: 'SOFT',
  pitStops: [
    { lap: 14, tireCompound: 'SOFT' },
    { lap: 28, tireCompound: 'SOFT' },
    { lap: 42, tireCompound: 'SOFT' },
  ],
};

// Simulate both strategies
console.log('⏱️  RUNNING SIMULATIONS...\n');

const oneStopResult = simulateRace(oneStop, config);
const threeStopResult = simulateRace(threeStop, config);

// ═════════════════════════════════════════════════════════════
// DETAILED BREAKDOWN
// ═════════════════════════════════════════════════════════════

console.log('═══════════════════════════════════════════════════════════');
console.log('  STRATEGY 1: ONE-STOP (Medium → Hard)');
console.log('═══════════════════════════════════════════════════════════\n');

// Calculate pit stop time
const oneStopPitTime = oneStopResult.pitStops.reduce(
  (sum, ps) => sum + ps.duration,
  0
);

// Calculate racing time (non-pit laps)
const oneStopRacingLaps = oneStopResult.laps.filter((lap) => !lap.isPitLap);
const oneStopRacingTime = oneStopRacingLaps.reduce(
  (sum, lap) => sum + lap.lapTime,
  0
);

console.log('📊 PIT STOP BREAKDOWN:');
console.log(`  Number of Pit Stops: ${oneStopResult.pitStops.length}`);
console.log(`  Pit Stop Laps: ${oneStopResult.pitStops.map((ps) => ps.lap).join(', ')}`);
console.log(`  Total Pit Stop Time: ${oneStopPitTime.toFixed(3)}s\n`);

console.log('🏎️  STINT BREAKDOWN:');
const oneStopStints = [
  { name: 'Stint 1 (MEDIUM)', laps: oneStopRacingLaps.slice(0, 28) },
  { name: 'Stint 2 (HARD)', laps: oneStopRacingLaps.slice(28) },
];

oneStopStints.forEach((stint) => {
  const stintTime = stint.laps.reduce((sum, lap) => sum + lap.lapTime, 0);
  const avgLap = stintTime / stint.laps.length;
  const firstLap = stint.laps[0];
  const lastLap = stint.laps[stint.laps.length - 1];
  const degradation = lastLap.lapTime - firstLap.lapTime;

  console.log(`\n  ${stint.name}:`);
  console.log(`    Laps: ${stint.laps.length}`);
  console.log(`    First Lap: ${firstLap.lapTime.toFixed(3)}s (Lap ${firstLap.lapNumber})`);
  console.log(`    Last Lap: ${lastLap.lapTime.toFixed(3)}s (Lap ${lastLap.lapNumber})`);
  console.log(`    Average Lap: ${avgLap.toFixed(3)}s`);
  console.log(`    Total Degradation: ${degradation.toFixed(3)}s (from first to last)`);
  console.log(`    Stint Total Time: ${stintTime.toFixed(3)}s`);
});

console.log('\n⏱️  TOTAL TIMES:');
console.log(`  Racing Time (non-pit laps): ${oneStopRacingTime.toFixed(3)}s`);
console.log(`  Pit Stop Time: ${oneStopPitTime.toFixed(3)}s`);
console.log(`  TOTAL RACE TIME: ${oneStopResult.totalRaceTime.toFixed(3)}s`);
console.log(`  (Verify: ${(oneStopRacingTime + oneStopPitTime).toFixed(3)}s)\n`);

console.log('═══════════════════════════════════════════════════════════');
console.log('  STRATEGY 2: THREE-STOP (Soft → Soft → Soft → Soft)');
console.log('═══════════════════════════════════════════════════════════\n');

// Calculate pit stop time
const threeStopPitTime = threeStopResult.pitStops.reduce(
  (sum, ps) => sum + ps.duration,
  0
);

// Calculate racing time (non-pit laps)
const threeStopRacingLaps = threeStopResult.laps.filter((lap) => !lap.isPitLap);
const threeStopRacingTime = threeStopRacingLaps.reduce(
  (sum, lap) => sum + lap.lapTime,
  0
);

console.log('📊 PIT STOP BREAKDOWN:');
console.log(`  Number of Pit Stops: ${threeStopResult.pitStops.length}`);
console.log(`  Pit Stop Laps: ${threeStopResult.pitStops.map((ps) => ps.lap).join(', ')}`);
console.log(`  Total Pit Stop Time: ${threeStopPitTime.toFixed(3)}s\n`);

console.log('🏎️  STINT BREAKDOWN:');
const threeStopStints = [
  { name: 'Stint 1 (SOFT)', laps: threeStopRacingLaps.slice(0, 13) },
  { name: 'Stint 2 (SOFT)', laps: threeStopRacingLaps.slice(13, 27) },
  { name: 'Stint 3 (SOFT)', laps: threeStopRacingLaps.slice(27, 41) },
  { name: 'Stint 4 (SOFT)', laps: threeStopRacingLaps.slice(41) },
];

threeStopStints.forEach((stint) => {
  const stintTime = stint.laps.reduce((sum, lap) => sum + lap.lapTime, 0);
  const avgLap = stintTime / stint.laps.length;
  const firstLap = stint.laps[0];
  const lastLap = stint.laps[stint.laps.length - 1];
  const degradation = lastLap.lapTime - firstLap.lapTime;

  console.log(`\n  ${stint.name}:`);
  console.log(`    Laps: ${stint.laps.length}`);
  console.log(`    First Lap: ${firstLap.lapTime.toFixed(3)}s (Lap ${firstLap.lapNumber})`);
  console.log(`    Last Lap: ${lastLap.lapTime.toFixed(3)}s (Lap ${lastLap.lapNumber})`);
  console.log(`    Average Lap: ${avgLap.toFixed(3)}s`);
  console.log(`    Total Degradation: ${degradation.toFixed(3)}s (from first to last)`);
  console.log(`    Stint Total Time: ${stintTime.toFixed(3)}s`);
});

console.log('\n⏱️  TOTAL TIMES:');
console.log(`  Racing Time (non-pit laps): ${threeStopRacingTime.toFixed(3)}s`);
console.log(`  Pit Stop Time: ${threeStopPitTime.toFixed(3)}s`);
console.log(`  TOTAL RACE TIME: ${threeStopResult.totalRaceTime.toFixed(3)}s`);
console.log(`  (Verify: ${(threeStopRacingTime + threeStopPitTime).toFixed(3)}s)\n`);

// ═════════════════════════════════════════════════════════════
// COMPARISON
// ═════════════════════════════════════════════════════════════

console.log('═══════════════════════════════════════════════════════════');
console.log('  DIRECT COMPARISON');
console.log('═══════════════════════════════════════════════════════════\n');

const pitTimeDifference = threeStopPitTime - oneStopPitTime;
const racingTimeDifference = threeStopRacingTime - oneStopRacingTime;
const totalTimeDifference = threeStopResult.totalRaceTime - oneStopResult.totalRaceTime;

console.log('⏱️  TIME BREAKDOWN:');
console.log('\n  Pit Stop Times:');
console.log(`    1-Stop: ${oneStopPitTime.toFixed(3)}s (${oneStopResult.pitStops.length} stops × 22.2s)`);
console.log(`    3-Stop: ${threeStopPitTime.toFixed(3)}s (${threeStopResult.pitStops.length} stops × 22.2s)`);
console.log(`    Difference: +${pitTimeDifference.toFixed(3)}s (3-stop loses this much in pits)`);

console.log('\n  Racing Times (non-pit laps):');
console.log(`    1-Stop: ${oneStopRacingTime.toFixed(3)}s`);
console.log(`    3-Stop: ${threeStopRacingTime.toFixed(3)}s`);
console.log(`    Difference: ${racingTimeDifference >= 0 ? '+' : ''}${racingTimeDifference.toFixed(3)}s`);

console.log('\n  Total Race Times:');
console.log(`    1-Stop: ${oneStopResult.totalRaceTime.toFixed(3)}s`);
console.log(`    3-Stop: ${threeStopResult.totalRaceTime.toFixed(3)}s`);
console.log(`    Difference: ${totalTimeDifference >= 0 ? '+' : ''}${totalTimeDifference.toFixed(3)}s`);

console.log('\n📈 WHERE DOES THE PIT TIME GO?');
console.log(`    3-stop loses: ${pitTimeDifference.toFixed(3)}s in extra pit stops`);
console.log(`    3-stop gains: ${(-racingTimeDifference).toFixed(3)}s from fresher tires`);
console.log(`    Net effect: ${totalTimeDifference >= 0 ? '+' : ''}${totalTimeDifference.toFixed(3)}s`);

console.log('\n🔍 ANALYSIS:');
if (Math.abs(totalTimeDifference) < 15) {
  console.log('  ⚠️  WARNING: 3-stop is only ~10s slower than 1-stop!');
  console.log('  This suggests:');
  console.log('    1. Tire degradation may be too aggressive');
  console.log('    2. Fresh tire benefit is offsetting pit stop cost too much');
  console.log('    3. The 1-stop strategy may be getting unrealistically slow');
} else if (totalTimeDifference > 30) {
  console.log('  ✅ REALISTIC: 3-stop is 30+ seconds slower');
  console.log('  This makes sense because:');
  console.log('    - 2 extra pit stops = ~44s lost');
  console.log('    - Fresher tires save some time but not enough');
} else {
  console.log(`  3-stop is ${totalTimeDifference.toFixed(1)}s slower - marginally realistic`);
}

console.log('\n═══════════════════════════════════════════════════════════\n');
