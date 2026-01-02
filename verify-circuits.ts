/**
 * Verify tire model works correctly across different circuits
 * Tests that degradation scales properly with different base lap times
 */

import { createTireState, ageTire, getTireTimePenalty } from './lib/tireModel';
import { getBaseLapTime, getTotalLaps } from './lib/raceData';
import { calculateRaceLapTime } from './lib/lapTimeCalculator';
import { RaceConfiguration } from './lib/types';

// Test circuits with different characteristics
const testCircuits = [
  'Monaco Grand Prix',       // Shortest lap time (~1:12)
  'Bahrain Grand Prix',      // Medium lap time (~1:30)
  'Belgian Grand Prix',      // Longest lap time (~1:46)
  'Austrian Grand Prix',     // Very short lap time (~1:06)
  'Singapore Grand Prix',    // Long street circuit (~1:37)
];

console.log('='.repeat(120));
console.log('TIRE MODEL VERIFICATION ACROSS DIFFERENT CIRCUITS');
console.log('='.repeat(120));
console.log();

testCircuits.forEach(circuit => {
  const baseLapTime = getBaseLapTime(circuit);
  const totalLaps = getTotalLaps(circuit);

  const config: RaceConfiguration = {
    trackName: circuit,
    baseLapTime,
    totalLaps,
    pitLaneTimeLoss: 20.0,
    pitStopStationary: 2.2,
    startingFuelLoad: 110,
    fuelPerLap: 1.9,
    fuelEffect: 0.035,
  };

  console.log(`\n${'─'.repeat(120)}`);
  console.log(`CIRCUIT: ${circuit}`);
  console.log(`${'─'.repeat(120)}`);
  console.log(`Base Lap Time: ${baseLapTime.toFixed(3)}s (${Math.floor(baseLapTime / 60)}:${(baseLapTime % 60).toFixed(3).padStart(6, '0')})`);
  console.log(`Total Laps: ${totalLaps}`);
  console.log();

  // Test 20-lap stint on MEDIUM tires
  let tireState = createTireState('MEDIUM', 0, 1.0);

  const lap1Time = calculateRaceLapTime(1, tireState, config, false);
  tireState = ageTire(tireState, 1.0); // Age to lap 1
  const lap2Time = calculateRaceLapTime(2, tireState, config, false);

  // Age to lap 3
  tireState = ageTire(tireState, 1.0);
  tireState = ageTire(tireState, 1.0);
  const lap4Time = calculateRaceLapTime(4, tireState, config, false);

  // Age to lap 9
  for (let i = 0; i < 6; i++) {
    tireState = ageTire(tireState, 1.0);
  }
  const lap10Time = calculateRaceLapTime(10, tireState, config, false);

  // Age to lap 19
  for (let i = 0; i < 10; i++) {
    tireState = ageTire(tireState, 1.0);
  }
  const lap20Time = calculateRaceLapTime(20, tireState, config, false);

  // Calculate deltas
  const warmUpDelta = lap1Time - lap2Time;
  const degToLap10 = lap10Time - lap4Time;
  const degToLap20 = lap20Time - lap4Time;

  console.log(`  Lap 1:  ${lap1Time.toFixed(3)}s (warm-up)`);
  console.log(`  Lap 2:  ${lap2Time.toFixed(3)}s (fastest, ${warmUpDelta >= 0 ? '-' : '+'}${Math.abs(warmUpDelta).toFixed(3)}s)`);
  console.log(`  Lap 4:  ${lap4Time.toFixed(3)}s (peak)`);
  console.log(`  Lap 10: ${lap10Time.toFixed(3)}s (+${degToLap10.toFixed(3)}s deg)`);
  console.log(`  Lap 20: ${lap20Time.toFixed(3)}s (+${degToLap20.toFixed(3)}s deg)`);
  console.log();

  // Check percentages (should be similar across circuits)
  const warmUpPercent = (warmUpDelta / baseLapTime) * 100;
  const deg10Percent = (degToLap10 / baseLapTime) * 100;
  const deg20Percent = (degToLap20 / baseLapTime) * 100;

  console.log(`  Warm-up effect: ${warmUpPercent.toFixed(3)}% of base lap time`);
  console.log(`  Deg to lap 10:  ${deg10Percent.toFixed(3)}% of base lap time`);
  console.log(`  Deg to lap 20:  ${deg20Percent.toFixed(3)}% of base lap time`);

  // Validation
  const hasWarmUp = lap1Time > lap2Time;
  const hasDegradation = lap20Time > lap4Time;

  if (hasWarmUp && hasDegradation) {
    console.log(`  ✓ Tire model working correctly`);
  } else {
    console.log(`  ✗ WARNING: Unexpected tire behavior!`);
  }
});

console.log();
console.log('='.repeat(120));
console.log('SUMMARY');
console.log('='.repeat(120));
console.log();
console.log('KEY FINDINGS:');
console.log('  1. Warm-up penalty should be ~0.2-0.3% across all circuits');
console.log('  2. Degradation percentages should be consistent (absolute times will differ)');
console.log('  3. All circuits should show: Lap 1 > Lap 2, Lap 20 > Lap 4');
console.log();
console.log('If percentages vary significantly, the tire model may need circuit-specific tuning.');
console.log('='.repeat(120));
